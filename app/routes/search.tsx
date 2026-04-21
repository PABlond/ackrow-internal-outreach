import { Link, useLoaderData, useSearchParams } from "react-router";
import { ArrowLeft, ExternalLink, Search } from "lucide-react";

import type { Route } from "./+types/search";
import { getDashboard, type Prospect } from "~/lib/outreach.server";

const statuses = [
  "all",
  "to_contact",
  "connection_sent",
  "accepted",
  "report_sent",
  "followup_sent",
  "saved_for_later",
  "skipped",
  "archived_declined",
];

export const meta: Route.MetaFunction = () => [
  { title: "Search CRM · Tempolis Outreach" },
  { name: "description", content: "Search prospects already stored in the outreach CRM." },
];

export function loader() {
  return getDashboard();
}

export default function SearchCrmPage() {
  const data = useLoaderData<typeof loader>();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const status = params.get("status") || "all";
  const results = filterProspects(data.prospects, query, status);

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8 text-stone-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-stone-300 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-900">
              <ArrowLeft size={16} />
              Dashboard
            </Link>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal">Search CRM</h1>
            <p className="mt-2 max-w-3xl text-stone-600">
              Search prospects already stored in SQLite, including archived and skipped profiles, to avoid duplicates.
            </p>
          </div>
          <Link
            to="/discover"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-stone-300 bg-white px-4 font-medium text-stone-900 hover:border-teal-700"
          >
            Discover new prospects
          </Link>
        </header>

        <section className="mt-6 rounded-lg border border-stone-300 bg-white p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Search</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                <input
                  value={query}
                  onChange={(event) => updateParams(setParams, event.target.value, status)}
                  placeholder="Name, company, LinkedIn URL, topic, status..."
                  className="min-h-11 w-full rounded-md border border-stone-300 bg-stone-50 pl-10 pr-3 outline-none focus:border-teal-700"
                />
              </div>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Status</span>
              <select
                value={status}
                onChange={(event) => updateParams(setParams, query, event.target.value)}
                className="min-h-11 rounded-md border border-stone-300 bg-stone-50 px-3 outline-none focus:border-teal-700"
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-stone-300 bg-white">
          <div className="flex flex-col gap-1 border-b border-stone-300 p-5 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-xl font-semibold">Results</h2>
            <p className="text-sm text-stone-600">
              {results.length} of {data.prospects.length} prospects
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full border-collapse text-sm">
              <thead className="bg-stone-50 text-left text-xs font-bold uppercase text-stone-500">
                <tr>
                  <th className="border-b border-stone-300 px-4 py-3">Prospect</th>
                  <th className="border-b border-stone-300 px-4 py-3">Status</th>
                  <th className="border-b border-stone-300 px-4 py-3">Tag</th>
                  <th className="border-b border-stone-300 px-4 py-3">Wave</th>
                  <th className="border-b border-stone-300 px-4 py-3">Brief</th>
                  <th className="border-b border-stone-300 px-4 py-3">Links</th>
                </tr>
              </thead>
              <tbody>
                {results.map((prospect) => (
                  <tr key={prospect.id} className="hover:bg-stone-50">
                    <td className="border-b border-stone-200 px-4 py-3">
                      <Link to={`/prospects/${prospect.id}`} className="font-semibold text-stone-950 hover:text-teal-800">
                        {prospect.name}
                      </Link>
                      <p className="mt-1 max-w-xl truncate text-stone-600">{prospect.position}</p>
                    </td>
                    <td className="border-b border-stone-200 px-4 py-3"><Badge tone="blue">{prospect.status}</Badge></td>
                    <td className="border-b border-stone-200 px-4 py-3"><Badge>{prospect.priority_tag}</Badge></td>
                    <td className="border-b border-stone-200 px-4 py-3">{prospect.wave || "-"}</td>
                    <td className="border-b border-stone-200 px-4 py-3">{prospect.brief_topic || "-"}</td>
                    <td className="border-b border-stone-200 px-4 py-3">
                      <a className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900" href={prospect.profile_url} target="_blank" rel="noreferrer">
                        LinkedIn
                        <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length === 0 ? <div className="p-5 text-sm text-stone-500">No prospects found.</div> : null}
          </div>
        </section>
      </div>
    </main>
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

function updateParams(setParams: ReturnType<typeof useSearchParams>[1], query: string, status: string) {
  const next = new URLSearchParams();
  if (query.trim()) next.set("q", query);
  if (status !== "all") next.set("status", status);
  setParams(next);
}

function Badge({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "blue" }) {
  const className = tone === "blue" ? "bg-blue-50 text-blue-800" : "bg-teal-50 text-teal-800";
  return <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-xs font-semibold ${className}`}>{children}</span>;
}
