import { useEffect, useRef, useState } from "react";
import { data, Form, Link, redirect, useFetcher, useLoaderData, useRevalidator, type FetcherWithComponents } from "react-router";
import {
  Archive,
  ArrowLeft,
  AtSign,
  CalendarCheck,
  Check,
  Clipboard,
  ExternalLink,
  LinkIcon,
  Loader2,
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
  generateBriefTopicSuggestions,
  requireWorkspace,
  runProspectAction,
  type BriefTopicSuggestion,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Textarea } from "~/components/ui/textarea";
import { statusVariant } from "~/components/prospects/status-badge";
import { cn } from "~/lib/utils";

type ProspectActionResult =
  | {
      ok: true;
      intent: string;
    }
  | {
      ok: true;
      intent: "suggestBriefTopics";
      suggestions: BriefTopicSuggestion[];
    }
  | {
      ok: false;
      intent: string;
      error: string;
    };

function isSuggestionResult(
  result: ProspectActionResult,
): result is Extract<ProspectActionResult, { ok: true; intent: "suggestBriefTopics" }> {
  return result.ok && result.intent === "suggestBriefTopics";
}

export const meta: Route.MetaFunction = ({ data }) => {
  const name = data?.detail?.prospect?.name || "Prospect";
  return [{ title: `${name} · Outreach` }];
};

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);
  const workspace = await requireWorkspace(params.workspaceSlug);
  const detail = await getProspectDetail(id, workspace.id);
  if (!detail) {
    throw new Response("Prospect not found", { status: 404 });
  }
  return { detail };
}

export async function action({ request, params }: Route.ActionArgs) {
  const workspace = await requireWorkspace(params.workspaceSlug);
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");

  try {
    if (intent === "suggestBriefTopics") {
      const prospectId = Number(formData.get("prospectId"));
      const direction = String(formData.get("direction") || "").trim();
      const suggestions = await generateBriefTopicSuggestions(prospectId, direction);
      return data<ProspectActionResult>({ ok: true, intent, suggestions });
    }
    await runProspectAction(formData, workspace.id);
    if (intent === "deleteProspect") {
      return redirect(`/${workspace.slug}`);
    }
    return data<ProspectActionResult>({ ok: true, intent });
  } catch (error) {
    return data<ProspectActionResult>({
      ok: false,
      intent,
      error: error instanceof Error ? error.message : "Unexpected error",
    }, { status: 400 });
  }
}

export default function ProspectDetail() {
  const { detail } = useLoaderData<typeof loader>();
  const { prospect, tasks, events, replies, latestEvidence, today } = detail;
  const openTasks = tasks.filter((task) => task.status === "open");
  const doneTasks = tasks.filter((task) => task.status !== "open");
  const showConnectionNote =
    prospect.outreach_mode !== "no_note" || prospect.connection_note_sent === 1;
  const connectionLocked = Boolean(prospect.connection_sent_date);
  const reportLocked = Boolean(prospect.report_sent_date);
  const isOutreachReady =
    !["skipped", "saved_for_later", "archived_declined", "archived"].includes(prospect.status) &&
    !(prospect.status === "to_contact" && !prospect.contact_now);
  const archiveMode =
    Boolean(prospect.report_sent_date) ||
    ["reply_sent", "followup_sent"].includes(prospect.status);

  const defaultOpen = [
    prospect.source_channel === "linkedin" && !archiveMode && isOutreachReady ? "outreach-mode" : null,
    !archiveMode ? "brief" : null,
    !archiveMode && isOutreachReady ? "messages" : null,
    prospect.notes ? "notes" : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <Button asChild variant="ghost" size="sm" className="-ml-3">
              <Link to={`/${prospect.workspace_slug || "tempolis"}`}>
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
            <Badge variant="muted">{prospect.workspace_name || "Workspace"}</Badge>
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
              {prospect.source_channel === "linkedin" && isOutreachReady ? (
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
                <div className="grid gap-4">
                  <div className="flex justify-end">
                    <BriefTopicSuggestionSheet prospect={prospect} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <BriefStrategyForm prospect={prospect} />
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
                      <BriefUrlInlineForm prospectId={prospect.id} />
                    )}
                  </div>
                </div>
                </div>
              </SectionAccordion>

              {isOutreachReady ? (
                <SectionAccordion
                  value="messages"
                  title="Messages"
                  detail={
                    prospect.source_channel === "twitter"
                      ? "Copy exact Twitter/X copy."
                      : "Copy exact LinkedIn copy."
                  }
                >
                  <div className="mb-4 flex justify-end">
                    <PrimaryMessageRegenerationSheet
                      prospect={prospect}
                      showConnectionNote={showConnectionNote}
                      connectionLocked={connectionLocked}
                      reportLocked={reportLocked}
                      latestEvidence={Boolean(latestEvidence)}
                    />
                  </div>
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
              ) : (
                <SectionAccordion
                  value="messages-disabled"
                  title="Messages"
                  detail="This prospect is not outreach-ready."
                >
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    No outreach copy is generated for prospects marked `SKIP`, `SAVE`, archived, or not contactable now.
                  </div>
                </SectionAccordion>
              )}
            </Accordion>

            <Accordion type="multiple">
              <SectionAccordion
                value="captured-evidence"
                title="Latest captured evidence"
                detail={latestEvidence ? `${latestEvidence.capture_source} · ${latestEvidence.source_channel} · ${latestEvidence.created_at}` : "No extension capture stored yet."}
              >
                {latestEvidence ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="muted">{latestEvidence.capture_source}</Badge>
                      <Badge variant="info">{latestEvidence.source_channel}</Badge>
                      <Badge variant="muted">{latestEvidence.created_at}</Badge>
                    </div>
                    <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                      {latestEvidence.summary_text}
                    </pre>
                  </div>
                ) : (
                  <EmptyState />
                )}
              </SectionAccordion>
            </Accordion>

            <Card>
              <CardHeader>
                <CardTitle>Reply handling</CardTitle>
                <p className="text-sm text-muted-foreground">
                  If this prospect replies, paste it here and answer instead of following up.
                </p>
              </CardHeader>
              <CardContent>
                <ReplyPanel prospect={prospect} replies={replies} />
              </CardContent>
            </Card>

            <Accordion type="multiple" defaultValue={defaultOpen}>
              <SectionAccordion value="notes" title="Internal note" detail="Small private CRM note.">
                <ProspectNotesForm prospect={prospect} />
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

function useFetcherToast(
  fetcher: FetcherWithComponents<ProspectActionResult>,
  options: {
    success?: string | ((result: ProspectActionResult) => string | null);
    error?: string | ((result: ProspectActionResult) => string | null);
    onSuccess?: (result: ProspectActionResult) => void;
    revalidate?: boolean;
  },
) {
  const lastDataRef = useRef<ProspectActionResult | null>(null);
  const revalidator = useRevalidator();

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    if (lastDataRef.current === fetcher.data) return;
    lastDataRef.current = fetcher.data;

    if (!fetcher.data.ok) {
      const message = typeof options.error === "function"
        ? options.error(fetcher.data)
        : options.error;
      toast.error(message || "Action failed", {
        description: fetcher.data.error,
      });
      return;
    }

    const message = typeof options.success === "function"
      ? options.success(fetcher.data)
      : options.success;
    if (message) toast.success(message);
    if (options.revalidate !== false) revalidator.revalidate();
    options.onSuccess?.(fetcher.data);
  }, [fetcher.state, fetcher.data, options, revalidator]);
}

function actionToastSuccess(intent: string, label: string) {
  const messages: Record<string, string> = {
    generateNoNoteMode: "No-note mode generated",
    switchToWithNoteMode: "With-note mode enabled",
    markTwitterDmSent: "Twitter/X DM marked as sent",
    markTwitterFollowupSent: "Twitter/X follow-up marked as sent",
    markAccepted: "Prospect marked as accepted",
    archiveDeclined: "Prospect archived as declined",
    markConnectionSentWithNote: "Connection marked as sent with note",
    markConnectionSentWithoutNote: "Connection marked as sent without note",
    markReportSent: "Report marked as sent",
    markFollowupSent: "Follow-up marked as sent",
    skip: "Prospect skipped",
    saveForLater: "Prospect saved for later",
    archiveProspect: "Prospect archived",
    reopenConversation: "Conversation reopened",
    markReplySent: "Response marked as sent",
  };
  return messages[intent] || `${label} done`;
}

function actionToastError(intent: string, label: string) {
  const messages: Record<string, string> = {
    generateNoNoteMode: "Could not generate no-note mode",
    switchToWithNoteMode: "Could not switch to with-note mode",
    markTwitterDmSent: "Could not mark the DM as sent",
    markTwitterFollowupSent: "Could not mark the follow-up as sent",
    markAccepted: "Could not mark the prospect as accepted",
    archiveDeclined: "Could not archive the declined prospect",
    markConnectionSentWithNote: "Could not mark the connection as sent",
    markConnectionSentWithoutNote: "Could not mark the no-note connection as sent",
    markReportSent: "Could not mark the report as sent",
    markFollowupSent: "Could not mark the follow-up as sent",
    skip: "Could not skip the prospect",
    saveForLater: "Could not save the prospect for later",
    archiveProspect: "Could not archive the prospect",
    reopenConversation: "Could not reopen the conversation",
    markReplySent: "Could not mark the response as sent",
  };
  return messages[intent] || `Could not ${label.toLowerCase()}`;
}

function BriefTopicSuggestionSheet({ prospect }: { prospect: Prospect }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <RefreshCw className="size-4" />
          Refine topic
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Refine brief topic</SheetTitle>
          <SheetDescription>
            Ask for better brief angles from the latest captured data and your current brief.
          </SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto px-4 pb-4">
          <BriefTopicSuggestionPanel prospect={prospect} onTopicApplied={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PrimaryMessageRegenerationSheet({
  prospect,
  showConnectionNote,
  connectionLocked,
  reportLocked,
  latestEvidence,
}: {
  prospect: Prospect;
  showConnectionNote: boolean;
  connectionLocked: boolean;
  reportLocked: boolean;
  latestEvidence: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <RefreshCw className="size-4" />
          Regenerate
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Regenerate main message</SheetTitle>
          <SheetDescription>
            Rewrite the main outreach message from scraped data, the current brief theme, and an optional hint.
          </SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto px-4 pb-4">
          <PrimaryMessageRegenerationPanel
            prospect={prospect}
            showConnectionNote={showConnectionNote}
            connectionLocked={connectionLocked}
            reportLocked={reportLocked}
            latestEvidence={latestEvidence}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function BriefTopicSuggestionPanel({
  prospect,
  onTopicApplied,
}: {
  prospect: Prospect;
  onTopicApplied?: () => void;
}) {
  const fetcher = useFetcher<ProspectActionResult>();
  useFetcherToast(fetcher, {
    success: (result) =>
      isSuggestionResult(result)
        ? `${result.suggestions.length} brief topic suggestion${result.suggestions.length > 1 ? "s" : ""} ready`
        : null,
    error: "Could not suggest brief topics",
  });
  const suggestions =
    fetcher.data && isSuggestionResult(fetcher.data)
      ? fetcher.data.suggestions
      : [];
  const submittedDirection = String(fetcher.formData?.get("direction") || "").trim();
  const isPending = fetcher.state !== "idle";

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold">Need a better brief angle?</p>
        <p className="text-sm text-muted-foreground">
          Ask the app for 3 alternative topics from the latest captured evidence, with an optional
          direction like “broader”, “more circular economy”, or “better for first outreach”.
        </p>
      </div>

      <fetcher.Form method="post" className="mt-4 grid gap-3">
        <input type="hidden" name="intent" value="suggestBriefTopics" />
        <input type="hidden" name="prospectId" value={prospect.id} />
        <div className="space-y-2">
          <Label htmlFor="brief-direction">Angle or direction</Label>
          <Textarea
            id="brief-direction"
            name="direction"
            rows={2}
            placeholder="Find a broader topic, more focused on circular economy and better for first outreach."
            defaultValue={submittedDirection}
            disabled={isPending}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="outline" size="sm" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            {isPending ? "Suggesting..." : "Suggest better brief topics"}
          </Button>
        </div>
      </fetcher.Form>

      {suggestions.length ? (
        <div className="mt-4 grid gap-3">
          {suggestions.map((suggestion, index) => (
            <div key={`${suggestion.topic}-${index}`} className="rounded-lg border bg-background p-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="info">{suggestion.topic}</Badge>
                    {prospect.brief_topic?.toLowerCase() === suggestion.topic.toLowerCase() ? (
                      <Badge variant="muted">current</Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{suggestion.rationale}</p>
                  {suggestion.preparationNotes ? (
                    <p className="text-sm text-muted-foreground">
                      Prep: {suggestion.preparationNotes}
                    </p>
                  ) : null}
                </div>
                <ApplySuggestedTopicButton
                  prospectId={prospect.id}
                  topic={suggestion.topic}
                  preparationNotes={suggestion.preparationNotes}
                  onApplied={onTopicApplied}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PrimaryMessageRegenerationPanel({
  prospect,
  showConnectionNote,
  connectionLocked,
  reportLocked,
  latestEvidence,
}: {
  prospect: Prospect;
  showConnectionNote: boolean;
  connectionLocked: boolean;
  reportLocked: boolean;
  latestEvidence: boolean;
}) {
  const fetcher = useFetcher<ProspectActionResult>();
  useFetcherToast(fetcher, {
    success: "Main message regenerated",
    error: "Could not regenerate the main message",
  });
  const isPending = fetcher.state !== "idle";
  const primary = getPrimaryMessageConfig(prospect, {
    showConnectionNote,
    connectionLocked,
    reportLocked,
  });

  return (
    <fetcher.Form method="post" className="mb-4 rounded-lg border bg-muted/30 p-4">
      <input type="hidden" name="intent" value="regenerateMessageWithHint" />
      <input type="hidden" name="prospectId" value={prospect.id} />
      <input type="hidden" name="messageType" value={primary.type} />
      <div className="space-y-1">
        <p className="text-sm font-semibold">Regenerate the main message</p>
        <p className="text-sm text-muted-foreground">
          {latestEvidence
            ? `This rewrites ${primary.label.toLowerCase()} from the latest captured profile data, the current brief topic, and your optional hint.`
            : `This rewrites ${primary.label.toLowerCase()} from the current prospect context, the current brief topic, and your optional hint.`}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message-direction">Regenerate one message with a hint</Label>
        <Textarea
          id="message-direction"
          name="direction"
          rows={2}
          placeholder="Add that Tempolis is based on public messages. Keep it natural and not too salesy."
          disabled={isPending}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="muted">{primary.label}</Badge>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={primary.disabled || isPending}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          Regenerate main message
        </Button>
      </div>
      {primary.disabled ? (
        <p className="mt-2 text-xs text-muted-foreground">
          This message is already locked because it has been sent.
        </p>
      ) : null}
    </fetcher.Form>
  );
}

function getPrimaryMessageConfig(
  prospect: Prospect,
  options: {
    showConnectionNote: boolean;
    connectionLocked: boolean;
    reportLocked: boolean;
  },
) {
  if (prospect.source_channel === "twitter") {
    return {
      type: "twitter_dm",
      label: "Twitter/X DM",
      disabled: Boolean(prospect.twitter_contacted_date),
    } as const;
  }

  if (prospect.outreach_mode === "no_note") {
    return {
      type: "report_no_note",
      label: "First message after acceptance",
      disabled: options.reportLocked,
    } as const;
  }

  if (options.showConnectionNote && !options.connectionLocked) {
    return {
      type: "connection",
      label: "Connection note",
      disabled: false,
    } as const;
  }

  return {
    type: "report",
    label: "After acceptance message",
    disabled: options.reportLocked,
  } as const;
}

function BriefStrategyForm({ prospect }: { prospect: Prospect }) {
  const fetcher = useFetcher<ProspectActionResult>();
  useFetcherToast(fetcher, {
    success: "Brief updated",
    error: "Could not save the brief",
  });
  const isPending = fetcher.state !== "idle";

  return (
    <fetcher.Form method="post" className="space-y-3">
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
          disabled={isPending}
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
          disabled={isPending}
        />
      </div>
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save brief theme
      </Button>
    </fetcher.Form>
  );
}

function ApplySuggestedTopicButton({
  prospectId,
  topic,
  preparationNotes,
  onApplied,
}: {
  prospectId: number;
  topic: string;
  preparationNotes: string;
  onApplied?: () => void;
}) {
  const fetcher = useFetcher<ProspectActionResult>();
  useFetcherToast(fetcher, {
    success: "Brief topic applied",
    error: "Could not apply the suggested topic",
    onSuccess: () => onApplied?.(),
  });
  const isPending = fetcher.state !== "idle";

  return (
    <fetcher.Form method="post" className="shrink-0">
      <input type="hidden" name="intent" value="updateBriefStrategy" />
      <input type="hidden" name="prospectId" value={prospectId} />
      <input type="hidden" name="briefTopic" value={topic} />
      <input type="hidden" name="briefPreparation" value={preparationNotes} />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Use topic
      </Button>
    </fetcher.Form>
  );
}

function BriefUrlInlineForm({ prospectId }: { prospectId: number }) {
  const fetcher = useFetcher<ProspectActionResult>();
  useFetcherToast(fetcher, {
    success: "Brief URL saved",
    error: "Could not save the brief URL",
  });
  const isPending = fetcher.state !== "idle";

  return (
    <fetcher.Form method="post" className="flex gap-2">
      <input type="hidden" name="intent" value="addBriefUrl" />
      <input type="hidden" name="prospectId" value={prospectId} />
      <Input
        name="sharedUrl"
        type="url"
        required
        placeholder="https://tempolis.com/share/..."
        className="flex-1"
        disabled={isPending}
      />
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <LinkIcon className="size-4" />}
        Add URL
      </Button>
    </fetcher.Form>
  );
}

function ProspectNotesForm({ prospect }: { prospect: Prospect }) {
  const fetcher = useFetcher<ProspectActionResult>();
  useFetcherToast(fetcher, {
    success: "Note saved",
    error: "Could not save the note",
  });
  const isPending = fetcher.state !== "idle";

  return (
    <fetcher.Form method="post" className="space-y-3">
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
          disabled={isPending}
        />
      </div>
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save note
      </Button>
    </fetcher.Form>
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
  const fetcher = useFetcher<ProspectActionResult>();
  useFetcherToast(fetcher, {
    success: `${title} saved`,
    error: `Could not save ${title.toLowerCase()}`,
  });
  const isPending = fetcher.state !== "idle";
  return (
    <fetcher.Form method="post" className="rounded-lg border bg-muted/30 p-4">
      <input type="hidden" name="intent" value="updateMessage" />
      <input type="hidden" name="prospectId" value={prospectId} />
      <input type="hidden" name="messageType" value={type} />
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{title}</p>
        <div className="flex gap-2">
          <CopyButton label="Copy" value={content} compact />
          <Button type="submit" variant="outline" size="sm" className="h-8" disabled={isPending}>
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Save
          </Button>
        </div>
      </div>
      <Textarea
        name="messageContent"
        defaultValue={content}
        rows={Math.max(3, Math.min(8, content.split("\n").length + 1))}
        className="mt-3"
        disabled={isPending}
      />
    </fetcher.Form>
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
  const fetcher = useFetcher<ProspectActionResult>();
  useFetcherToast(fetcher, {
    success: "Reply saved and draft generated",
    error: "Could not save the reply",
  });
  const isPending = fetcher.state !== "idle";
  return (
    <div className="grid gap-4">
      {latest ? <ReplyEditor prospect={prospect} reply={latest} /> : null}
      <fetcher.Form method="post" className="rounded-lg border bg-muted/30 p-4">
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
            disabled={isPending}
          />
        </div>
        <div className="mt-3 space-y-2">
          <Label htmlFor="responseDirection">Response direction</Label>
          <Textarea
            id="responseDirection"
            name="responseDirection"
            rows={3}
            placeholder="Optional. Example: thank them, clarify this is early, ask what signal would make it useful for their team..."
            disabled={isPending}
          />
        </div>
        <div className="mt-3 space-y-2">
          <Label htmlFor="suggestedResponse">Draft response</Label>
          <Textarea
            id="suggestedResponse"
            name="suggestedResponse"
            rows={4}
            placeholder="Optional manual override. Leave empty and the app will generate a draft from the direction above."
            disabled={isPending}
          />
        </div>
        <Button type="submit" className="mt-3" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <MessageSquareReply className="size-4" />}
          Save and draft response
        </Button>
      </fetcher.Form>
    </div>
  );
}

function ReplyEditor({ prospect, reply }: { prospect: Prospect; reply: Reply }) {
  const regenerateFetcher = useFetcher<ProspectActionResult>();
  const updateFetcher = useFetcher<ProspectActionResult>();
  useFetcherToast(regenerateFetcher, {
    success: "Reply draft regenerated",
    error: "Could not regenerate the reply draft",
  });
  useFetcherToast(updateFetcher, {
    success: "Reply draft saved",
    error: "Could not save the reply draft",
  });
  const isRegenerating = regenerateFetcher.state !== "idle";
  const isSaving = updateFetcher.state !== "idle";
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
      {!reply.sent_at ? (
        <regenerateFetcher.Form method="post" className="mt-3 rounded-md border bg-background p-3">
          <input type="hidden" name="intent" value="regenerateReplyResponse" />
          <input type="hidden" name="prospectId" value={prospect.id} />
          <input type="hidden" name="replyId" value={reply.id} />
          <div className="space-y-2">
            <Label htmlFor={`responseDirection-${reply.id}`}>Regenerate direction</Label>
            <Textarea
              id={`responseDirection-${reply.id}`}
              name="responseDirection"
              rows={3}
              placeholder="Example: answer warmly, say the brief is a prototype, ask if a competitor comparison would be more useful..."
              disabled={isRegenerating}
            />
          </div>
          <Button type="submit" variant="outline" size="sm" className="mt-3" disabled={isRegenerating}>
            {isRegenerating ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            Regenerate draft
          </Button>
        </regenerateFetcher.Form>
      ) : null}
      <updateFetcher.Form method="post" className="mt-3">
        <input type="hidden" name="intent" value="updateReplyResponse" />
        <input type="hidden" name="prospectId" value={prospect.id} />
        <input type="hidden" name="replyId" value={reply.id} />
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Response to send</p>
          <div className="flex gap-2">
            <CopyButton label="Copy" value={reply.suggested_response || ""} compact />
            <Button type="submit" variant="outline" size="sm" className="h-8" disabled={isSaving || Boolean(reply.sent_at)}>
              {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Save
            </Button>
          </div>
        </div>
        <Textarea
          name="suggestedResponse"
          defaultValue={reply.suggested_response || ""}
          rows={5}
          required
          disabled={Boolean(reply.sent_at) || isSaving}
          className="mt-2"
        />
      </updateFetcher.Form>
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
  const fetcher = useFetcher<ProspectActionResult>();
  useFetcherToast(fetcher, {
    success: () => actionToastSuccess(intent, label),
    error: () => actionToastError(intent, label),
  });
  const isPending = fetcher.state !== "idle";
  return (
    <fetcher.Form method="post">
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="prospectId" value={prospectId} />
      {extra
        ? Object.entries(extra).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))
        : null}
      <Button type="submit" variant={variant} size="sm" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : icon}
        {label}
      </Button>
    </fetcher.Form>
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
