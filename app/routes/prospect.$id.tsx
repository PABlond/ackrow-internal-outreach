import { Form, Link, redirect, useLoaderData } from "react-router";
import { Archive, ArrowLeft, AtSign, CalendarCheck, Check, Clipboard, ExternalLink, LinkIcon, MessageSquareReply, RefreshCw, Save, Send, SkipForward, Undo2, UserCheck } from "lucide-react";

import type { Route } from "./+types/prospect.$id";
import { getProspectDetail, runProspectAction, type Prospect, type Reply, type Task } from "~/lib/outreach.server";

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
  const showConnectionNote = prospect.outreach_mode !== "no_note" || prospect.connection_note_sent === 1;
  const connectionLocked = Boolean(prospect.connection_sent_date);
  const reportLocked = Boolean(prospect.report_sent_date);
  const archiveMode = Boolean(prospect.report_sent_date) || ["reply_sent", "followup_sent"].includes(prospect.status);

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8 text-stone-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-stone-300 pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-900">
              <ArrowLeft size={16} />
              Dashboard
            </Link>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal">{prospect.name}</h1>
            <p className="mt-2 max-w-3xl text-stone-600">{prospect.position}</p>
            <a className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-900" href={prospect.twitter_url || prospect.profile_url} target="_blank" rel="noreferrer">
              {prospect.source_channel === "twitter" ? "X profile" : "LinkedIn profile"}
              <ExternalLink size={14} />
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{prospect.priority_tag}</Badge>
            <Badge>Wave {prospect.wave || "-"}</Badge>
            <Badge tone="blue">{prospect.source_channel === "twitter" ? "Twitter/X" : "LinkedIn"}</Badge>
            <Badge tone={prospect.outreach_mode === "no_note" ? "blue" : "green"}>{outreachModeLabel(prospect)}</Badge>
            <Badge tone="blue">{prospect.status}</Badge>
            <ArchiveControls prospect={prospect} />
            <DeleteProspectButton prospect={prospect} />
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-lg border border-stone-300 bg-white p-5">
              <SectionTitle title="Actions in progress" detail="Do these from top to bottom." />
              <div className="mt-4 grid gap-3">
                {openTasks.length ? openTasks.map((task) => <OpenTask key={task.id} task={task} prospect={prospect} today={today} />) : <EmptyState />}
              </div>
            </section>

            {prospect.source_channel === "linkedin" ? <CollapsibleSection title="Outreach mode" detail="Switch the copy strategy before sending." defaultOpen={!archiveMode}>
              <div className="mt-4 grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
                <div>
                  <p className="font-semibold">{outreachModeLabel(prospect)}</p>
                  <p className="mt-1 text-sm text-stone-600">
                    {prospect.outreach_mode === "no_note"
                      ? "The request goes out without a custom note. The first real message is generated for after acceptance."
                      : "The current sequence assumes a custom connection note that tees up the brief."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton intent="generateNoNoteMode" prospectId={prospect.id} label="Generate no-note mode" icon={<RefreshCw size={16} />} primary={prospect.outreach_mode !== "no_note"} />
                  <ActionButton intent="switchToWithNoteMode" prospectId={prospect.id} label="Use with-note mode" icon={<Send size={16} />} primary={prospect.outreach_mode === "no_note"} />
                </div>
              </div>
            </CollapsibleSection> : null}

            <CollapsibleSection title="Brief" detail="Topic, preparation notes and shared URL." defaultOpen={!archiveMode}>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Form method="post" className="border-t border-stone-200 pt-3">
                  <input type="hidden" name="intent" value="updateBriefStrategy" />
                  <input type="hidden" name="prospectId" value={prospect.id} />
                  <label className="text-sm font-semibold" htmlFor="briefTopic">
                    Topic
                  </label>
                  <input
                    id="briefTopic"
                    name="briefTopic"
                    defaultValue={prospect.brief_topic || ""}
                    required
                    maxLength={80}
                    placeholder="Narrative risk"
                    className="mt-2 min-h-10 w-full rounded-md border border-stone-300 bg-stone-50 px-3 outline-none focus:border-teal-700"
                  />
                  <label className="mt-3 block text-sm font-semibold" htmlFor="briefPreparation">
                    Preparation notes
                  </label>
                  <textarea
                    id="briefPreparation"
                    name="briefPreparation"
                    defaultValue={prospect.preparation_notes || ""}
                    rows={4}
                    placeholder="Why this subject fits the profile, source signal, angle to prepare..."
                    className="mt-2 min-h-28 w-full resize-y rounded-md border border-stone-300 bg-stone-50 px-3 py-2 outline-none focus:border-teal-700"
                  />
                  <button className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 font-medium hover:border-teal-700">
                    <Save size={16} />
                    Save brief theme
                  </button>
                </Form>
                <div className="border-t border-stone-200 pt-3">
                  <p className="text-sm font-semibold">Shared URL</p>
                  {prospect.shared_url ? (
                    <a className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-teal-700" href={prospect.shared_url} target="_blank" rel="noreferrer">
                      {prospect.shared_url}
                      <ExternalLink size={14} />
                    </a>
                  ) : (
                    <Form method="post" className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
                      <input type="hidden" name="intent" value="addBriefUrl" />
                      <input type="hidden" name="prospectId" value={prospect.id} />
                      <input
                        name="sharedUrl"
                        type="url"
                        required
                        placeholder="https://tempolis.com/share/..."
                        className="min-h-10 rounded-md border border-stone-300 bg-stone-50 px-3 outline-none focus:border-teal-700"
                      />
                      <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 font-medium hover:border-teal-700">
                        <LinkIcon size={16} />
                        Add URL
                      </button>
                    </Form>
                  )}
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Messages" detail={prospect.source_channel === "twitter" ? "Copy exact Twitter/X copy." : "Copy exact LinkedIn copy."} defaultOpen={!archiveMode}>
              {prospect.source_channel === "linkedin" ? (
                <div className="mt-4 flex flex-wrap gap-2 rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <ActionButton intent="regenerateSaferCopy" prospectId={prospect.id} label="Regenerate safer copy" icon={<RefreshCw size={16} />} />
                </div>
              ) : null}
              {prospect.source_channel === "twitter" ? (
                <div className="mt-4 grid gap-3">
                  <MessageEditor prospectId={prospect.id} title="Twitter/X DM" type="twitter_dm" content={prospect.twitter_dm_message} locked={Boolean(prospect.twitter_contacted_date)} />
                  <MessageEditor prospectId={prospect.id} title="Twitter/X follow-up J+2" type="twitter_followup" content={prospect.twitter_followup_message} locked={Boolean(prospect.twitter_followup_sent_date)} />
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  {showConnectionNote ? <MessageEditor prospectId={prospect.id} title="Connection note" type="connection" content={prospect.connection_message} locked={connectionLocked} /> : <NoNoteCallout />}
                  <MessageEditor
                    prospectId={prospect.id}
                    title={prospect.outreach_mode === "no_note" ? "First message after acceptance" : "After acceptance"}
                    type={prospect.outreach_mode === "no_note" ? "report_no_note" : "report"}
                    content={prospect.post_acceptance_message}
                    locked={reportLocked}
                  />
                  <MessageEditor prospectId={prospect.id} title="Follow-up J+2" type="followup" content={prospect.followup_message} />
                </div>
              )}
            </CollapsibleSection>

            <section className="rounded-lg border border-stone-300 bg-white p-5">
              <SectionTitle title="Reply handling" detail="If Marc replies, paste it here and answer instead of following up." />
              <ReplyPanel prospect={prospect} replies={replies} />
            </section>

            <section className="rounded-lg border border-stone-300 bg-white p-5">
              <SectionTitle title="Past and future" detail="Task history for this prospect." />
              <div className="mt-4 grid gap-3">
                {tasks.length ? tasks.map((task) => <TaskRow key={task.id} task={task} today={today} />) : <EmptyState />}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-lg border border-stone-300 bg-white p-5 lg:sticky lg:top-6">
            <SectionTitle title="Timeline" detail="Actions already logged." />
            <div className="mt-4 space-y-4">
              {events.length ? (
                events.map((event) => (
                  <div key={event.id} className="border-l-2 border-teal-700 pl-3">
                    <p className="font-medium">{event.type}</p>
                    <p className="mt-1 text-sm text-stone-600">{event.note}</p>
                    <p className="mt-1 text-xs text-stone-500">{event.happened_at}</p>
                  </div>
                ))
              ) : (
                <EmptyState />
              )}
            </div>

            {doneTasks.length ? (
              <div className="mt-6 border-t border-stone-200 pt-4">
                <h3 className="font-semibold">Completed tasks</h3>
                <div className="mt-3 grid gap-2">
                  {doneTasks.map((task) => (
                    <TaskRow key={task.id} task={task} today={today} compact />
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}

function OpenTask({ task, prospect, today }: { task: Task; prospect: Prospect; today: string }) {
  const overdue = task.due_date && task.due_date < today;
  return (
    <div className={`rounded-lg border bg-stone-50 p-4 ${overdue ? "border-amber-500" : "border-stone-200"}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">{task.title}</p>
          <p className="text-sm text-stone-600">{task.due_date ? `Due ${task.due_date}` : "No due date"}</p>
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
          <ActionButton intent="markConnectionSentWithoutNote" prospectId={prospect.id} label="Sent without note" icon={<UserCheck size={16} />} primary />
          <CopyButton label="Copy note" value={prospect.connection_message || ""} />
          <ActionButton intent="markConnectionSentWithNote" prospectId={prospect.id} label="Sent with note" icon={<Send size={16} />} />
        </>
      );
    }
    return (
      <>
        <CopyButton label="Copy note" value={prospect.connection_message || ""} />
        <ActionButton intent="markConnectionSentWithNote" prospectId={prospect.id} label="Sent with note" icon={<Send size={16} />} primary />
        <ActionButton intent="markConnectionSentWithoutNote" prospectId={prospect.id} label="Sent without note" icon={<UserCheck size={16} />} />
      </>
    );
  }
  if (task.type === "watch_acceptance") {
    return (
      <>
        <ActionButton intent="markAccepted" prospectId={prospect.id} label="Mark accepted" icon={<UserCheck size={16} />} primary />
        <ActionButton intent="archiveDeclined" prospectId={prospect.id} label="Archive declined" icon={<Archive size={16} />} danger />
      </>
    );
  }
  if (task.type === "send_report") {
    return (
      <>
        <CopyButton label="Copy message" value={prospect.post_acceptance_message || ""} />
        <ActionButton intent="markReportSent" prospectId={prospect.id} label="Mark sent" icon={<Check size={16} />} primary />
      </>
    );
  }
  if (task.type === "send_followup") {
    return (
      <>
        <CopyButton label="Copy follow-up" value={prospect.followup_message || ""} />
        <ActionButton intent="markFollowupSent" prospectId={prospect.id} label="Mark sent" icon={<CalendarCheck size={16} />} primary />
      </>
    );
  }
  if (task.type === "send_twitter_dm") {
    return (
      <>
        <CopyButton label="Copy DM" value={prospect.twitter_dm_message || ""} />
        <ActionLink href={prospect.twitter_url || prospect.profile_url} label="Open X" icon={<AtSign size={16} />} />
        <ActionButton intent="markTwitterDmSent" prospectId={prospect.id} label="Mark DM sent" icon={<Send size={16} />} primary />
      </>
    );
  }
  if (task.type === "send_twitter_followup") {
    return (
      <>
        <CopyButton label="Copy follow-up" value={prospect.twitter_followup_message || ""} />
        <ActionLink href={prospect.twitter_url || prospect.profile_url} label="Open X" icon={<AtSign size={16} />} />
        <ActionButton intent="markTwitterFollowupSent" prospectId={prospect.id} label="Mark sent" icon={<CalendarCheck size={16} />} primary />
      </>
    );
  }
  return null;
}

function TaskRow({ task, today, compact = false }: { task: Task; today: string; compact?: boolean }) {
  const overdue = task.status === "open" && task.due_date && task.due_date < today;
  return (
    <div className={`rounded-lg border bg-stone-50 ${compact ? "p-3" : "p-4"} ${overdue ? "border-amber-500" : "border-stone-200"}`}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium">{task.title}</p>
        <Badge tone={task.status === "open" ? "blue" : "green"}>{task.status}</Badge>
      </div>
      <p className="mt-1 text-sm text-stone-600">
        {task.type} {task.due_date ? `· due ${task.due_date}` : ""} {task.completed_at ? `· completed ${task.completed_at}` : ""}
      </p>
    </div>
  );
}

function SectionTitle({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-stone-600">{detail}</p>
    </div>
  );
}

function CollapsibleSection({ title, detail, defaultOpen, children }: { title: string; detail: string; defaultOpen: boolean; children: React.ReactNode }) {
  return (
    <details className="rounded-lg border border-stone-300 bg-white p-5" open={defaultOpen}>
      <summary className="cursor-pointer list-none">
        <SectionTitle title={title} detail={detail} />
      </summary>
      {children}
    </details>
  );
}

function InfoBlock({ title, value, detail }: { title: string; value: string; detail?: string }) {
  return (
    <div className="border-t border-stone-200 pt-3">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-stone-700">{value}</p>
      {detail ? <p className="mt-1 text-sm text-stone-500">{detail}</p> : null}
    </div>
  );
}

function MessageEditor({ prospectId, title, type, content, locked = false }: { prospectId: number; title: string; type: string; content: string | null; locked?: boolean }) {
  if (!content) return null;
  if (locked) return <ReadonlyMessage title={title} content={content} />;
  return (
    <Form method="post" className="border-t border-stone-200 pt-3">
      <input type="hidden" name="intent" value="updateMessage" />
      <input type="hidden" name="prospectId" value={prospectId} />
      <input type="hidden" name="messageType" value={type} />
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{title}</p>
        <div className="flex gap-2">
          <CopyButton label="Copy" value={content} compact />
          <button className="inline-flex min-h-8 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-2 text-sm font-medium text-stone-800 hover:border-teal-700">
            <Save size={14} />
            Save
          </button>
        </div>
      </div>
      <textarea
        name="messageContent"
        defaultValue={content}
        rows={Math.max(3, Math.min(8, content.split("\n").length + 1))}
        className="mt-2 min-h-28 w-full resize-y rounded-md border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700 outline-none focus:border-teal-700"
      />
    </Form>
  );
}

function ReadonlyMessage({ title, content }: { title: string; content: string }) {
  return (
    <div className="border-t border-stone-200 pt-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs font-medium text-stone-500">Sent. Locked to preserve history.</p>
        </div>
        <CopyButton label="Copy" value={content} compact />
      </div>
      <p className="mt-2 whitespace-pre-wrap rounded-md border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">{content}</p>
    </div>
  );
}

function ReplyPanel({ prospect, replies }: { prospect: Prospect; replies: Reply[] }) {
  const latest = replies[0];
  return (
    <div className="mt-4 grid gap-4">
      {latest ? <ReplyEditor prospect={prospect} reply={latest} /> : null}
      <Form method="post" className="rounded-lg border border-stone-200 bg-stone-50 p-4">
        <input type="hidden" name="intent" value="addProspectReply" />
        <input type="hidden" name="prospectId" value={prospect.id} />
        <label className="text-sm font-semibold" htmlFor="inboundContent">
          Prospect reply
        </label>
        <textarea
          id="inboundContent"
          name="inboundContent"
          rows={4}
          required
          placeholder="Paste the LinkedIn reply here..."
          className="mt-2 min-h-28 w-full resize-y rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700"
        />
        <label className="mt-3 block text-sm font-semibold" htmlFor="suggestedResponse">
          Draft response
        </label>
        <textarea
          id="suggestedResponse"
          name="suggestedResponse"
          rows={4}
          placeholder="Optional. Leave empty and the app will create a lightweight fallback."
          className="mt-2 min-h-28 w-full resize-y rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700"
        />
        <button className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-teal-700 bg-teal-700 px-3 font-medium text-white hover:bg-teal-800">
          <MessageSquareReply size={16} />
          Save reply
        </button>
      </Form>
    </div>
  );
}

function ReplyEditor({ prospect, reply }: { prospect: Prospect; reply: Reply }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Latest reply</p>
          <p className="mt-1 text-xs text-stone-500">{reply.created_at}</p>
        </div>
        {reply.sent_at ? <Badge tone="green">sent {reply.sent_at}</Badge> : <Badge tone="blue">response draft</Badge>}
      </div>
      <p className="mt-3 whitespace-pre-wrap rounded-md border border-stone-200 bg-white p-3 text-sm text-stone-700">{reply.inbound_content}</p>
      <Form method="post" className="mt-3">
        <input type="hidden" name="intent" value="updateReplyResponse" />
        <input type="hidden" name="prospectId" value={prospect.id} />
        <input type="hidden" name="replyId" value={reply.id} />
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Response to send</p>
          <div className="flex gap-2">
            <CopyButton label="Copy" value={reply.suggested_response || ""} compact />
            <button className="inline-flex min-h-8 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-2 text-sm font-medium text-stone-800 hover:border-teal-700">
              <Save size={14} />
              Save
            </button>
          </div>
        </div>
        <textarea
          name="suggestedResponse"
          defaultValue={reply.suggested_response || ""}
          rows={5}
          required
          disabled={Boolean(reply.sent_at)}
          className="mt-2 min-h-28 w-full resize-y rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700 disabled:bg-stone-100 disabled:text-stone-500"
        />
      </Form>
      {!reply.sent_at ? (
        <ActionButton intent="markReplySent" prospectId={prospect.id} label="Mark response sent" icon={<Check size={16} />} primary extra={{ replyId: String(reply.id) }} />
      ) : null}
    </div>
  );
}

function NoNoteCallout() {
  return (
    <div className="border-t border-stone-200 pt-3">
      <p className="text-sm font-semibold">Connection note</p>
      <p className="mt-2 rounded-md border border-stone-200 bg-stone-50 p-3 text-sm text-stone-600">
        No custom note was sent. Use the first message after acceptance instead.
      </p>
    </div>
  );
}

function Badge({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "blue" }) {
  const className = tone === "blue" ? "bg-blue-50 text-blue-800" : "bg-teal-50 text-teal-800";
  return <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-xs font-semibold ${className}`}>{children}</span>;
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
  primary = false,
  danger = false,
  extra,
}: {
  intent: string;
  prospectId: number;
  label: string;
  icon: React.ReactNode;
  primary?: boolean;
  danger?: boolean;
  extra?: Record<string, string>;
}) {
  const className = primary
    ? "border-teal-700 bg-teal-700 text-white hover:bg-teal-800"
    : danger
      ? "border-stone-300 bg-white text-red-700 hover:border-red-300"
      : "border-stone-300 bg-white text-stone-800 hover:border-teal-700";

  return (
    <Form method="post">
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="prospectId" value={prospectId} />
      {extra ? Object.entries(extra).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />) : null}
      <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium ${className}`}>
        {icon}
        {label}
      </button>
    </Form>
  );
}

function DeleteProspectButton({ prospect }: { prospect: Prospect }) {
  return (
    <Form
      method="post"
      onSubmit={(event) => {
        const confirmed = window.confirm(`Delete ${prospect.name} from the outreach database? This cannot be undone.`);
        if (!confirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="intent" value="deleteProspect" />
      <input type="hidden" name="prospectId" value={prospect.id} />
      <button className="inline-flex min-h-8 items-center justify-center rounded-full bg-red-50 px-2.5 text-xs font-semibold text-red-800 hover:bg-red-100">
        Delete
      </button>
    </Form>
  );
}

function ArchiveControls({ prospect }: { prospect: Prospect }) {
  if (prospect.status === "archived") {
    return <ActionButton intent="reopenConversation" prospectId={prospect.id} label="Reopen" icon={<Undo2 size={14} />} />;
  }
  return <ActionButton intent="archiveProspect" prospectId={prospect.id} label="Archive" icon={<Archive size={14} />} danger />;
}

function CopyButton({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-medium text-stone-800 hover:border-teal-700 ${compact ? "min-h-8 px-2" : ""}`}
      onClick={() => navigator.clipboard.writeText(value)}
    >
      <Clipboard size={16} />
      {label}
    </button>
  );
}

function ActionLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-medium text-stone-800 hover:border-teal-700"
    >
      {icon}
      {label}
    </a>
  );
}

function EmptyState() {
  return <div className="rounded-lg border border-dashed border-stone-300 p-4 text-sm text-stone-500">Nothing here.</div>;
}
