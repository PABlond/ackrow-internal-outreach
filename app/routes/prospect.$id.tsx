import { Form, Link, redirect, useLoaderData } from "react-router";
import { Archive, ArrowLeft, CalendarCheck, Check, Clipboard, ExternalLink, LinkIcon, RefreshCw, Save, Send, SkipForward, UserCheck } from "lucide-react";

import type { Route } from "./+types/prospect.$id";
import { getProspectDetail, runProspectAction, type Prospect, type Task } from "~/lib/outreach.server";

export const meta: Route.MetaFunction = ({ data }) => {
  const name = data?.detail?.prospect?.name || "Prospect";
  return [{ title: `${name} · Tempolis Outreach` }];
};

export function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);
  const detail = getProspectDetail(id);
  if (!detail) {
    throw new Response("Prospect not found", { status: 404 });
  }
  return { detail };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  await runProspectAction(formData);
  return redirect(`/prospects/${params.id}`);
}

export default function ProspectDetail() {
  const { detail } = useLoaderData<typeof loader>();
  const { prospect, tasks, events, today } = detail;
  const openTasks = tasks.filter((task) => task.status === "open");
  const doneTasks = tasks.filter((task) => task.status !== "open");

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
            <a className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-900" href={prospect.profile_url} target="_blank" rel="noreferrer">
              LinkedIn profile
              <ExternalLink size={14} />
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{prospect.priority_tag}</Badge>
            <Badge>Wave {prospect.wave || "-"}</Badge>
            <Badge tone={prospect.outreach_mode === "no_note" ? "blue" : "green"}>{outreachModeLabel(prospect)}</Badge>
            <Badge tone="blue">{prospect.status}</Badge>
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

            <section className="rounded-lg border border-stone-300 bg-white p-5">
              <SectionTitle title="Outreach mode" detail="Switch the copy strategy before sending." />
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
            </section>

            <section className="rounded-lg border border-stone-300 bg-white p-5">
              <SectionTitle title="Brief" detail="Topic and shared URL." />
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <InfoBlock title="Topic" value={prospect.brief_topic || "No brief topic"} detail={prospect.preparation_notes || undefined} />
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
            </section>

            <section className="rounded-lg border border-stone-300 bg-white p-5">
              <SectionTitle title="Messages" detail="Copy exact LinkedIn copy." />
              <div className="mt-4 grid gap-3">
                <MessageBlock title="Connection note" content={prospect.connection_message} />
                <MessageBlock title={prospect.outreach_mode === "no_note" ? "First message after acceptance" : "After acceptance"} content={prospect.post_acceptance_message} />
                <MessageBlock title="Follow-up J+5" content={prospect.followup_message} />
              </div>
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

function InfoBlock({ title, value, detail }: { title: string; value: string; detail?: string }) {
  return (
    <div className="border-t border-stone-200 pt-3">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-stone-700">{value}</p>
      {detail ? <p className="mt-1 text-sm text-stone-500">{detail}</p> : null}
    </div>
  );
}

function MessageBlock({ title, content }: { title: string; content: string | null }) {
  if (!content) return null;
  return (
    <div className="border-t border-stone-200 pt-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{title}</p>
        <CopyButton label="Copy" value={content} compact />
      </div>
      <p className="mt-2 whitespace-pre-wrap rounded-md border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">{content}</p>
    </div>
  );
}

function Badge({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "blue" }) {
  const className = tone === "blue" ? "bg-blue-50 text-blue-800" : "bg-teal-50 text-teal-800";
  return <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-xs font-semibold ${className}`}>{children}</span>;
}

function outreachModeLabel(prospect: Prospect) {
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
}: {
  intent: string;
  prospectId: number;
  label: string;
  icon: React.ReactNode;
  primary?: boolean;
  danger?: boolean;
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
      <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium ${className}`}>
        {icon}
        {label}
      </button>
    </Form>
  );
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

function EmptyState() {
  return <div className="rounded-lg border border-dashed border-stone-300 p-4 text-sm text-stone-500">Nothing here.</div>;
}
