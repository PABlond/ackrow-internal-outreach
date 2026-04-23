import { Link, useLoaderData, useSearchParams } from "react-router";
import { ExternalLink, Search } from "lucide-react";

import type { Route } from "./+types/prospects._index";
import { getDashboard, requireWorkspace, type Prospect } from "~/lib/outreach.server";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { statusVariant } from "~/components/prospects/status-badge";

const statuses = [
  "all",
  "to_contact",
  "connection_sent",
  "twitter_contacted",
  "accepted",
  "report_sent",
  "followup_sent",
  "saved_for_later",
  "skipped",
  "archived_declined",
  "archived",
];

export const meta: Route.MetaFunction = () => [
  { title: "Prospects · Outreach" },
  { name: "description", content: "Browse and filter prospects stored in the outreach CRM." },
];

export async function loader({ params }: Route.LoaderArgs) {
  const workspace = await requireWorkspace(params.workspaceSlug);
  return await getDashboard(workspace);
}

export default function ProspectsIndex() {
  const data = useLoaderData<typeof loader>();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const status = params.get("status") || "all";
  const results = filterProspects(data.prospects, query, status);

  function updateParams(nextQuery: string, nextStatus: string) {
    const next = new URLSearchParams();
    if (nextQuery.trim()) next.set("q", nextQuery);
    if (nextStatus !== "all") next.set("status", nextStatus);
    setParams(next);
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">CRM</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Prospects</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Search every prospect stored in the CRM, including archived and skipped profiles.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {results.length} of {data.prospects.length}
          </div>
        </header>

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    value={query}
                    onChange={(event) => updateParams(event.target.value, status)}
                    placeholder="Name, company, URL, topic, status..."
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => updateParams(query, value)}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prospect</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Wave</TableHead>
                <TableHead>Brief</TableHead>
                <TableHead className="text-right">Profile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No prospects found.
                  </TableCell>
                </TableRow>
              ) : (
                results.map((prospect) => (
                  <TableRow key={prospect.id}>
                    <TableCell className="max-w-md">
                      <Link
                        to={`/${data.workspace.slug}/prospects/${prospect.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {prospect.name}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {prospect.position}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(prospect.status)}>{prospect.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {prospect.priority_tag ? (
                        <Badge variant="muted">{prospect.priority_tag}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {prospect.wave || "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {prospect.brief_topic || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <a
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        href={prospect.twitter_url || prospect.profile_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {prospect.source_channel === "twitter" ? "X" : "LinkedIn"}
                        <ExternalLink className="size-3" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

function filterProspects(prospects: Prospect[], query: string, status: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return prospects.filter((prospect) => {
    if (status !== "all" && prospect.status !== status) return false;
    if (terms.length === 0) return true;
    const haystack = [
      prospect.name,
      prospect.position,
      prospect.profile_url,
      prospect.twitter_url,
      prospect.twitter_handle,
      prospect.source_channel,
      prospect.about,
      prospect.priority_tag,
      prospect.status,
      prospect.brief_topic,
      prospect.rationale,
      prospect.notes,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
