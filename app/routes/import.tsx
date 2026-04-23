import { useEffect, useState } from "react";
import { Form, useActionData, useNavigation, useSearchParams } from "react-router";
import { AtSign, Brain, CheckCircle2, Clipboard, Loader2, Plus, Send, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import type { Route } from "./+types/import";
import { analyzeProspectTable, analyzeTwitterProspectTable, type BatchAnalysis } from "~/lib/batch.server";
import { importAnalyzedProspects } from "~/lib/outreach.server";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";

type Source = "linkedin" | "x";

type Row = {
  name: string;
  position: string;
  profileUrl: string;
  about: string;
  signals: string;
  briefDirection: string;
};

type ActionData =
  | { ok: true; source: Source; analysis: BatchAnalysis }
  | { ok: false; source: Source; error: string };

const emptyRow: Row = { name: "", position: "", profileUrl: "", about: "", signals: "", briefDirection: "" };

export const meta: Route.MetaFunction = () => [
  { title: "Import · Tempolis Outreach" },
  { name: "description", content: "Import and classify LinkedIn or X prospects in one place." },
];

export async function action({ request }: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const source = (String(formData.get("source") || "linkedin") === "x" ? "x" : "linkedin") as Source;
  const table = String(formData.get("table") || "");

  try {
    const analysis = source === "x"
      ? await analyzeTwitterProspectTable(table)
      : await analyzeProspectTable(table);
    await importAnalyzedProspects(analysis.prospects);
    return { ok: true, source, analysis };
  } catch (error) {
    return { ok: false, source, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export default function ImportPage() {
  const [params, setParams] = useSearchParams();
  const source: Source = (params.get("source") === "x" ? "x" : "linkedin");

  function setSource(next: Source) {
    const nextParams = new URLSearchParams(params);
    if (next === "linkedin") nextParams.delete("source");
    else nextParams.set("source", next);
    setParams(nextParams, { preventScrollReset: true });
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Prospecting</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Import prospects</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Paste profiles from LinkedIn or X, submit, and the app will classify them, generate outreach copy,
              and save everything to the CRM.
            </p>
          </div>
          <Badge variant="muted" className="px-3 py-1 text-[11px]">
            Model: google/gemini-2.5-flash-lite
          </Badge>
        </header>

        <Tabs value={source} onValueChange={(v) => setSource(v as Source)}>
          <TabsList>
            <TabsTrigger value="linkedin">
              <Users className="size-4" />
              LinkedIn
            </TabsTrigger>
            <TabsTrigger value="x">
              <AtSign className="size-4" />
              X / Twitter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="linkedin">
            <ImportForm source="linkedin" />
          </TabsContent>
          <TabsContent value="x">
            <ImportForm source="x" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ImportForm({ source }: { source: Source }) {
  const actionData = useActionData<typeof action>() as ActionData | undefined;
  const navigation = useNavigation();
  const [rows, setRows] = useState<Row[]>([{ ...emptyRow }, { ...emptyRow }, { ...emptyRow }]);
  const tablePayload = toTsv(rows);
  const filled = rows.filter(isFilled);
  const submitting =
    navigation.state === "submitting" && navigation.formData?.get("source") === source;

  useEffect(() => {
    if (!actionData || actionData.source !== source) return;
    if (actionData.ok) {
      toast.success(`Imported ${actionData.analysis.summary.total} prospect${actionData.analysis.summary.total > 1 ? "s" : ""}`);
    } else {
      toast.error("Analysis failed", { description: actionData.error });
    }
  }, [actionData, source]);

  function update(index: number, field: keyof Row, value: string) {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  return (
    <div className="mt-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Profiles</CardTitle>
              <CardDescription>
                {source === "linkedin"
                  ? "One row per LinkedIn profile. Empty rows are ignored."
                  : "One row per X profile. Use posts/signals to help pick a sharper brief topic."}
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRows((current) => [...current, { ...emptyRow }])}
            >
              <Plus className="size-4" />
              Add row
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="source" value={source} />
            <input type="hidden" name="table" value={tablePayload} />

            <div className="overflow-x-auto rounded-md border">
              <table className="w-full min-w-[1480px] border-collapse text-sm">
                <thead className="bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="w-[170px] border-b px-3 py-2">Name</th>
                    <th className="w-[250px] border-b px-3 py-2">
                      {source === "x" ? "Role / context" : "Position"}
                    </th>
                    <th className="w-[250px] border-b px-3 py-2">
                      {source === "x" ? "X URL or handle" : "Profile URL"}
                    </th>
                    <th className="w-[300px] border-b px-3 py-2">
                      {source === "x" ? "Bio / about" : "About"}
                    </th>
                    <th className="w-[340px] border-b px-3 py-2">Posts / signals</th>
                    <th className="w-[190px] border-b px-3 py-2">Brief direction</th>
                    <th className="w-[56px] border-b px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index} className="align-top">
                      <td className="border-b p-2">
                        <Input
                          value={row.name}
                          onChange={(e) => update(index, "name", e.target.value)}
                          placeholder="Jane Doe"
                        />
                      </td>
                      <td className="border-b p-2">
                        <Input
                          value={row.position}
                          onChange={(e) => update(index, "position", e.target.value)}
                          placeholder={source === "x" ? "EU policy analyst, journalist..." : "EU Public Affairs Manager"}
                        />
                      </td>
                      <td className="border-b p-2">
                        <Input
                          value={row.profileUrl}
                          onChange={(e) => update(index, "profileUrl", e.target.value)}
                          placeholder={source === "x" ? "@handle or https://x.com/handle" : "https://www.linkedin.com/in/..."}
                        />
                      </td>
                      <td className="border-b p-2">
                        <Textarea
                          value={row.about}
                          onChange={(e) => update(index, "about", e.target.value)}
                          rows={2}
                          placeholder={source === "x" ? "Bio, public role, org, topics..." : "Short profile summary, about, sector, topics..."}
                          className="min-h-20"
                        />
                      </td>
                      <td className="border-b p-2">
                        <Textarea
                          value={row.signals}
                          onChange={(e) => update(index, "signals", e.target.value)}
                          rows={2}
                          placeholder={source === "x" ? "Recent posts, reposts, recurring themes..." : "Recent posts, experience, client context..."}
                          className="min-h-20"
                        />
                      </td>
                      <td className="border-b p-2">
                        <Input
                          value={row.briefDirection}
                          onChange={(e) => update(index, "briefDirection", e.target.value)}
                          placeholder="AI Act, EU competitiveness..."
                        />
                      </td>
                      <td className="border-b p-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Remove row"
                          disabled={rows.length === 1}
                          onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
                          className="text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={filled.length === 0 || submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Brain className="size-4" />}
                {submitting ? "Analyzing..." : `Analyze ${filled.length || ""} and import`}
              </Button>
              <p className="text-xs text-muted-foreground">
                Requires <code className="rounded bg-muted px-1 py-0.5">OPENROUTER_API_KEY</code>.
              </p>
            </div>
          </Form>
        </CardContent>
      </Card>

      {actionData?.source === source && actionData.ok ? (
        <Results source={source} analysis={actionData.analysis} />
      ) : null}
    </div>
  );
}

function Results({ source, analysis }: { source: Source; analysis: BatchAnalysis }) {
  const toContact = analysis.prospects.filter((p) => p.contactNow);
  const wave2 = analysis.prospects.filter((p) => p.wave === 2);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Total" value={analysis.summary.total} />
        <Metric label={source === "x" ? "DM today" : "Connect today"} value={analysis.summary.contactToday} />
        <Metric label="Wave 2" value={analysis.summary.wave2} />
        <Metric label="Saved" value={analysis.summary.saved} />
        <Metric label="Skipped" value={analysis.summary.skipped} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="size-5" />
            {source === "x" ? "X / Twitter actions" : "Actions for today"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {toContact.length ? (
            toContact.map((p) => <ActionCard key={p.profileUrl} prospect={p} source={source} />)
          ) : (
            <Empty text="No first-wave contact recommended in this batch." />
          )}
        </CardContent>
      </Card>

      {source === "linkedin" && wave2.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Wave 2 calibration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {wave2.map((p) => <MiniCard key={p.profileUrl} prospect={p} />)}
          </CardContent>
        </Card>
      ) : null}

      {source === "linkedin" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5" />
              Full classification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.prospects.map((p) => <MiniCard key={p.profileUrl} prospect={p} />)}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function ActionCard({
  prospect,
  source,
}: {
  prospect: BatchAnalysis["prospects"][number];
  source: Source;
}) {
  return (
    <article className="rounded-lg border bg-muted/30 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-semibold">{prospect.name}</h3>
          <p className="text-sm text-muted-foreground">{prospect.position}</p>
          <p className="mt-2 text-sm">
            Brief: <span className="font-semibold">{prospect.briefTopic}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{prospect.rationale}</p>
        </div>
        <a
          className="text-sm font-medium text-primary hover:underline"
          href={prospect.profileUrl}
          target="_blank"
          rel="noreferrer"
        >
          {source === "x" ? "X profile" : "LinkedIn"}
        </a>
      </div>
      {source === "x" ? (
        <>
          <Message title="DM / first touch" value={prospect.twitterDmMessage || ""} />
          <Message title="Follow-up J+2" value={prospect.twitterFollowupMessage || prospect.followupMessage} />
        </>
      ) : (
        <>
          <Message title="Connection note" value={prospect.connectionMessage} />
          <Message title="After acceptance, with note" value={prospect.reportMessage} />
          <Message title="After acceptance, without note" value={prospect.noNoteReportMessage} />
          <Message title="Follow-up J+2" value={prospect.followupMessage} />
        </>
      )}
    </article>
  );
}

function MiniCard({ prospect }: { prospect: BatchAnalysis["prospects"][number] }) {
  return (
    <article className="rounded-lg border bg-muted/30 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold">{prospect.name}</h3>
          <p className="text-sm text-muted-foreground">{prospect.position}</p>
          <p className="mt-2 text-sm">{prospect.rationale}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="muted">{prospect.priorityTag}</Badge>
          <Badge variant="muted">Wave {prospect.wave || "-"}</Badge>
          {prospect.briefTopic ? <Badge variant="muted">{prospect.briefTopic}</Badge> : null}
        </div>
      </div>
    </article>
  );
}

function Message({ title, value }: { title: string; value: string }) {
  if (!value) return null;
  return (
    <div className={cn("mt-3 border-t pt-3")}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{title}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(value);
            toast.success(`${title} copied`);
          }}
        >
          <Clipboard className="size-3" />
          Copy
        </Button>
      </div>
      <p className="mt-2 whitespace-pre-wrap rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
        {value}
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">{text}</div>
  );
}

function toTsv(rows: Row[]) {
  const header = ["Name", "Position", "Profile URL", "About", "Signals", "Brief direction"];
  const body = rows
    .filter(isFilled)
    .map((row) =>
      [row.name, row.position, row.profileUrl, row.about, row.signals, row.briefDirection].map(clean).join("\t"),
    );
  return [header.join("\t"), ...body].join("\n");
}

function clean(value: string) {
  return value.replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}

function isFilled(row: Row) {
  return Boolean(
    row.name.trim() ||
      row.position.trim() ||
      row.profileUrl.trim() ||
      row.about.trim() ||
      row.signals.trim() ||
      row.briefDirection.trim(),
  );
}
