import { Form, Link, redirect, useLoaderData } from "react-router";
import {
  Archive,
  ArrowLeft,
  AtSign,
  CalendarCheck,
  Check,
  Clipboard,
  ExternalLink,
  LinkIcon,
  MessageSquareReply,
  RefreshCw,
  Save,
  Send,
  Undo2,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import type { Route } from "./+types/prospect.$id";
import {
  getProspectDetail,
  runProspectAction,
  type Prospect,
  type Reply,
  type Task,
} from "~/lib/outreach.server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { statusVariant } from "~/components/prospects/status-badge";
import { cn } from "~/lib/utils";

export const meta: Route.MetaFunction = ({ data }) => {
  const name = data?.detail?.prospect?.name || "Prospect";
  return [{ title: `${name} · Tempolis Outreach` }];
};

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);
  const detail = await getProspectDetail(id);
  if (!detail) {
    throw new Response("Prospect not found", { status: 404 });
  }
  return { detail };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  await runProspectAction(formData);
  if (String(formData.get("intent") || "") === "deleteProspect") {
    return redirect("/");
  }
  return redirect(`/prospects/${params.id}`);
}

export default function ProspectDetail() {
  const { detail } = useLoaderData<typeof loader>();
  const { prospect, tasks, events, replies, today } = detail;
  const openTasks = tasks.filter((task) => task.status === "open");
  const doneTasks = tasks.filter((task) => task.status !== "open");
  const showConnectionNote =
    prospect.outreach_mode !== "no_note" || prospect.connection_note_sent === 1;
  const connectionLocked = Boolean(prospect.connection_sent_date);
  const reportLocked = Boolean(prospect.report_sent_date);
  const archiveMode =
    Boolean(prospect.report_sent_date) ||
    ["reply_sent", "followup_sent"].includes(prospect.status);

  const defaultOpen = [
    prospect.source_channel === "linkedin" && !archiveMode ? "outreach-mode" : null,
    !archiveMode ? "brief" : null,
    !archiveMode ? "messages" : null,
    prospect.notes ? "notes" : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <Button asChild variant="ghost" size="sm" className="-ml-3">
              <Link to="/">
                <ArrowLeft className="size-4" />
                Dashboard
              </Link>
            </Button>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{prospect.name}</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{prospect.position}</p>
            <a
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              href={prospect.twitter_url || prospect.profile_url}
              target="_blank"
              rel="noreferrer"
            >
              {prospect.source_channel === "twitter" ? "X profile" : "LinkedIn profile"}
              <ExternalLink className="size-3.5" />
            </a>
          </div>
          <div className="flex flex-wrap items-start gap-2">
            {prospect.priority_tag ? (
              <Badge variant="muted">{prospect.priority_tag}</Badge>
            ) : null}
            <Badge variant="muted">Wave {prospect.wave || "-"}</Badge>
            <Badge variant="info">
              {prospect.source_channel === "twitter" ? "Twitter/X" : "LinkedIn"}
            </Badge>
            <Badge variant={prospect.outreach_mode === "no_note" ? "info" : "success"}>
              {outreachModeLabel(prospect)}
            </Badge>
            <Badge variant={statusVariant(prospect.status)}>{prospect.status}</Badge>
            <ArchiveControls prospect={prospect} />
            <DeleteProspectButton prospect={prospect} />
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions in progress</CardTitle>
                <p className="text-sm text-muted-foreground">Do these from top to bottom.</p>
              </CardHeader>
              <CardContent className="grid gap-3">
                {openTasks.length ? (
                  openTasks.map((task) => (
                    <OpenTask key={task.id} task={task} prospect={prospect} today={today} />
                  ))
                ) : (
                  <EmptyState />
                )}
              </CardContent>
            </Card>

            <Accordion type="multiple" defaultValue={defaultOpen} className="space-y-4">
              {prospect.source_channel === "linkedin" ? (
                <SectionAccordion
                  value="outreach-mode"
                  title="Outreach mode"
                  detail="Switch the copy strategy before sending."
                >
                  <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
                    <div>
                      <p className="font-semibold">{outreachModeLabel(prospect)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {prospect.outreach_mode === "no_note"
                          ? "The request goes out without a custom note. The first real message is generated for after acceptance."
                          : "The current sequence assumes a custom connection note that tees up the brief."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <ActionButton
                        intent="generateNoNoteMode"
                        prospectId={prospect.id}
                        label="Generate no-note mode"
                        icon={<RefreshCw size={16} />}
                        variant={prospect.outreach_mode !== "no_note" ? "default" : "outline"}
                      />
                      <ActionButton
                        intent="switchToWithNoteMode"
                        prospectId={prospect.id}
                        label="Use with-note mode"
                        icon={<Send size={16} />}
                        variant={prospect.outreach_mode === "no_note" ? "default" : "outline"}
                      />
                    </div>
                  </div>
                </SectionAccordion>
              ) : null}

              <SectionAccordion
                value="brief"
                title="Brief"
                detail="Topic, preparation notes and shared URL."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Form method="post" className="space-y-3">
                    <input type="hidden" name="intent" value="updateBriefStrategy" />
                    <input type="hidden" name="prospectId" value={prospect.id} />
                    <div className="space-y-2">
                      <Label htmlFor="briefTopic">Topic</Label>
                      <Input
                        id="briefTopic"
                        name="briefTopic"
                        defaultValue={prospect.brief_topic || ""}
                        required
                        maxLength={80}
                        placeholder="Narrative risk"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="briefPreparation">Preparation notes</Label>
                      <Textarea
                        id="briefPreparation"
                        name="briefPreparation"
                        defaultValue={prospect.preparation_notes || ""}
                        rows={4}
                        placeholder="Why this subject fits the profile, source signal, angle to prepare..."
                      />
                    </div>
                    <Button type="submit" variant="outline" size="sm">
                      <Save className="size-4" />
                      Save brief theme
                    </Button>
                  </Form>
                  <div className="space-y-2">
                    <Label>Shared URL</Label>
                    {prospect.shared_url ? (
                      <a
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        href={prospect.shared_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {prospect.shared_url}
                        <ExternalLink className="size-3.5" />
                      </a>
                    ) : (
                      <Form method="post" className="flex gap-2">
                        <input type="hidden" name="intent" value="addBriefUrl" />
                        <input type="hidden" name="prospectId" value={prospect.id} />
                        <Input
                          name="sharedUrl"
                          type="url"
                          required
                          placeholder="https://tempolis.com/share/..."
                          className="flex-1"
                        />
                        <Button type="submit" variant="outline" size="sm">
                          <LinkIcon className="size-4" />
                          Add URL
                        </Button>
                      </Form>
                    )}
                  </div>
                </div>
              </SectionAccordion>

              <SectionAccordion
                value="messages"
                title="Messages"
                detail={
                  prospect.source_channel === "twitter"
                    ? "Copy exact Twitter/X copy."
                    : "Copy exact LinkedIn copy."
                }
              >
                {prospect.source_channel === "linkedin" ? (
                  <div className="mb-4 flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-3">
                    <ActionButton
                      intent="regenerateSaferCopy"
                      prospectId={prospect.id}
                      label="Regenerate safer copy"
                      icon={<RefreshCw size={16} />}
                      variant="outline"
                    />
                  </div>
                ) : null}
                {prospect.source_channel === "twitter" ? (
                  <div className="grid gap-3">
                    <MessageEditor
                      prospectId={prospect.id}
                      title="Twitter/X DM"
                      type="twitter_dm"
                      content={prospect.twitter_dm_message}
                      locked={Boolean(prospect.twitter_contacted_date)}
                    />
                    <MessageEditor
                      prospectId={prospect.id}
                      title="Twitter/X follow-up J+2"
                      type="twitter_followup"
                      content={prospect.twitter_followup_message}
                      locked={Boolean(prospect.twitter_followup_sent_date)}
                    />
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {showConnectionNote ? (
                      <MessageEditor
                        prospectId={prospect.id}
                        title="Connection note"
                        type="connection"
                        content={prospect.connection_message}
                        locked={connectionLocked}
                      />
                    ) : (
                      <NoNoteCallout />
                    )}
                    <MessageEditor
                      prospectId={prospect.id}
                      title={
                        prospect.outreach_mode === "no_note"
                          ? "First message after acceptance"
                          : "After acceptance"
                      }
                      type={prospect.outreach_mode === "no_note" ? "report_no_note" : "report"}
                      content={prospect.post_acceptance_message}
                      locked={reportLocked}
                    />
                    <MessageEditor
                      prospectId={prospect.id}
                      title="Follow-up J+2"
                      type="followup"
                      content={prospect.followup_message}
                    />
                  </div>
                )}
              </SectionAccordion>
            </Accordion>

            <Card>
              <CardHeader>
                <CardTitle>Reply handling</CardTitle>
                <p className="text-sm text-muted-foreground">
                  If Marc replies, paste it here and answer instead of following up.
                </p>
              </CardHeader>
              <CardContent>
                <ReplyPanel prospect={prospect} replies={replies} />
              </CardContent>
            </Card>

            <Accordion type="multiple" defaultValue={defaultOpen}>
              <SectionAccordion value="notes" title="Internal note" detail="Small private CRM note.">
                <Form method="post" className="space-y-3">
                  <input type="hidden" name="intent" value="updateProspectNotes" />
                  <input type="hidden" name="prospectId" value={prospect.id} />
                  {prospect.notes ? (
                    <div className="rounded-md border bg-muted/30 p-3 text-sm">
                      <p className="whitespace-pre-wrap">{prospect.notes}</p>
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Note</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      defaultValue={prospect.notes || ""}
                      rows={3}
                      placeholder="Tiny internal note, context, next angle..."
                    />
                  </div>
                  <Button type="submit" variant="outline" size="sm">
                    <Save className="size-4" />
                    Save note
                  </Button>
                </Form>
              </SectionAccordion>
            </Accordion>

            <Card>
              <CardHeader>
                <CardTitle>Past and future</CardTitle>
                <p className="text-sm text-muted-foreground">Task history for this prospect.</p>
              </CardHeader>
              <CardContent className="grid gap-3">
                {tasks.length ? (
                  tasks.map((task) => <TaskRow key={task.id} task={task} today={today} />)
                ) : (
                  <EmptyState />
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="h-fit lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <p className="text-sm text-muted-foreground">Actions already logged.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {events.length ? (
                  events.map((event) => (
                    <div key={event.id} className="border-l-2 border-primary pl-3">
                      <p className="font-medium">{event.type}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{event.note}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{event.happened_at}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState />
                )}

                {doneTasks.length ? (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold">Completed tasks</h3>
                    <div className="mt-3 grid gap-2">
                      {doneTasks.map((task) => (
                        <TaskRow key={task.id} task={task} today={today} compact />
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SectionAccordion({
  value,
  title,
  detail,
  children,
}: {
  value: string;
  title: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem value={value} className="overflow-hidden rounded-lg border bg-card">
      <AccordionTrigger className="px-5 py-4 hover:no-underline">
        <div className="flex flex-col gap-1 text-left sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm font-normal text-muted-foreground">{detail}</p>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-5 pb-5 pt-0">{children}</AccordionContent>
    </AccordionItem>
  );
}

function OpenTask({ task, prospect, today }: { task: Task; prospect: Prospect; today: string }) {
  const overdue = task.due_date && task.due_date < today;
  return (
    <div
      className={cn(
        "rounded-lg border bg-muted/30 p-4",
        overdue && "border-amber-500/70 dark:border-amber-400/70",
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">{task.title}</p>
          <p className="text-sm text-muted-foreground">
            {task.due_date ? `Due ${task.due_date}` : "No due date"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">{taskActions(task, prospect)}</div>
      </div>
    </div>
  );
}

function taskActions(task: Task, prospect: Prospect) {
  if (task.type === "send_connection") {
    if (prospect.outreach_mode === "no_note") {
      return (
        <>
          <ActionButton
            intent="markConnectionSentWithoutNote"
            prospectId={prospect.id}
            label="Sent without note"
            icon={<UserCheck size={16} />}
            variant="default"
          />
          <CopyButton label="Copy note" value={prospect.connection_message || ""} />
          <ActionButton
            intent="markConnectionSentWithNote"
            prospectId={prospect.id}
            label="Sent with note"
            icon={<Send size={16} />}
            variant="outline"
          />
        </>
      );
    }
    return (
      <>
        <CopyButton label="Copy note" value={prospect.connection_message || ""} />
        <ActionButton
          intent="markConnectionSentWithNote"
          prospectId={prospect.id}
          label="Sent with note"
          icon={<Send size={16} />}
          variant="default"
        />
        <ActionButton
          intent="markConnectionSentWithoutNote"
          prospectId={prospect.id}
          label="Sent without note"
          icon={<UserCheck size={16} />}
          variant="outline"
        />
      </>
    );
  }
  if (task.type === "watch_acceptance") {
    return (
      <>
        <ActionButton
          intent="markAccepted"
          prospectId={prospect.id}
          label="Mark accepted"
          icon={<UserCheck size={16} />}
          variant="default"
        />
        <ActionButton
          intent="archiveDeclined"
          prospectId={prospect.id}
          label="Archive declined"
          icon={<Archive size={16} />}
          variant="destructive"
        />
      </>
    );
  }
  if (task.type === "send_report") {
    return (
      <>
        <CopyButton label="Copy message" value={prospect.post_acceptance_message || ""} />
        <ActionButton
          intent="markReportSent"
          prospectId={prospect.id}
          label="Mark sent"
          icon={<Check size={16} />}
          variant="default"
        />
      </>
    );
  }
  if (task.type === "send_followup") {
    return (
      <>
        <CopyButton label="Copy follow-up" value={prospect.followup_message || ""} />
        <ActionButton
          intent="markFollowupSent"
          prospectId={prospect.id}
          label="Mark sent"
          icon={<CalendarCheck size={16} />}
          variant="default"
        />
      </>
    );
  }
  if (task.type === "send_twitter_dm") {
    return (
      <>
        <CopyButton label="Copy DM" value={prospect.twitter_dm_message || ""} />
        <Button asChild variant="outline" size="sm">
          <a
            href={prospect.twitter_url || prospect.profile_url}
            target="_blank"
            rel="noreferrer"
          >
            <AtSign className="size-4" />
            Open X
          </a>
        </Button>
        <ActionButton
          intent="markTwitterDmSent"
          prospectId={prospect.id}
          label="Mark DM sent"
          icon={<Send size={16} />}
          variant="default"
        />
      </>
    );
  }
  if (task.type === "send_twitter_followup") {
    return (
      <>
        <CopyButton label="Copy follow-up" value={prospect.twitter_followup_message || ""} />
        <Button asChild variant="outline" size="sm">
          <a
            href={prospect.twitter_url || prospect.profile_url}
            target="_blank"
            rel="noreferrer"
          >
            <AtSign className="size-4" />
            Open X
          </a>
        </Button>
        <ActionButton
          intent="markTwitterFollowupSent"
          prospectId={prospect.id}
          label="Mark sent"
          icon={<CalendarCheck size={16} />}
          variant="default"
        />
      </>
    );
  }
  return null;
}

function TaskRow({
  task,
  today,
  compact = false,
}: {
  task: Task;
  today: string;
  compact?: boolean;
}) {
  const overdue = task.status === "open" && task.due_date && task.due_date < today;
  return (
    <div
      className={cn(
        "rounded-lg border bg-muted/30",
        compact ? "p-3" : "p-4",
        overdue && "border-amber-500/70 dark:border-amber-400/70",
      )}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium">{task.title}</p>
        <Badge variant={task.status === "open" ? "info" : "success"}>{task.status}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {task.type} {task.due_date ? `· due ${task.due_date}` : ""}{" "}
        {task.completed_at ? `· completed ${task.completed_at}` : ""}
      </p>
    </div>
  );
}

function MessageEditor({
  prospectId,
  title,
  type,
  content,
  locked = false,
}: {
  prospectId: number;
  title: string;
  type: string;
  content: string | null;
  locked?: boolean;
}) {
  if (!content) return null;
  if (locked) return <ReadonlyMessage title={title} content={content} />;
  return (
    <Form method="post" className="rounded-lg border bg-muted/30 p-4">
      <input type="hidden" name="intent" value="updateMessage" />
      <input type="hidden" name="prospectId" value={prospectId} />
      <input type="hidden" name="messageType" value={type} />
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{title}</p>
        <div className="flex gap-2">
          <CopyButton label="Copy" value={content} compact />
          <Button type="submit" variant="outline" size="sm" className="h-8">
            <Save className="size-3.5" />
            Save
          </Button>
        </div>
      </div>
      <Textarea
        name="messageContent"
        defaultValue={content}
        rows={Math.max(3, Math.min(8, content.split("\n").length + 1))}
        className="mt-3"
      />
    </Form>
  );
}

function ReadonlyMessage({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            Sent. Locked to preserve history.
          </p>
        </div>
        <CopyButton label="Copy" value={content} compact />
      </div>
      <p className="mt-2 whitespace-pre-wrap rounded-md border bg-background p-3 text-sm">
        {content}
      </p>
    </div>
  );
}

function ReplyPanel({ prospect, replies }: { prospect: Prospect; replies: Reply[] }) {
  const latest = replies[0];
  return (
    <div className="grid gap-4">
      {latest ? <ReplyEditor prospect={prospect} reply={latest} /> : null}
      <Form method="post" className="rounded-lg border bg-muted/30 p-4">
        <input type="hidden" name="intent" value="addProspectReply" />
        <input type="hidden" name="prospectId" value={prospect.id} />
        <div className="space-y-2">
          <Label htmlFor="inboundContent">Prospect reply</Label>
          <Textarea
            id="inboundContent"
            name="inboundContent"
            rows={4}
            required
            placeholder="Paste the LinkedIn reply here..."
          />
        </div>
        <div className="mt-3 space-y-2">
          <Label htmlFor="suggestedResponse">Draft response</Label>
          <Textarea
            id="suggestedResponse"
            name="suggestedResponse"
            rows={4}
            placeholder="Optional. Leave empty and the app will create a lightweight fallback."
          />
        </div>
        <Button type="submit" className="mt-3">
          <MessageSquareReply className="size-4" />
          Save reply
        </Button>
      </Form>
    </div>
  );
}

function ReplyEditor({ prospect, reply }: { prospect: Prospect; reply: Reply }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Latest reply</p>
          <p className="mt-1 text-xs text-muted-foreground">{reply.created_at}</p>
        </div>
        {reply.sent_at ? (
          <Badge variant="success">sent {reply.sent_at}</Badge>
        ) : (
          <Badge variant="info">response draft</Badge>
        )}
      </div>
      <p className="mt-3 whitespace-pre-wrap rounded-md border bg-background p-3 text-sm">
        {reply.inbound_content}
      </p>
      <Form method="post" className="mt-3">
        <input type="hidden" name="intent" value="updateReplyResponse" />
        <input type="hidden" name="prospectId" value={prospect.id} />
        <input type="hidden" name="replyId" value={reply.id} />
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Response to send</p>
          <div className="flex gap-2">
            <CopyButton label="Copy" value={reply.suggested_response || ""} compact />
            <Button type="submit" variant="outline" size="sm" className="h-8">
              <Save className="size-3.5" />
              Save
            </Button>
          </div>
        </div>
        <Textarea
          name="suggestedResponse"
          defaultValue={reply.suggested_response || ""}
          rows={5}
          required
          disabled={Boolean(reply.sent_at)}
          className="mt-2"
        />
      </Form>
      {!reply.sent_at ? (
        <div className="mt-3">
          <ActionButton
            intent="markReplySent"
            prospectId={prospect.id}
            label="Mark response sent"
            icon={<Check size={16} />}
            variant="default"
            extra={{ replyId: String(reply.id) }}
          />
        </div>
      ) : null}
    </div>
  );
}

function NoNoteCallout() {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="text-sm font-semibold">Connection note</p>
      <p className="mt-2 text-sm text-muted-foreground">
        No custom note was sent. Use the first message after acceptance instead.
      </p>
    </div>
  );
}

function outreachModeLabel(prospect: Prospect) {
  if (prospect.source_channel === "twitter") return "Twitter/X";
  if (prospect.status === "to_contact") return "note optional";
  return prospect.outreach_mode === "no_note" ? "no note" : "with note";
}

function ActionButton({
  intent,
  prospectId,
  label,
  icon,
  variant = "outline",
  extra,
}: {
  intent: string;
  prospectId: number;
  label: string;
  icon: React.ReactNode;
  variant?: "default" | "outline" | "destructive" | "secondary";
  extra?: Record<string, string>;
}) {
  return (
    <Form method="post">
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="prospectId" value={prospectId} />
      {extra
        ? Object.entries(extra).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))
        : null}
      <Button type="submit" variant={variant} size="sm">
        {icon}
        {label}
      </Button>
    </Form>
  );
}

function DeleteProspectButton({ prospect }: { prospect: Prospect }) {
  return (
    <Form
      method="post"
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete ${prospect.name} from the outreach database? This cannot be undone.`,
        );
        if (!confirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="intent" value="deleteProspect" />
      <input type="hidden" name="prospectId" value={prospect.id} />
      <Button type="submit" variant="destructive" size="sm">
        Delete
      </Button>
    </Form>
  );
}

function ArchiveControls({ prospect }: { prospect: Prospect }) {
  if (prospect.status === "archived") {
    return (
      <ActionButton
        intent="reopenConversation"
        prospectId={prospect.id}
        label="Reopen"
        icon={<Undo2 size={14} />}
        variant="outline"
      />
    );
  }
  return (
    <ActionButton
      intent="archiveProspect"
      prospectId={prospect.id}
      label="Archive"
      icon={<Archive size={14} />}
      variant="destructive"
    />
  );
}

function CopyButton({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(compact && "h-8")}
      onClick={() => {
        navigator.clipboard.writeText(value);
        toast.success("Copied to clipboard");
      }}
    >
      <Clipboard className="size-3.5" />
      {label}
    </Button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      Nothing here.
    </div>
  );
}
