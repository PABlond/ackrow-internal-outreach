import { useEffect, useState } from "react";
import { Form, Link, redirect, useLoaderData } from "react-router";
import {
  AtSign,
  CalendarCheck,
  Check,
  Clipboard,
  Clock,
  ExternalLink,
  LinkIcon,
  Send,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import type { Route } from "./+types/home";
import {
  getDashboard,
  runProspectAction,
  type DashboardStatsPoint,
  type Prospect,
  type Task,
} from "~/lib/outreach.server";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { statusVariant } from "~/components/prospects/status-badge";
import { cn } from "~/lib/utils";

export const meta: Route.MetaFunction = () => [
  { title: "Dashboard · Tempolis Outreach" },
  { name: "description", content: "Internal Tempolis outreach tracker." },
];

export async function loader() {
  return await getDashboard();
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  await runProspectAction(formData);
  return redirect("/");
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const activeProspects = data.prospects.filter(
    (prospect) =>
      !["saved_for_later", "skipped", "archived_declined", "archived"].includes(prospect.status),
  );
  const todoItems = buildTodoItems(data);

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Today's pipeline</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Daily command center for LinkedIn requests, accepted connections, shared briefs, and
              follow-ups.
            </p>
          </div>
          <div className="rounded-lg border bg-card px-4 py-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Today</p>
            <p className="text-lg font-semibold">{data.today}</p>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Prospects" value={data.prospects.length} />
          <MetricCard label="Pending connections" value={data.sections.pendingConnections.length} />
          <MetricCard label="Reports to send" value={data.sections.acceptedReport.length} />
          <MetricCard label="Active conversations" value={data.sections.conversationsActive.length} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <StatsChart
            title="Messages sent"
            detail="Last 7 days, across LinkedIn and Twitter/X."
            points={data.stats.messagesSent7d}
            totalLabel="total"
          />
          <StatsChart
            title="Prospect base"
            detail="Total prospects in CRM over the last 7 days."
            points={data.stats.prospects7d}
            totalLabel="today"
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-8">
            <section>
              <SectionTitle title="Todo" detail="Highest-priority actions across the pipeline." />
              <div className="mt-3 grid gap-3">
                {todoItems.length ? (
                  todoItems.map((item) => <TodoItemRow key={item.key} item={item} />)
                ) : (
                  <EmptyState />
                )}
              </div>
            </section>

            <section>
              <SectionTitle title="Today" detail="What needs attention first." />
              <div className="mt-3 grid gap-3">
                <TodayPanel
                  storageKey="connect-today"
                  title="Connect today"
                  items={data.sections.toConnect}
                >
                  {(task) => {
                    const prospect = data.prospects.find((item) => item.id === task.prospect_id);
                    return prospect ? (
                      <DashboardTaskLink
                        prospect={prospect}
                        detail="Send LinkedIn request with note, or without note if capped"
                      />
                    ) : null;
                  }}
                </TodayPanel>
                <TodayPanel
                  storageKey="twitter-dms"
                  title="Twitter/X DMs today"
                  items={data.sections.twitterToContact}
                >
                  {(task) => {
                    const prospect = data.prospects.find((item) => item.id === task.prospect_id);
                    return prospect ? (
                      <DashboardTaskLink
                        prospect={prospect}
                        detail="Send Twitter/X first touch manually"
                      />
                    ) : null;
                  }}
                </TodayPanel>
                <TodayPanel
                  storageKey="accepted-report"
                  title="Accepted, report to send"
                  items={data.sections.acceptedReport}
                >
                  {(prospect) => (
                    <DashboardTaskLink
                      prospect={prospect}
                      detail="Connection accepted, report to send"
                    />
                  )}
                </TodayPanel>
                <TodayPanel
                  storageKey="brief-urls-missing"
                  title="Brief URLs missing"
                  items={data.sections.missingBriefUrls}
                >
                  {(prospect) => (
                    <DashboardTaskLink
                      prospect={prospect}
                      detail={`Prepare brief URL for ${prospect.brief_topic || "brief"}`}
                    />
                  )}
                </TodayPanel>
                <TodayPanel
                  storageKey="followups-due"
                  title="Follow-ups due"
                  items={data.sections.followupsDue}
                >
                  {(task) => {
                    const prospect = data.prospects.find((item) => item.id === task.prospect_id);
                    return prospect ? (
                      <DashboardTaskLink
                        prospect={prospect}
                        detail={`Follow-up due ${task.due_date || ""}`}
                      />
                    ) : null;
                  }}
                </TodayPanel>
                <TodayPanel
                  storageKey="followups-scheduled"
                  title="Follow-ups scheduled"
                  items={data.sections.followupsScheduled}
                >
                  {(task) => {
                    const prospect = data.prospects.find((item) => item.id === task.prospect_id);
                    return prospect ? (
                      <DashboardTaskLink
                        prospect={prospect}
                        detail={`Follow-up scheduled ${task.due_date || ""}`}
                      />
                    ) : null;
                  }}
                </TodayPanel>
                <TodayPanel
                  storageKey="active-conversations"
                  title="Active conversations"
                  items={data.sections.conversationsActive}
                >
                  {(prospect) => (
                    <DashboardTaskLink
                      prospect={prospect}
                      detail="Prospect replied, conversation in progress"
                    />
                  )}
                </TodayPanel>
                <TodayPanel
                  storageKey="pending-connections"
                  title="Pending connections"
                  items={data.sections.pendingConnections}
                >
                  {(prospect) => (
                    <DashboardTaskLink
                      prospect={prospect}
                      detail={`${outreachModeLabel(prospect)} · sent ${prospect.connection_sent_date || "today"} · watch acceptance`}
                    />
                  )}
                </TodayPanel>
              </div>
            </section>

            <ProspectsInProgressPanel prospects={activeProspects} />
          </div>

          <aside className="h-fit lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <p className="text-sm text-muted-foreground">Latest events.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.events.length === 0 ? (
                  <EmptyState />
                ) : (
                  data.events.map((event) => (
                    <div key={event.id} className="border-l-2 border-primary pl-3">
                      <p className="font-medium">{event.name || "System"}</p>
                      <p className="text-sm text-muted-foreground">{event.type}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {event.happened_at} · {event.note}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ProspectsInProgressPanel({ prospects }: { prospects: Prospect[] }) {
  const storageKey = "outreach.dashboard.details.prospects-in-progress";
  const defaultOpen = prospects.length > 0;
  const [value, setValue] = useState(defaultOpen ? "item" : "");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "open") setValue("item");
    if (saved === "closed") setValue("");
  }, []);

  return (
    <Accordion
      type="single"
      collapsible
      value={value}
      onValueChange={(next) => {
        setValue(next);
        window.localStorage.setItem(storageKey, next ? "open" : "closed");
      }}
    >
      <AccordionItem value="item" className="border-none">
        <AccordionTrigger className="rounded-lg border bg-card px-4 py-3 hover:no-underline data-[state=open]:rounded-b-none">
          <div className="flex w-full items-center justify-between gap-3 pr-3">
            <div className="text-left">
              <h2 className="text-lg font-semibold">Prospects in progress</h2>
              <p className="text-sm font-normal text-muted-foreground">
                {prospects.length} profiles in the working set.
              </p>
            </div>
            <Badge variant={prospects.length ? "info" : "success"}>{prospects.length}</Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="rounded-b-lg border border-t-0 bg-card p-0">
          <ProspectsTable prospects={prospects} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function DashboardTaskLink({ prospect, detail }: { prospect: Prospect; detail: string }) {
  return (
    <div className="grid gap-2 rounded-lg border bg-muted/30 p-3 transition-colors hover:border-primary md:grid-cols-[1fr_auto] md:items-center">
      <Link to={`/prospects/${prospect.id}`} className="block">
        <TaskIntro icon={<Clock size={18} />} title={prospect.name} detail={detail} />
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        {prospect.priority_tag ? <Badge variant="muted">{prospect.priority_tag}</Badge> : null}
        <Badge variant={prospect.outreach_mode === "no_note" ? "info" : "success"}>
          {outreachModeLabel(prospect)}
        </Badge>
        <Badge variant={statusVariant(prospect.status)}>{prospect.status}</Badge>
        <Button asChild variant="outline" size="icon" className="size-8">
          <a
            href={prospect.twitter_url || prospect.profile_url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${prospect.name} profile`}
            title={prospect.source_channel === "twitter" ? "Open X profile" : "Open LinkedIn profile"}
          >
            <ExternalLink className="size-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}

type DashboardData = Awaited<ReturnType<typeof getDashboard>>;

type TodoItem = {
  key: string;
  priority: number;
  title: string;
  detail: string;
  kind: "message" | "followup" | "connection" | "twitter" | "brief" | "pending";
  prospect?: Prospect;
  task?: Task;
};

function buildTodoItems(data: DashboardData): TodoItem[] {
  const prospectsById = new Map(data.prospects.map((prospect) => [prospect.id, prospect]));
  const watchAcceptanceTasksByProspectId = new Map(
    data.tasks
      .filter((task) => task.status === "open" && task.type === "watch_acceptance" && task.prospect_id)
      .map((task) => [task.prospect_id, task]),
  );
  const todos: TodoItem[] = [];

  for (const prospect of data.sections.acceptedReport) {
    todos.push({
      key: `accepted-report-${prospect.id}`,
      priority: 10,
      title: `Send first message to ${prospect.name}`,
      detail: `${prospect.brief_topic || "No brief topic"} · connection accepted`,
      kind: "message",
      prospect,
    });
  }

  for (const task of data.sections.followupsDue) {
    const prospect = task.prospect_id ? prospectsById.get(task.prospect_id) : undefined;
    todos.push({
      key: `followup-${task.id}`,
      priority: task.due_date && task.due_date < data.today ? 20 : 25,
      title: `Send follow-up to ${task.name || prospect?.name || "prospect"}`,
      detail:
        task.due_date && task.due_date < data.today
          ? `Overdue since ${task.due_date}`
          : `Due ${task.due_date || "today"}`,
      kind: "followup",
      prospect,
      task,
    });
  }

  for (const task of data.sections.toConnect) {
    const prospect = task.prospect_id ? prospectsById.get(task.prospect_id) : undefined;
    if (!prospect) continue;
    todos.push({
      key: `connect-${task.id}`,
      priority: 30,
      title: `Send connection request to ${prospect.name}`,
      detail: `${outreachModeLabel(prospect)} · ${prospect.brief_topic || "no brief topic"}`,
      kind: "connection",
      prospect,
      task,
    });
  }

  for (const task of data.sections.twitterToContact) {
    const prospect = task.prospect_id ? prospectsById.get(task.prospect_id) : undefined;
    if (!prospect) continue;
    todos.push({
      key: `twitter-${task.id}`,
      priority: 30,
      title: `Send Twitter/X DM to ${prospect.name}`,
      detail: `${prospect.brief_topic || "no brief topic"} · manual first touch`,
      kind: "twitter",
      prospect,
      task,
    });
  }

  for (const prospect of data.sections.missingBriefUrls.filter(
    (item) => item.status !== "connection_sent",
  )) {
    todos.push({
      key: `brief-url-${prospect.id}`,
      priority: 40,
      title: `Add brief URL for ${prospect.name}`,
      detail: `Prepare ${prospect.brief_topic || "brief"} before first message`,
      kind: "brief",
      prospect,
    });
  }

  for (const prospect of data.sections.pendingConnections) {
    const watchTask = watchAcceptanceTasksByProspectId.get(prospect.id);
    const pendingAge = pendingTodoAgeMs(prospect, watchTask);
    if (pendingAge !== null && pendingAge < 4 * 60 * 60 * 1000) continue;

    todos.push({
      key: `pending-check-${prospect.id}`,
      priority: prospect.pending_checked_at ? 60 : 50,
      title: `Check pending connection for ${prospect.name}`,
      detail: prospect.pending_checked_at
        ? `Last checked ${formatRelativeAge(prospect.pending_checked_at)}`
        : `Never checked · sent ${prospect.connection_sent_date || "unknown date"}`,
      kind: "pending",
      prospect,
    });
  }

  return todos.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));
}

function TodoItemRow({ item }: { item: TodoItem }) {
  const icon =
    item.kind === "message" ? (
      <Send size={18} />
    ) : item.kind === "followup" ? (
      <CalendarCheck size={18} />
    ) : item.kind === "connection" ? (
      <UserPlus size={18} />
    ) : item.kind === "twitter" ? (
      <AtSign size={18} />
    ) : item.kind === "brief" ? (
      <LinkIcon size={18} />
    ) : (
      <Clock size={18} />
    );

  return (
    <Card>
      <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
        <Link to={item.prospect ? `/prospects/${item.prospect.id}` : "/"} className="block">
          <TaskIntro icon={icon} title={item.title} detail={item.detail} />
        </Link>
        <div className="flex flex-wrap gap-2">
          {item.prospect ? <ProfileButton prospect={item.prospect} /> : null}
          {item.kind === "message" && item.prospect?.post_acceptance_message ? (
            <CopyButton label="Copy message" value={item.prospect.post_acceptance_message} />
          ) : null}
          {item.kind === "message" && item.prospect ? (
            <ActionButton
              intent="markReportSent"
              prospectId={item.prospect.id}
              label="Mark sent"
              icon={<Check size={16} />}
              variant="default"
            />
          ) : null}
          {item.kind === "followup" && item.prospect ? (
            <CopyButton label="Copy follow-up" value={followupCopy(item.prospect, item.task)} />
          ) : null}
          {item.kind === "followup" && item.task?.prospect_id ? (
            <ActionButton
              intent={
                item.task.type === "send_twitter_followup"
                  ? "markTwitterFollowupSent"
                  : "markFollowupSent"
              }
              prospectId={item.task.prospect_id}
              label="Mark sent"
              icon={<Check size={16} />}
              variant="default"
            />
          ) : null}
          {item.kind === "connection" && item.prospect?.connection_message ? (
            <CopyButton label="Copy note" value={item.prospect.connection_message} />
          ) : null}
          {item.kind === "connection" && item.prospect ? (
            <ActionButton
              intent="markConnectionSentWithNote"
              prospectId={item.prospect.id}
              label="Sent with note"
              icon={<Send size={16} />}
              variant="default"
            />
          ) : null}
          {item.kind === "connection" && item.prospect ? (
            <ActionButton
              intent="markConnectionSentWithoutNote"
              prospectId={item.prospect.id}
              label="Sent without note"
              icon={<UserCheck size={16} />}
              variant="outline"
            />
          ) : null}
          {item.kind === "twitter" && item.prospect?.twitter_dm_message ? (
            <CopyButton label="Copy DM" value={item.prospect.twitter_dm_message} />
          ) : null}
          {item.kind === "twitter" && item.prospect ? (
            <ActionButton
              intent="markTwitterDmSent"
              prospectId={item.prospect.id}
              label="Mark DM sent"
              icon={<Send size={16} />}
              variant="default"
            />
          ) : null}
          {item.kind === "pending" && item.prospect ? (
            <Button asChild variant="outline" size="sm">
              <a href={item.prospect.profile_url} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                Check
              </a>
            </Button>
          ) : null}
          {item.kind === "brief" && item.prospect ? (
            <Button asChild variant="outline" size="sm">
              <Link to={`/prospects/${item.prospect.id}`}>
                <LinkIcon className="size-4" />
                Add URL
              </Link>
            </Button>
          ) : null}
          {item.kind === "brief" && item.prospect ? (
            <BriefUrlForm prospectId={item.prospect.id} />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function BriefUrlForm({ prospectId }: { prospectId: number }) {
  return (
    <Form method="post" className="flex items-center gap-2">
      <input type="hidden" name="intent" value="addBriefUrl" />
      <input type="hidden" name="prospectId" value={prospectId} />
      <Input
        name="sharedUrl"
        type="url"
        required
        placeholder="https://tempolis.com/share/..."
        className="h-9 w-64"
      />
      <Button type="submit" variant="secondary" size="sm">
        <LinkIcon className="size-4" />
        Save
      </Button>
    </Form>
  );
}

function ProfileButton({ prospect }: { prospect: Prospect }) {
  if (prospect.source_channel === "twitter") {
    return (
      <Button
        asChild
        size="sm"
        className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        <a
          href={prospect.twitter_url || prospect.profile_url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${prospect.name} on X`}
          title="Open X profile"
        >
          X
        </a>
      </Button>
    );
  }
  return (
    <Button
      asChild
      size="sm"
      className="bg-[#0a66c2] text-white hover:bg-[#004182] dark:bg-[#0a66c2] dark:hover:bg-[#004182]"
    >
      <a
        href={prospect.profile_url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${prospect.name} on LinkedIn`}
        title="Open LinkedIn profile"
      >
        in
      </a>
    </Button>
  );
}

function followupCopy(prospect: Prospect, task?: Task) {
  return task?.type === "send_twitter_followup"
    ? prospect.twitter_followup_message || prospect.followup_message || ""
    : prospect.followup_message || "";
}

function pendingTodoAgeMs(prospect: Prospect, watchTask?: Task) {
  if (prospect.pending_checked_at) return dateAgeMs(prospect.pending_checked_at);
  if (watchTask?.created_at) return dateAgeMs(watchTask.created_at);
  if (prospect.connection_sent_date && prospect.connection_sent_date < todayIsoClient())
    return 4 * 60 * 60 * 1000;
  if (prospect.connection_sent_date) return 0;
  return null;
}

function dateAgeMs(value: string | null) {
  if (!value) return null;
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const timestamp = Date.parse(normalized);
  if (Number.isNaN(timestamp)) return null;
  return Date.now() - timestamp;
}

function formatRelativeAge(value: string) {
  const ageMs = dateAgeMs(value);
  if (ageMs === null) return value;
  const minutes = Math.max(0, Math.round(ageMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function todayIsoClient() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function ProspectsTable({ prospects }: { prospects: Prospect[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prospect</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Wave</TableHead>
            <TableHead>Brief</TableHead>
            <TableHead>Next</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prospects.map((prospect) => (
            <TableRow key={prospect.id}>
              <TableCell>
                <Link
                  to={`/prospects/${prospect.id}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {prospect.name}
                </Link>
                <p className="mt-0.5 max-w-xl truncate text-xs text-muted-foreground">
                  {prospect.position}
                </p>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(prospect.status)}>{prospect.status}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{prospect.wave || "-"}</TableCell>
              <TableCell className="text-muted-foreground">{prospect.brief_topic || "-"}</TableCell>
              <TableCell className="text-muted-foreground">{nextActionLabel(prospect)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function nextActionLabel(prospect: Prospect) {
  if (prospect.status === "to_contact" && prospect.source_channel === "twitter")
    return "Send Twitter/X DM";
  if (prospect.status === "to_contact" && prospect.contact_now)
    return "Send request with note or without note";
  if (prospect.status === "twitter_contacted") return "Wait for Twitter/X follow-up";
  if (prospect.status === "connection_sent")
    return `${outreachModeLabel(prospect)} · watch acceptance`;
  if (prospect.status === "accepted") return "Send first message";
  if (prospect.status === "report_sent") return "Wait for follow-up";
  if (prospect.status === "conversation_active") return "Conversation in progress";
  if (prospect.status === "reply_sent") return "Response sent";
  if (prospect.status === "followup_due") return "Send follow-up";
  if (prospect.status === "archived_declined" || prospect.status === "archived") return "Archived";
  return "Review";
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function StatsChart({
  title,
  detail,
  points,
  totalLabel,
}: {
  title: string;
  detail: string;
  points: DashboardStatsPoint[];
  totalLabel: string;
}) {
  const max = Math.max(1, ...points.map((point) => point.value));
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const latest = points.at(-1)?.value || 0;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-2xl font-semibold tracking-tight">{latest}</p>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              {totalLabel === "total" ? `${total} total` : totalLabel}
            </p>
          </div>
        </div>
        <div className="mt-5 grid h-40 grid-cols-7 items-end gap-2 border-b pb-2">
          {points.map((point) => (
            <div key={point.date} className="flex h-full flex-col justify-end gap-2">
              <div className="flex min-h-6 items-center justify-center text-xs font-semibold text-muted-foreground">
                {point.value}
              </div>
              <div
                className="min-h-2 rounded-t-md bg-primary/80"
                style={{
                  height: point.value === 0 ? "0px" : `${Math.max(8, Math.round((point.value / max) * 104))}px`,
                }}
                title={`${point.date}: ${point.value}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
          {points.map((point) => (
            <span key={point.date}>{point.label}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SectionTitle({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function TodayPanel<T>({
  storageKey,
  title,
  items,
  children,
}: {
  storageKey: string;
  title: string;
  items: T[];
  children: (item: T) => React.ReactNode;
}) {
  const key = `outreach.dashboard.details.today-${storageKey}`;
  const defaultOpen = items.length > 0;
  const [value, setValue] = useState(defaultOpen ? "item" : "");

  useEffect(() => {
    const saved = window.localStorage.getItem(key);
    if (saved === "open") setValue("item");
    if (saved === "closed") setValue("");
  }, [key]);

  return (
    <Accordion
      type="single"
      collapsible
      value={value}
      onValueChange={(next) => {
        setValue(next);
        window.localStorage.setItem(key, next ? "open" : "closed");
      }}
    >
      <AccordionItem value="item" className="border-none">
        <AccordionTrigger className="rounded-lg border bg-card px-4 py-3 hover:no-underline data-[state=open]:rounded-b-none">
          <div className="flex w-full items-center justify-between gap-3 pr-3">
            <h3 className="font-semibold">{title}</h3>
            <Badge variant={items.length ? "info" : "success"}>{items.length}</Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="rounded-b-lg border border-t-0 bg-card px-4 pb-4 pt-0">
          <div className="grid gap-2">
            {items.length ? (
              items.map((item, index) => <div key={index}>{children(item)}</div>)
            ) : (
              <EmptyState />
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function TaskIntro({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>
        <p className="truncate text-sm text-muted-foreground">{detail}</p>
      </div>
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
}: {
  intent: string;
  prospectId: number;
  label: string;
  icon: React.ReactNode;
  variant?: "default" | "outline" | "destructive" | "secondary";
}) {
  return (
    <Form method="post">
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="prospectId" value={prospectId} />
      <Button type="submit" variant={variant} size="sm">
        {icon}
        {label}
      </Button>
    </Form>
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
      size={compact ? "sm" : "sm"}
      onClick={() => {
        navigator.clipboard.writeText(value);
        toast.success("Copied to clipboard");
      }}
      className={cn(compact && "h-8 px-2")}
    >
      <Clipboard className="size-4" />
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
