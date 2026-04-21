import { Form, Link, redirect, useLoaderData } from "react-router";
import { CalendarCheck, Check, Clipboard, Clock, ExternalLink, LinkIcon, Plus, Save, Search, Send, SkipForward, UserPlus, UserCheck } from "lucide-react";

import type { Route } from "./+types/home";
import { getDashboard, runProspectAction, type Prospect, type Task } from "~/lib/outreach.server";

export const meta: Route.MetaFunction = () => [
  { title: "Tempolis Outreach" },
  { name: "description", content: "Internal Tempolis outreach tracker." },
];

export function loader() {
  return getDashboard();
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  runProspectAction(formData);
  return redirect("/");
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const activeProspects = data.prospects.filter((prospect) => !["saved_for_later", "skipped", "archived_declined"].includes(prospect.status));

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8 text-stone-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-stone-300 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Internal CRM</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-normal">Tempolis Outreach</h1>
            <p className="mt-2 max-w-2xl text-stone-600">
              Daily command center for LinkedIn requests, accepted connections, shared briefs, and follow-ups.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/search"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 font-medium text-stone-900 hover:border-teal-700"
            >
              <Search size={18} />
              Search CRM
            </Link>
            <Link
              to="/discover"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 font-medium text-stone-900 hover:border-teal-700"
            >
              <UserPlus size={18} />
              Discover
            </Link>
            <Link
              to="/batch"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-teal-700 bg-teal-700 px-4 font-medium text-white hover:bg-teal-800"
            >
              <Plus size={18} />
              New batch
            </Link>
            <div className="rounded-lg border border-stone-300 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase text-stone-500">Today</p>
              <p className="text-lg font-semibold">{data.today}</p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Prospects" value={data.prospects.length} />
          <Metric label="Pending connections" value={data.sections.pendingConnections.length} />
          <Metric label="Reports to send" value={data.sections.acceptedReport.length} />
          <Metric label="Follow-ups due" value={data.sections.followupsDue.length} />
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-8">
            <section>
              <SectionTitle title="Today" detail="What needs attention first." />
              <div className="mt-3 grid gap-3">
                <TodayPanel title="Connect today" items={data.sections.toConnect}>
                  {(task) => {
                    const prospect = data.prospects.find((item) => item.id === task.prospect_id);
                    return prospect ? <DashboardTaskLink prospect={prospect} detail="Send LinkedIn connection request" /> : null;
                  }}
                </TodayPanel>
                <TodayPanel title="Accepted, report to send" items={data.sections.acceptedReport}>
                  {(prospect) => <DashboardTaskLink prospect={prospect} detail="Connection accepted, report to send" />}
                </TodayPanel>
                <TodayPanel title="Brief URLs missing" items={data.sections.missingBriefUrls}>
                  {(prospect) => <DashboardTaskLink prospect={prospect} detail={`Prepare brief URL for ${prospect.brief_topic || "brief"}`} />}
                </TodayPanel>
                <TodayPanel title="Follow-ups due" items={data.sections.followupsDue}>
                  {(task) => {
                    const prospect = data.prospects.find((item) => item.id === task.prospect_id);
                    return prospect ? <DashboardTaskLink prospect={prospect} detail={`Follow-up due ${task.due_date || ""}`} /> : null;
                  }}
                </TodayPanel>
                <TodayPanel title="Pending connections" items={data.sections.pendingConnections}>
                  {(prospect) => <DashboardTaskLink prospect={prospect} detail={`Sent ${prospect.connection_sent_date || "today"} · watch acceptance`} />}
                </TodayPanel>
              </div>
            </section>

            <section>
              <SectionTitle title="Prospects in progress" detail={`${activeProspects.length} profiles in the working set.`} />
              <ProspectsTable prospects={activeProspects} />
            </section>
          </div>

          <aside className="h-fit rounded-lg border border-stone-300 bg-white p-5 lg:sticky lg:top-6">
            <SectionTitle title="Timeline" detail="Latest events." />
            <div className="mt-4 space-y-4">
              {data.events.length === 0 ? (
                <EmptyState />
              ) : (
                data.events.map((event) => (
                  <div key={event.id} className="border-l-2 border-teal-700 pl-3">
                    <p className="font-medium">{event.name || "System"}</p>
                    <p className="text-sm text-stone-600">{event.type}</p>
                    <p className="mt-1 text-xs text-stone-500">
                      {event.happened_at} · {event.note}
                    </p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function DashboardTaskLink({ prospect, detail }: { prospect: Prospect; detail: string }) {
  return (
    <Link
      to={`/prospects/${prospect.id}`}
      className="grid gap-2 rounded-lg border border-stone-200 bg-stone-50 p-3 hover:border-teal-700 md:grid-cols-[1fr_auto] md:items-center"
    >
      <TaskIntro icon={<Clock size={18} />} title={prospect.name} detail={detail} />
      <div className="flex flex-wrap gap-2">
        <Badge>{prospect.priority_tag}</Badge>
        <Badge tone="blue">{prospect.status}</Badge>
      </div>
    </Link>
  );
}

function ProspectsTable({ prospects }: { prospects: Prospect[] }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-stone-300 bg-white">
      <table className="min-w-[900px] w-full border-collapse text-sm">
        <thead className="bg-stone-50 text-left text-xs font-bold uppercase text-stone-500">
          <tr>
            <th className="border-b border-stone-300 px-4 py-3">Prospect</th>
            <th className="border-b border-stone-300 px-4 py-3">Status</th>
            <th className="border-b border-stone-300 px-4 py-3">Wave</th>
            <th className="border-b border-stone-300 px-4 py-3">Brief</th>
            <th className="border-b border-stone-300 px-4 py-3">Next</th>
          </tr>
        </thead>
        <tbody>
          {prospects.map((prospect) => (
            <tr key={prospect.id} className="hover:bg-stone-50">
              <td className="border-b border-stone-200 px-4 py-3">
                <Link to={`/prospects/${prospect.id}`} className="font-semibold text-stone-950 hover:text-teal-800">
                  {prospect.name}
                </Link>
                <p className="mt-1 max-w-xl truncate text-stone-600">{prospect.position}</p>
              </td>
              <td className="border-b border-stone-200 px-4 py-3"><Badge tone="blue">{prospect.status}</Badge></td>
              <td className="border-b border-stone-200 px-4 py-3">{prospect.wave || "-"}</td>
              <td className="border-b border-stone-200 px-4 py-3">{prospect.brief_topic || "-"}</td>
              <td className="border-b border-stone-200 px-4 py-3 text-stone-600">{nextActionLabel(prospect)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function nextActionLabel(prospect: Prospect) {
  if (prospect.status === "to_contact" && prospect.contact_now) return "Send connection request";
  if (prospect.status === "connection_sent") return "Watch acceptance or archive";
  if (prospect.status === "accepted") return "Send report";
  if (prospect.status === "report_sent") return "Wait for follow-up";
  if (prospect.status === "followup_due") return "Send follow-up";
  if (prospect.status === "archived_declined") return "Archived";
  return "Review";
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-stone-300 bg-white p-5">
      <p className="text-sm text-stone-600">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
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

function TodayPanel<T>({ title, items, children }: { title: string; items: T[]; children: (item: T) => React.ReactNode }) {
  return (
    <div className="rounded-lg border border-stone-300 bg-white p-4">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-3 grid gap-2">{items.length ? items.map((item, index) => <div key={index}>{children(item)}</div>) : <EmptyState />}</div>
    </div>
  );
}

function ReportTask({ prospect }: { prospect: Prospect }) {
  return (
    <div className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 md:grid-cols-[1fr_auto] md:items-center">
      <TaskIntro icon={<Send size={18} />} title={prospect.name} detail={`${prospect.brief_topic || "No topic"} · report ready after acceptance`} />
      <div className="flex flex-wrap gap-2">
        <CopyButton label="Copy report" value={prospect.report_message || ""} />
        <ActionButton intent="markReportSent" prospectId={prospect.id} label="Mark report sent" icon={<Check size={16} />} primary />
      </div>
    </div>
  );
}

function ConnectTask({ prospect }: { prospect: Prospect }) {
  return (
    <div className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 md:grid-cols-[1fr_auto] md:items-center">
      <TaskIntro icon={<Send size={18} />} title={prospect.name} detail={`${prospect.brief_topic || "No topic"} · send LinkedIn connection request`} />
      <div className="flex flex-wrap gap-2">
        <CopyButton label="Copy request" value={prospect.connection_message || ""} />
        <ActionButton intent="markConnectionSent" prospectId={prospect.id} label="Mark sent" icon={<Check size={16} />} primary />
      </div>
    </div>
  );
}

function BriefUrlTask({ prospect }: { prospect: Prospect }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
      <TaskIntro icon={<LinkIcon size={18} />} title={prospect.name} detail={`Prepare: ${prospect.brief_topic}`} />
      <FormShell className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
        <input type="hidden" name="intent" value="addBriefUrl" />
        <input type="hidden" name="prospectId" value={prospect.id} />
        <input
          name="sharedUrl"
          type="url"
          required
          placeholder="https://tempolis.com/share/..."
          className="min-h-10 rounded-md border border-stone-300 bg-white px-3 outline-none focus:border-teal-700"
        />
        <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 font-medium hover:border-teal-700">
          <LinkIcon size={16} />
          Add URL
        </button>
      </FormShell>
    </div>
  );
}

function FollowupTask({ task, prospect, today }: { task: Task; prospect?: Prospect; today: string }) {
  const overdue = task.due_date && task.due_date < today;
  return (
    <div className={`grid gap-3 rounded-lg border bg-stone-50 p-3 md:grid-cols-[1fr_auto] md:items-center ${overdue ? "border-amber-500" : "border-stone-200"}`}>
      <TaskIntro icon={<CalendarCheck size={18} />} title={task.name || "Unknown"} detail={`Due ${task.due_date || "soon"}`} />
      <div className="flex flex-wrap gap-2">
        <CopyButton label="Copy follow-up" value={prospect?.followup_message || ""} />
        <ActionButton intent="markFollowupSent" prospectId={task.prospect_id || 0} label="Mark sent" icon={<Check size={16} />} primary />
      </div>
    </div>
  );
}

function PendingTask({ prospect }: { prospect: Prospect }) {
  return (
    <div className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 md:grid-cols-[1fr_auto] md:items-center">
      <TaskIntro icon={<Clock size={18} />} title={prospect.name} detail={`Sent ${prospect.connection_sent_date || "today"} · watch acceptance`} />
      <ActionButton intent="markAccepted" prospectId={prospect.id} label="Mark accepted" icon={<UserCheck size={16} />} primary />
    </div>
  );
}

function ProspectCard({ prospect }: { prospect: Prospect }) {
  return (
    <article className="rounded-lg border border-stone-300 bg-white p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">{prospect.name}</h3>
          <p className="mt-1 text-sm text-stone-600">{prospect.position}</p>
          <a className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-900" href={prospect.profile_url} target="_blank" rel="noreferrer">
            LinkedIn profile
            <ExternalLink size={14} />
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{prospect.priority_tag}</Badge>
          <Badge>Wave {prospect.wave || "-"}</Badge>
          <Badge tone="blue">{prospect.status}</Badge>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <InfoBlock title="Brief" value={prospect.brief_topic || "No brief yet"} detail={prospect.preparation_notes || undefined} link={prospect.shared_url || undefined} />
        <InfoBlock title="Rationale" value={prospect.rationale || prospect.notes || ""} />
      </div>

      <div className="mt-4 grid gap-3">
        <MessageBlock title="Connection message" content={prospect.connection_message} />
        <MessageBlock title="Report message" content={prospect.report_message} />
        <MessageBlock title="Follow-up" content={prospect.followup_message} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {prospect.status === "connection_sent" ? <ActionButton intent="markAccepted" prospectId={prospect.id} label="Mark accepted" icon={<UserCheck size={16} />} primary /> : null}
        {prospect.status === "to_contact" && prospect.contact_now ? <ActionButton intent="markConnectionSent" prospectId={prospect.id} label="Mark connection sent" icon={<Send size={16} />} primary /> : null}
        {prospect.connection_message ? <CopyButton label="Copy request" value={prospect.connection_message} /> : null}
        {prospect.report_message ? <CopyButton label="Copy report" value={prospect.report_message} /> : null}
        {prospect.status === "accepted" ? <ActionButton intent="markReportSent" prospectId={prospect.id} label="Mark report sent" icon={<Check size={16} />} primary /> : null}
        {prospect.followup_message ? <CopyButton label="Copy follow-up" value={prospect.followup_message} /> : null}
        <ActionButton intent="saveForLater" prospectId={prospect.id} label="Save for later" icon={<Save size={16} />} />
        <ActionButton intent="skip" prospectId={prospect.id} label="Skip" icon={<SkipForward size={16} />} danger />
      </div>
    </article>
  );
}

function TaskIntro({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-800">{icon}</div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-stone-600">{detail}</p>
      </div>
    </div>
  );
}

function InfoBlock({ title, value, detail, link }: { title: string; value: string; detail?: string; link?: string }) {
  return (
    <div className="border-t border-stone-200 pt-3">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-stone-700">{value}</p>
      {detail ? <p className="mt-1 text-sm text-stone-500">{detail}</p> : null}
      {link ? (
        <a className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-teal-700" href={link} target="_blank" rel="noreferrer">
          Shared brief <ExternalLink size={14} />
        </a>
      ) : null}
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
    <FormShell>
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="prospectId" value={prospectId} />
      <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium ${className}`}>
        {icon}
        {label}
      </button>
    </FormShell>
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

function FormShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Form method="post" className={className}>
      {children}
    </Form>
  );
}

function EmptyState() {
  return <div className="rounded-lg border border-dashed border-stone-300 p-4 text-sm text-stone-500">Nothing here.</div>;
}
