import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  getActivePromptTemplate,
  getWorkspaceDocs,
  recordPromptRun,
  type AnalyzedProspect,
  type Workspace,
  type WorkspaceDoc,
} from "./outreach.server";

type RawProspect = {
  name: string;
  position: string;
  profileUrl: string;
  about: string;
  signals: string;
  briefDirection: string;
};

export type BatchAnalysis = {
  summary: {
    total: number;
    contactToday: number;
    wave2: number;
    saved: number;
    skipped: number;
  };
  prospects: AnalyzedProspect[];
};

const appDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appDir, "..", "..", "..");
export async function analyzeProspectTable(tableText: string, workspace: Workspace): Promise<BatchAnalysis> {
  loadLocalEnv();
  const prospects = parseProspectTable(tableText);
  if (prospects.length === 0) {
    throw new Error("No prospects found. Paste a table with Name, Position, Profile URL and About columns.");
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY. Add it to your shell env before running npm run dev.");
  }

  const template = await getActivePromptTemplate(workspace.id, "linkedin", "batch_analysis");
  const docs = await getWorkspaceDocs(workspace.id);
  const model = template.model || process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";
  const prompt = renderPrompt(template.user_prompt, {
    workspace,
    docs,
    prospects,
  });

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:4377",
      "X-Title": "Outreach App",
    },
    body: JSON.stringify({
      model,
      temperature: template.temperature,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: template.system_prompt,
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${detail.slice(0, 600)}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned an empty response.");
  }

  const parsed = parseJson(content);
  await recordPromptRun({
    workspaceId: workspace.id,
    promptTemplateId: template.id,
    inputJson: { tableText, prospects, prompt },
    outputJson: parsed,
    model,
  });
  return normalizeAnalysis(parsed, prospects.length, workspace.product_name);
}

export async function analyzeTwitterProspectTable(tableText: string, workspace: Workspace): Promise<BatchAnalysis> {
  loadLocalEnv();
  const prospects = parseProspectTable(tableText);
  if (prospects.length === 0) {
    throw new Error("No Twitter/X prospects found. Add at least a name and profile URL or handle.");
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY. Add it to your shell env before running npm run dev.");
  }

  const template = await getActivePromptTemplate(workspace.id, "twitter", "batch_analysis");
  const docs = await getWorkspaceDocs(workspace.id);
  const model = template.model || process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";
  const prompt = renderPrompt(template.user_prompt, {
    workspace,
    docs,
    prospects,
  });

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:4377",
      "X-Title": "Outreach App",
    },
    body: JSON.stringify({
      model,
      temperature: template.temperature,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: template.system_prompt,
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${detail.slice(0, 600)}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned an empty response.");
  }

  const parsed = parseJson(content);
  await recordPromptRun({
    workspaceId: workspace.id,
    promptTemplateId: template.id,
    inputJson: { tableText, prospects, prompt },
    outputJson: parsed,
    model,
  });
  return normalizeTwitterAnalysis(parsed, prospects.length, workspace.product_name);
}

export function prospectEvidenceToTable(profile: {
  name?: string;
  position?: string;
  profileUrl?: string;
  about?: string;
  signals?: string;
  briefDirection?: string;
  experience?: string;
  education?: string;
  activity?: string;
  rawText?: string;
}) {
  const evidence = [
    "Source: browser extension single-profile capture.",
    "Important: do not classify as LEARN by default. Apply the strict LEARN/WARM/SAVE/SKIP strategy.",
    profile.signals,
    profile.activity ? `Activity: ${profile.activity}` : "",
    profile.experience ? `Experience: ${profile.experience}` : "",
    profile.education ? `Education: ${profile.education}` : "",
    profile.rawText ? `Visible page text: ${profile.rawText}` : "",
  ].filter(Boolean).join("\n\n");

  const header = ["Name", "Position", "Profile URL", "About", "Signals", "Brief direction"];
  const row = [
    profile.name || "",
    profile.position || "",
    profile.profileUrl || "",
    profile.about || "",
    evidence,
    profile.briefDirection || "",
  ].map(cleanCell).join("\t");

  return [header.join("\t"), row].join("\n");
}

function cleanCell(value: string) {
  return String(value || "").replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}

function loadLocalEnv() {
  const envPath = path.join(repoRoot, "outreach-app", ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    if (!key || process.env[key] !== undefined) continue;

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

function renderPrompt(template: string, input: { workspace: Workspace; docs: WorkspaceDoc[]; prospects: RawProspect[] }) {
  return template
    .replaceAll("{{productName}}", input.workspace.product_name)
    .replaceAll("{{workspaceName}}", input.workspace.name)
    .replaceAll("{{defaultLanguage}}", input.workspace.default_language || "en")
    .replaceAll("{{workspaceDocs}}", formatWorkspaceDocs(input.docs))
    .replaceAll("{{prospectsJson}}", JSON.stringify(input.prospects, null, 2))
    .concat("\n\n", STRICT_CLASSIFICATION_POLICY);
}

const STRICT_CLASSIFICATION_POLICY = `
STRICT OUTREACH CLASSIFICATION POLICY
- LEARN: good profile to learn from, and contactable now. Use only when the profile is clearly in ICP, likely to understand the product promise, has enough visible evidence to personalize a brief, and can produce useful feedback immediately.
- WARM: very good profile, but not critical yet. Use when the person is relevant but should wait for 1 or 2 product/outreach iterations, or when evidence is promising but not strong enough for today's first wave.
- SAVE: premium prospect to keep for later. Use for senior, high-leverage, high-brand-value, hard-to-reach, or strategically important profiles that deserve a stronger product/proof point before contacting.
- SKIP: outside target, too weak, too generic, low probability of useful feedback, not enough evidence, or likely to be a poor learning conversation.

SELECTION RULES
- Never classify a prospect as LEARN just because they match a broad industry, title, or keyword.
- For a browser-extension single-profile capture, still choose WARM, SAVE, or SKIP when appropriate.
- contactToday=true only for LEARN wave 1 profiles that are genuinely worth contacting now.
- If the evidence is thin, generic, scraped footer text, or mostly unrelated page noise, prefer WARM or SKIP.
- If the profile is excellent but senior/premium enough that a weak early message could waste the opportunity, choose SAVE.
- If there is no concrete brief angle, do not mark LEARN.
`;

function formatWorkspaceDocs(docs: WorkspaceDoc[]) {
  return docs
    .map((doc) => `## ${doc.title} (${doc.type})\n${doc.content.slice(0, 18000)}`)
    .join("\n\n---\n\n");
}

function parseProspectTable(input: string): RawProspect[] {
  const text = input.trim();
  if (!text) return [];
  const rows = text.includes("\t") ? parseDelimited(text, "\t") : parseCsv(text);
  const [header = [], ...body] = rows;
  const columns = header.map((item) => normalizeHeader(item));

  return body
    .map((cells) => {
      const row = Object.fromEntries(columns.map((key, index) => [key, cells[index] || ""]));
      return {
        name: clean(row.name),
        position: clean(row.position),
        profileUrl: clean(row.profileurl || row.profile || row.linkedin || row.url),
        about: clean(row.about),
        signals: clean(row.signals || row.recentposts || row.posts || row.activity || row.evidence),
        briefDirection: clean(row.briefdirection || row.briefseed || row.topicseed || row.suggestedtopic || row.preferredtopic),
      };
    })
    .filter((row) => row.name && row.profileUrl);
}

function parseDelimited(input: string, delimiter: string) {
  return input.split(/\r?\n/).map((line) => line.split(delimiter));
}

function parseCsv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"') inQuotes = true;
    else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  return rows;
}

function parseJson(content: string) {
  const trimmed = content.trim();
  const json = trimmed.startsWith("```") ? trimmed.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim() : trimmed;
  return JSON.parse(json);
}

function normalizeAnalysis(value: unknown, total: number, productName = "Tempolis"): BatchAnalysis {
  const input = value as Partial<BatchAnalysis>;
  const prospects = Array.isArray(input.prospects) ? input.prospects.map((item) => normalizeProspect(item, productName)).filter((item) => item.name && item.profileUrl) : [];
  const summary = {
    total,
    contactToday: prospects.filter((item) => item.contactNow).length,
    wave2: prospects.filter((item) => item.wave === 2).length,
    saved: prospects.filter((item) => item.priorityTag === "SAVE").length,
    skipped: prospects.filter((item) => item.priorityTag === "SKIP").length,
  };
  return { summary, prospects };
}

function normalizeTwitterAnalysis(value: unknown, total: number, productName = "Tempolis"): BatchAnalysis {
  const input = value as Partial<BatchAnalysis>;
  const prospects = Array.isArray(input.prospects) ? input.prospects.map((item) => normalizeTwitterProspect(item, productName)).filter((item) => item.name && item.profileUrl) : [];
  const summary = {
    total,
    contactToday: prospects.filter((item) => item.contactNow).length,
    wave2: prospects.filter((item) => item.wave === 2).length,
    saved: prospects.filter((item) => item.priorityTag === "SAVE").length,
    skipped: prospects.filter((item) => item.priorityTag === "SKIP").length,
  };
  return { summary, prospects };
}

function normalizeProspect(item: Partial<AnalyzedProspect>, productName = "Tempolis"): AnalyzedProspect {
  const tag = ["LEARN", "WARM", "SAVE", "SKIP"].includes(String(item.priorityTag)) ? item.priorityTag : "SKIP";
  const wave = typeof item.wave === "number" ? item.wave : null;
  const rawBriefTopic = clean(item.briefTopic).split(/\s+/).slice(0, 3).join(" ");
  const briefTopic = isGenericBriefTopic(rawBriefTopic, productName) ? fallbackBriefTopic(item, productName) : rawBriefTopic;
  const firstName = clean(item.name).split(/\s+/)[0] || clean(item.name);
  const connectionMessage = enforceEnglish(
    clean(item.connectionMessage),
    `Hi ${firstName}, I'm building ${productName} and testing short briefs for public affairs professionals. I prepared one on ${briefTopic || "your policy area"}. Would value your view.`,
  );
  const reportMessage = enforceEnglish(
    clean(item.reportMessage),
    `Hi ${firstName},

As promised, the brief on ${briefTopic || "your policy area"}: what public discourse is saying over the last 24 hours, outside media coverage.

[shared link]

I'm testing it with relevant profiles before a proper launch. If the angle resonates, or if something feels off in the brief, your feedback would mean a lot.`,
  );
  const noNoteFallback = noNoteFallbackCopy(firstName, briefTopic, item.position, item.about, item.recommendedTemplate, productName);
  const noNoteReportMessage = noPriorNoteCopy(enforceEnglish(clean(item.noNoteReportMessage), noNoteFallback), noNoteFallback);
  const followupMessage = enforceEnglish(
    clean(item.followupMessage),
    `Hi ${firstName}, following up in case the brief slipped through. No worries if this isn't the right timing.`,
  );

  return {
    name: clean(item.name),
    position: clean(item.position),
    profileUrl: clean(item.profileUrl),
    about: clean(item.about),
    priorityTag: tag as AnalyzedProspect["priorityTag"],
    wave,
    contactNow: Boolean(item.contactNow) && tag === "LEARN",
    rationale: clean(item.rationale),
    briefTopic,
    briefPreparation: clean(item.briefPreparation),
    recommendedTemplate: clean(item.recommendedTemplate),
    connectionMessage: connectionMessage.slice(0, 300),
    reportMessage,
    noNoteReportMessage,
    followupMessage,
  };
}

function normalizeTwitterProspect(item: Partial<AnalyzedProspect>, productName = "Tempolis"): AnalyzedProspect {
  const base = normalizeProspect({
    ...item,
    connectionMessage: "",
    reportMessage: "",
    noNoteReportMessage: "",
    followupMessage: item.twitterFollowupMessage || item.followupMessage || "",
  }, productName);
  const profileUrl = normalizeTwitterProfileUrl(item.profileUrl || item.twitterUrl || item.twitterHandle || "");
  const first = clean(item.name).split(/\s+/)[0] || clean(item.name);
  const topic = base.briefTopic || "Narrative risk";
  return {
    ...base,
    profileUrl,
    sourceChannel: "twitter",
    twitterUrl: profileUrl,
    twitterHandle: normalizeTwitterHandle(item.twitterHandle || profileUrl),
    twitterDmMessage: sanitizeTwitterDm(
      enforceEnglish(clean(item.twitterDmMessage), twitterDmFallback(first, topic, item, productName)),
      twitterDmFallback(first, topic, item, productName),
    ),
    twitterFollowupMessage: enforceEnglish(
      clean(item.twitterFollowupMessage || item.followupMessage),
      `Hi ${first}, quick follow-up in case the brief slipped through. Even a short read on whether the angle is useful would help.`,
    ),
  };
}

function normalizeTwitterProfileUrl(value: string) {
  const handle = normalizeTwitterHandle(value);
  return handle ? `https://x.com/${handle}` : clean(value);
}

function twitterDmFallback(firstName: string, topic: string, item: Partial<AnalyzedProspect>, productName = "Tempolis") {
  const signal = twitterSourceSignal(item);
  return `Hi ${firstName}, I'm building ${productName} and testing a short brief format.

I prepared one on ${topic}, based on ${signal}.

[shared link]

Would your read be that the angle and signal are useful, or off?`;
}

function twitterSourceSignal(item: Partial<AnalyzedProspect>) {
  const evidence = clean([item.briefPreparation, item.rationale, item.about, item.recommendedTemplate].filter(Boolean).join(" "));
  if (/\bbio\b/i.test(evidence)) return "the policy focus in your bio";
  if (/\b(post|tweet|thread)\b/i.test(evidence)) return "the policy signals in your recent posts";
  if (/\b(repost|shared|activity|feed)\b/i.test(evidence)) return "a topic visible in your recent activity";
  if (/\b(journalist|reporter|editor|coverage)\b/i.test(evidence)) return "the themes visible in your coverage";
  if (/\b(policy|public affairs|regulation|eu|brussels)\b/i.test(evidence)) return "the policy themes visible on your profile";
  return "the public signals visible on your profile";
}

function sanitizeTwitterDm(value: string, fallback: string) {
  const cleanValue = value.trim();
  if (!cleanValue) return fallback;
  if (/\brecent interest in\b/i.test(cleanValue) && !/\bbased on\b/i.test(cleanValue)) return fallback;
  if (!/\[shared link\]/i.test(cleanValue)) return fallback;
  if (/\byour work on\b/i.test(cleanValue) && /\b(repost|shared|activity|feed)\b/i.test(cleanValue)) return fallback;
  return cleanValue;
}

function normalizeTwitterHandle(value: string) {
  const trimmed = clean(value);
  const match = trimmed.match(/(?:x\.com|twitter\.com)\/@?([^/?#\s]+)/i);
  const raw = match?.[1] || trimmed.replace(/^@/, "");
  return raw && !/^https?:\/\//i.test(raw) ? raw.replace(/[^a-zA-Z0-9_]/g, "") : "";
}

function enforceEnglish(value: string, fallback: string) {
  if (!value) return fallback;
  const frenchMarkers = [
    "bonjour",
    "votre regard",
    "j'ai préparé",
    "je construis",
    "le brief promis",
    "lien partagé",
    "je teste",
    "avez-vous eu",
    "votre retour",
  ];
  const lower = value.toLowerCase();
  return frenchMarkers.some((marker) => lower.includes(marker)) ? fallback : value;
}

function noPriorNoteCopy(value: string, fallback: string) {
  if (!/\b(as promised|brief i mentioned|brief i promised|comme promis|brief promis|key topics|professionals like yourself|might be of interest|any initial thoughts|greatly appreciated)\b/i.test(value)) return value;
  return fallback;
}

function isGenericBriefTopic(value: string, productName = "Tempolis") {
  const normalized = value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const commonGenericTopics = [
    "policy",
    "public policy",
    "communications",
    "public affairs",
    "eu affairs",
    "regulation",
    "strategy",
    "stakeholder management",
  ];
  const narralensGenericTopics = [
    "brand",
    "brand perception",
    "perception",
    "social listening",
    "brand monitoring",
    "campaign monitoring",
    "campaign",
    "marketing",
    "reputation",
    "consumer insights",
    "narrative intelligence",
    "competitive intelligence",
  ];
  return [...commonGenericTopics, ...(isNarralens(productName) ? narralensGenericTopics : [])].includes(normalized);
}

function fallbackBriefTopic(item: Partial<AnalyzedProspect>, productName = "Tempolis") {
  const text = `${clean(item.position)} ${clean(item.about)} ${clean(item.rationale)} ${clean(item.recommendedTemplate)}`.toLowerCase();
  if (isNarralens(productName)) {
    if (/\b(openai|chatgpt|anthropic|claude|ai launch|artificial intelligence)\b/.test(text)) return "OpenAI launch";
    if (/\b(nike|adidas|sport|sneaker|fashion|retail|sustainability)\b/.test(text)) return "Nike sustainability";
    if (/\b(notion|clickup|saas|productivity|b2b)\b/.test(text)) return "Notion vs ClickUp";
    if (/\b(apple|vision pro|consumer tech|hardware)\b/.test(text)) return "Apple Vision Pro";
    if (/\b(duolingo|social|community|tiktok|campaign|creator)\b/.test(text)) return "Duolingo marketing";
    if (/\b(tesla|elon|automotive|ev|robotaxi)\b/.test(text)) return "Tesla robotaxi";
    if (/\b(competitor|competitive|positioning|market)\b/.test(text)) return "Notion vs ClickUp";
    if (/\b(launch|announcement|release)\b/.test(text)) return "OpenAI launch";
    return "Nike sustainability";
  }
  if (/\b(ai|artificial intelligence|ai act)\b/.test(text)) return "AI Act";
  if (/\b(energy|climate|grid|power)\b/.test(text)) return "Energy security";
  if (/\b(competitiveness|industry|industrial)\b/.test(text)) return "EU competitiveness";
  if (/\b(trade|tariff|canada|market access)\b/.test(text)) return "Trade tensions";
  if (/\b(privacy|gdpr|data)\b/.test(text)) return "Data privacy";
  if (/\b(digital|tech|platform)\b/.test(text)) return "Tech regulation";
  if (/\b(communications|comms|reputation|narrative|editorial)\b/.test(text)) return "Narrative risk";
  return "Policy backlash";
}

function isNarralens(productName = "Tempolis") {
  return productName.toLowerCase() === "narralens";
}

function noNoteFallbackCopy(firstName: string, briefTopic: string, position?: unknown, about?: unknown, template?: unknown, productName = "Tempolis") {
  const topic = briefTopic || "your policy area";
  const context = prospectContext(position, about, template);
  if (isNarralens(productName)) {
    return `Hi ${firstName},

Thanks for connecting. I'm building ${productName} and testing short briefs for brand/social workflows, so I prepared one on ${topic} as a concrete campaign or competitor readout.

[shared link]

If the angle feels useful for the kind of monitoring or client updates you deal with, your blunt feedback would help a lot.`;
  }
  return `Hi ${firstName},

Thanks for connecting. I'm building ${productName} and testing short briefs, and I prepared one on ${topic} because it seems close to your work on ${context}.

[shared link]

If the angle feels useful, or if the signal is off for your workflow, your feedback would be very helpful.`;
}

function prospectContext(position?: unknown, about?: unknown, template?: unknown) {
  const text = `${clean(position)} ${clean(about)} ${clean(template)}`.toLowerCase();
  if (/\b(ai|artificial intelligence|digital|tech|technology|platform|data|privacy|gdpr)\b/.test(text)) return "tech policy and regulation";
  if (/\b(energy|climate|sustainability|power|grid)\b/.test(text)) return "energy and policy strategy";
  if (/\b(health|pharma|medical|biotech)\b/.test(text)) return "health policy and public affairs";
  if (/\b(finance|bank|fintech|payments|competition)\b/.test(text)) return "regulated markets and public affairs";
  if (/\b(communications|comms|media|narrative|reputation)\b/.test(text)) return "strategic communications";
  if (/\b(government affairs|public affairs|policy|regulatory|eu affairs|brussels)\b/.test(text)) return "public affairs and policy";
  return "policy and public affairs";
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function clean(value: unknown) {
  return String(value || "").trim();
}
