import { useState } from "react";
import { useActionData, Form, Link } from "react-router";
import { ArrowLeft, Brain, CheckCircle2, Clipboard, Plus, Send, Trash2 } from "lucide-react";

import type { Route } from "./+types/batch";
import { analyzeProspectTable, type BatchAnalysis } from "~/lib/batch.server";
import { importAnalyzedProspects } from "~/lib/outreach.server";

type ActionData =
  | { ok: true; analysis: BatchAnalysis }
  | { ok: false; error: string };

export const meta: Route.MetaFunction = () => [
  { title: "New batch · Tempolis Outreach" },
  { name: "description", content: "Analyze a pasted LinkedIn outreach batch with OpenRouter." },
];

export async function action({ request }: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const table = String(formData.get("table") || "");

  try {
    const analysis = await analyzeProspectTable(table);
    importAnalyzedProspects(analysis.prospects);
    return { ok: true, analysis };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export default function Batch() {
  const actionData = useActionData<typeof action>();
  const [rows, setRows] = useState([
    { name: "", position: "", profileUrl: "", about: "" },
    { name: "", position: "", profileUrl: "", about: "" },
    { name: "", position: "", profileUrl: "", about: "" },
  ]);
  const tablePayload = toTsv(rows);

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8 text-stone-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-stone-300 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-900">
              <ArrowLeft size={16} />
              Dashboard
            </Link>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal">New outreach batch</h1>
            <p className="mt-2 max-w-2xl text-stone-600">
              Paste a Google Sheets-style table, submit, and the app will classify prospects, generate brief topics, and save the plan to SQLite.
            </p>
          </div>
          <div className="rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-stone-600">
            Model: <span className="font-semibold text-stone-900">google/gemini-2.5-flash-lite</span>
          </div>
        </header>

        <section className="mt-6 rounded-lg border border-stone-300 bg-white p-5">
          <Form method="post" className="grid gap-4">
            <input type="hidden" name="table" value={tablePayload} />
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">Prospects</h2>
                  <p className="text-sm text-stone-600">Add one row per LinkedIn profile. Empty rows are ignored.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRows((current) => [...current, { name: "", position: "", profileUrl: "", about: "" }])}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 font-medium hover:border-teal-700"
                >
                  <Plus size={16} />
                  Add row
                </button>
              </div>

              <div className="mt-4 overflow-x-auto rounded-lg border border-stone-300">
                <table className="min-w-[1050px] w-full border-collapse bg-white text-sm">
                  <thead className="bg-stone-50 text-left text-xs font-bold uppercase text-stone-500">
                    <tr>
                      <th className="w-[170px] border-b border-stone-300 px-3 py-2">Name</th>
                      <th className="w-[260px] border-b border-stone-300 px-3 py-2">Position</th>
                      <th className="w-[260px] border-b border-stone-300 px-3 py-2">Profile URL</th>
                      <th className="border-b border-stone-300 px-3 py-2">About</th>
                      <th className="w-[56px] border-b border-stone-300 px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={index} className="align-top">
                        <td className="border-b border-stone-200 p-2">
                          <CellInput value={row.name} placeholder="Jane Doe" onChange={(value) => updateRow(index, "name", value)} />
                        </td>
                        <td className="border-b border-stone-200 p-2">
                          <CellInput value={row.position} placeholder="EU Public Affairs Manager" onChange={(value) => updateRow(index, "position", value)} />
                        </td>
                        <td className="border-b border-stone-200 p-2">
                          <CellInput value={row.profileUrl} placeholder="https://www.linkedin.com/in/..." onChange={(value) => updateRow(index, "profileUrl", value)} />
                        </td>
                        <td className="border-b border-stone-200 p-2">
                          <textarea
                            value={row.about}
                            onChange={(event) => updateRow(index, "about", event.target.value)}
                            rows={2}
                            placeholder="Short profile summary, LinkedIn about, sector, topics..."
                            className="min-h-20 w-full resize-y rounded-md border border-stone-300 bg-stone-50 px-3 py-2 outline-none focus:border-teal-700"
                          />
                        </td>
                        <td className="border-b border-stone-200 p-2">
                          <button
                            type="button"
                            onClick={() => removeRow(index)}
                            disabled={rows.length === 1}
                            aria-label="Remove row"
                            className="inline-flex size-10 items-center justify-center rounded-md border border-stone-300 bg-white text-red-700 hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                disabled={rows.filter(isFilledRow).length === 0}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-teal-700 bg-teal-700 px-4 font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-300"
              >
                <Brain size={18} />
                Analyze {rows.filter(isFilledRow).length || ""} and import
              </button>
              <p className="text-sm text-stone-600">Requires `OPENROUTER_API_KEY` in the shell running the app.</p>
            </div>
          </Form>
        </section>

        {actionData?.ok === false ? (
          <section className="mt-6 rounded-lg border border-red-300 bg-white p-5 text-red-800">
            <h2 className="text-lg font-semibold">Analysis failed</h2>
            <p className="mt-2 text-sm">{actionData.error}</p>
          </section>
        ) : null}

        {actionData?.ok ? <Results analysis={actionData.analysis} /> : null}
      </div>
    </main>
  );

  function updateRow(index: number, field: keyof (typeof rows)[number], value: string) {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
  }

  function removeRow(index: number) {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }
}

function CellInput({ value, placeholder, onChange }: { value: string; placeholder: string; onChange: (value: string) => void }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="min-h-10 w-full rounded-md border border-stone-300 bg-stone-50 px-3 outline-none focus:border-teal-700"
    />
  );
}

function toTsv(rows: Array<{ name: string; position: string; profileUrl: string; about: string }>) {
  const header = ["Name", "Position", "Profile URL", "About"];
  const body = rows.filter(isFilledRow).map((row) => [row.name, row.position, row.profileUrl, row.about].map(cleanCell).join("\t"));
  return [header.join("\t"), ...body].join("\n");
}

function cleanCell(value: string) {
  return value.replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}

function isFilledRow(row: { name: string; position: string; profileUrl: string; about: string }) {
  return Boolean(row.name.trim() || row.position.trim() || row.profileUrl.trim() || row.about.trim());
}

function Results({ analysis }: { analysis: BatchAnalysis }) {
  const toContact = analysis.prospects.filter((item) => item.contactNow);
  const wave2 = analysis.prospects.filter((item) => item.wave === 2);

  return (
    <section className="mt-6 grid gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Total" value={analysis.summary.total} />
        <Metric label="Connect today" value={analysis.summary.contactToday} />
        <Metric label="Wave 2" value={analysis.summary.wave2} />
        <Metric label="Saved" value={analysis.summary.saved} />
        <Metric label="Skipped" value={analysis.summary.skipped} />
      </div>

      <div className="rounded-lg border border-stone-300 bg-white p-5">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Send size={20} />
          Actions for today
        </h2>
        <div className="mt-4 grid gap-3">
          {toContact.length ? (
            toContact.map((prospect) => <ActionCard key={prospect.profileUrl} prospect={prospect} />)
          ) : (
            <Empty text="No first-wave contact recommended in this batch." />
          )}
        </div>
      </div>

      <div className="rounded-lg border border-stone-300 bg-white p-5">
        <h2 className="text-xl font-semibold">Wave 2 calibration</h2>
        <div className="mt-4 grid gap-3">
          {wave2.length ? wave2.map((prospect) => <MiniCard key={prospect.profileUrl} prospect={prospect} />) : <Empty text="No wave 2 profiles." />}
        </div>
      </div>

      <div className="rounded-lg border border-stone-300 bg-white p-5">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <CheckCircle2 size={20} />
          Full classification
        </h2>
        <div className="mt-4 grid gap-3">
          {analysis.prospects.map((prospect) => (
            <MiniCard key={prospect.profileUrl} prospect={prospect} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ActionCard({ prospect }: { prospect: BatchAnalysis["prospects"][number] }) {
  return (
    <article className="rounded-lg border border-stone-200 bg-stone-50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-semibold">{prospect.name}</h3>
          <p className="text-sm text-stone-600">{prospect.position}</p>
          <p className="mt-2 text-sm">
            Brief: <span className="font-semibold">{prospect.briefTopic}</span>
          </p>
          <p className="mt-1 text-sm text-stone-600">{prospect.rationale}</p>
        </div>
        <a className="text-sm font-medium text-teal-700 hover:text-teal-900" href={prospect.profileUrl} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </div>
      <Message title="Connection note" value={prospect.connectionMessage} />
      <Message title="After acceptance, with note" value={prospect.reportMessage} />
      <Message title="After acceptance, without note" value={prospect.noNoteReportMessage} />
      <Message title="Follow-up J+5" value={prospect.followupMessage} />
    </article>
  );
}

function MiniCard({ prospect }: { prospect: BatchAnalysis["prospects"][number] }) {
  return (
    <article className="rounded-lg border border-stone-200 bg-stone-50 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold">{prospect.name}</h3>
          <p className="text-sm text-stone-600">{prospect.position}</p>
          <p className="mt-2 text-sm text-stone-700">{prospect.rationale}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{prospect.priorityTag}</Badge>
          <Badge>Wave {prospect.wave || "-"}</Badge>
          {prospect.briefTopic ? <Badge>{prospect.briefTopic}</Badge> : null}
        </div>
      </div>
    </article>
  );
}

function Message({ title, value }: { title: string; value: string }) {
  if (!value) return null;
  return (
    <div className="mt-3 border-t border-stone-200 pt-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{title}</p>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(value)}
          className="inline-flex min-h-8 items-center gap-2 rounded-md border border-stone-300 bg-white px-2 text-sm font-medium hover:border-teal-700"
        >
          <Clipboard size={14} />
          Copy
        </button>
      </div>
      <p className="mt-2 whitespace-pre-wrap rounded-md border border-stone-200 bg-white p-3 text-sm text-stone-700">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-stone-300 bg-white p-4">
      <p className="text-sm text-stone-600">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex min-h-6 items-center rounded-full bg-teal-50 px-2.5 text-xs font-semibold text-teal-800">{children}</span>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-stone-300 p-4 text-sm text-stone-500">{text}</div>;
}
