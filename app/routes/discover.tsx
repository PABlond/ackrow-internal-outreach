import { Copy, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";

import type { Route } from "./+types/discover";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

type SearchGroup = {
  title: string;
  description: string;
  queries: SearchQuery[];
};

type SearchQuery = {
  label: string;
  intent: string;
  query: string;
};

const groups: SearchGroup[] = [
  {
    title: "EU public affairs",
    description: "Good first-wave LEARN profiles: consultants, advisors, managers around EU affairs and Brussels.",
    queries: [
      {
        label: "EU public affairs Brussels",
        intent: "Broad public affairs profiles around Brussels.",
        query: 'site:linkedin.com/in ("public affairs" OR "EU affairs" OR "government relations") ("Brussels" OR "EU" OR "European Union")',
      },
      {
        label: "Consultants and advisors",
        intent: "Consultants likely to produce notes, briefs, monitoring and client updates.",
        query: 'site:linkedin.com/in ("EU affairs consultant" OR "public affairs consultant" OR "policy advisor") ("Brussels" OR "EU")',
      },
      {
        label: "Policy communications",
        intent: "Comms profiles close to policy rooms and narrative work.",
        query: 'site:linkedin.com/in ("policy communications" OR "political communications" OR "strategic communications") ("Brussels" OR "EU")',
      },
      {
        label: "Stakeholder and advocacy",
        intent: "Operational profiles useful for early outreach learning.",
        query: 'site:linkedin.com/in ("stakeholder engagement" OR advocacy OR "institutional relations") ("EU" OR Brussels)',
      },
    ],
  },
  {
    title: "Corporate public affairs",
    description: "Company-side policy roles in regulated sectors. Mix with WARM/SAVE judgment before contacting.",
    queries: [
      {
        label: "Tech policy",
        intent: "Digital, AI, platform and data policy profiles.",
        query: 'site:linkedin.com/in ("digital policy" OR "tech policy" OR "AI policy" OR "platform regulation") ("Brussels" OR "EU" OR Europe)',
      },
      {
        label: "Big tech public policy",
        intent: "Premium profiles; usually SAVE if very senior.",
        query: 'site:linkedin.com/in ("public policy" OR "government affairs") ("Google" OR Meta OR Microsoft OR Amazon OR Apple) ("EU" OR Europe OR Brussels)',
      },
      {
        label: "Energy public affairs",
        intent: "Energy security, nuclear, renewables, climate policy.",
        query: 'site:linkedin.com/in ("public affairs" OR "government affairs" OR "regulatory affairs") (energy OR renewables OR nuclear) ("EU" OR Brussels)',
      },
      {
        label: "Pharma and health",
        intent: "Health policy and regulatory affairs prospects.",
        query: 'site:linkedin.com/in ("public affairs" OR "regulatory affairs" OR "government affairs") (pharma OR health OR medicines) ("EU" OR Europe OR Brussels)',
      },
      {
        label: "Finance regulation",
        intent: "Financial regulation, sustainable finance and competition profiles.",
        query: 'site:linkedin.com/in ("public affairs" OR "regulatory affairs") ("financial regulation" OR "sustainable finance" OR "competition policy") ("EU" OR Europe)',
      },
    ],
  },
  {
    title: "Think tanks and research",
    description: "Analysts and fellows who can give high-quality feedback on signal value and brief structure.",
    queries: [
      {
        label: "EU policy analysts",
        intent: "General EU policy analysts and researchers.",
        query: 'site:linkedin.com/in ("EU policy analyst" OR "European policy researcher" OR "research fellow") ("Europe" OR Brussels)',
      },
      {
        label: "Political risk",
        intent: "Analysts likely to understand narrative monitoring.",
        query: 'site:linkedin.com/in ("political risk analyst" OR "foresight analyst" OR "geopolitics analyst") Europe',
      },
      {
        label: "Migration and enlargement",
        intent: "Good issue-led searches for analyst profiles.",
        query: 'site:linkedin.com/in ("migration policy analyst" OR "EU enlargement analyst" OR "foreign policy analyst") Europe',
      },
      {
        label: "Climate and energy analysts",
        intent: "Policy researchers around climate and energy.",
        query: 'site:linkedin.com/in ("climate policy analyst" OR "energy policy analyst") ("EU" OR Europe)',
      },
    ],
  },
  {
    title: "Journalists and media",
    description: "Useful for feedback on pre-publication signal and narrative framing.",
    queries: [
      {
        label: "Brussels correspondents",
        intent: "EU politics and Brussels reporters.",
        query: 'site:linkedin.com/in ("Brussels correspondent" OR "EU affairs reporter" OR "political correspondent")',
      },
      {
        label: "Policy reporters",
        intent: "Sector reporters around EU policy.",
        query: 'site:linkedin.com/in ("EU policy reporter" OR "technology policy reporter" OR "energy reporter") Europe',
      },
      {
        label: "Political newsletters",
        intent: "Writers/editors close to political risk and public discourse.",
        query: 'site:linkedin.com/in ("political risk newsletter" OR "Europe editor" OR "foreign affairs reporter") Europe',
      },
    ],
  },
  {
    title: "Issue-led searches",
    description: "Composable searches from the playbook: métier + sujet + EU/Brussels signal.",
    queries: [
      {
        label: "AI Act",
        intent: "Good for digital policy and tech regulation prospects.",
        query: 'site:linkedin.com/in ("public affairs" OR "public policy" OR "policy advisor") ("AI Act" OR "artificial intelligence policy") ("EU" OR Brussels OR Europe)',
      },
      {
        label: "DSA / DMA",
        intent: "Platform regulation and competition policy.",
        query: 'site:linkedin.com/in ("Digital Services Act" OR "Digital Markets Act" OR "platform regulation") ("public policy" OR "government affairs" OR "public affairs")',
      },
      {
        label: "Cybersecurity",
        intent: "Cyber, cloud and data policy profiles.",
        query: 'site:linkedin.com/in ("cybersecurity policy" OR "cloud policy" OR "data protection") ("EU" OR Brussels OR Europe)',
      },
      {
        label: "Ukraine / defence",
        intent: "International affairs and defence policy analysts.",
        query: 'site:linkedin.com/in ("defence policy" OR "European defence" OR Ukraine) ("policy analyst" OR "policy advisor" OR "public affairs") Europe',
      },
      {
        label: "Climate policy",
        intent: "Climate, CBAM, Fit for 55 and energy-transition policy.",
        query: 'site:linkedin.com/in ("climate policy" OR CBAM OR "Fit for 55") ("public affairs" OR "policy analyst" OR "regulatory affairs") ("EU" OR Brussels)',
      },
    ],
  },
  {
    title: "Post and need signals",
    description: "Google versions of the playbook's post searches. These often reveal active profiles and recent angles.",
    queries: [
      {
        label: "Public affairs briefs",
        intent: "People talking about briefs, clients and policy updates.",
        query: 'site:linkedin.com/posts ("EU public affairs" OR "public affairs") ("brief" OR "client briefing" OR "policy update")',
      },
      {
        label: "Regulatory updates",
        intent: "Active people publishing regulatory analysis.",
        query: 'site:linkedin.com/posts ("regulatory update" OR "policy update") ("EU" OR Brussels)',
      },
      {
        label: "Narrative / reputation",
        intent: "People talking about public opinion, reputation risk and narrative shifts.",
        query: 'site:linkedin.com/posts ("public opinion" OR "media narrative" OR "reputation risk" OR "online discourse") ("EU" OR Europe)',
      },
    ],
  },
];

export const meta: Route.MetaFunction = () => [
  { title: "Discover · Tempolis Outreach" },
  { name: "description", content: "Google search launcher for Tempolis outreach prospecting." },
];

export default function DiscoverPage() {
  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Prospecting</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Discover prospects</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Google-powered LinkedIn prospecting queries based on the Tempolis outreach playbook. Open a search,
              shortlist profiles, then import them.
            </p>
          </div>
          <Button asChild>
            <a href="/import?source=linkedin">Add shortlisted prospects</a>
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>How to use</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
              <li>1. Start with first-wave searches in EU public affairs or issue-led categories.</li>
              <li>2. Open several Google tabs, shortlist public LinkedIn profiles, and avoid premium targets too early.</li>
              <li>3. Add promising profiles in Import so the app classifies and writes outreach copy.</li>
            </ol>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {groups.map((group) => (
            <section key={group.title} className="space-y-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{group.title}</h2>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </div>
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {group.queries.length} searches
                </span>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {group.queries.map((item) => (
                  <QueryCard key={item.label} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function QueryCard({ item }: { item: SearchQuery }) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(item.query)}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{item.label}</CardTitle>
            <CardDescription className="mt-1">{item.intent}</CardDescription>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(item.query);
                toast.success("Query copied");
              }}
            >
              <Copy className="size-4" />
              Copy
            </Button>
            <Button asChild size="sm">
              <a href={url} target="_blank" rel="noreferrer">
                <Search className="size-4" />
                Open
                <ExternalLink className="size-3" />
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <code className="block whitespace-pre-wrap rounded-md border bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
          {item.query}
        </code>
      </CardContent>
    </Card>
  );
}
