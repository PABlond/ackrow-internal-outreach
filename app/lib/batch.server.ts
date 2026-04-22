import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { AnalyzedProspect } from "./outreach.server";

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
const docsDir = path.join(repoRoot, "tempolis", "front", "docs");

export async function analyzeProspectTable(tableText: string): Promise<BatchAnalysis> {
  loadLocalEnv();
  const prospects = parseProspectTable(tableText);
  if (prospects.length === 0) {
    throw new Error("No prospects found. Paste a table with Name, Position, Profile URL and About columns.");
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY. Add it to your shell env before running npm run dev.");
  }

  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";
  const outreach = fs.readFileSync(path.join(docsDir, "outreach.md"), "utf8");
  const brand = fs.readFileSync(path.join(docsDir, "brand.md"), "utf8");
  const prompt = buildPrompt({ prospects, outreach, brand });

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:4377",
      "X-Title": "Tempolis Outreach App",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a strict JSON-producing public affairs outreach analyst. Return only valid JSON. Never include markdown.",
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

  return normalizeAnalysis(parseJson(content), prospects.length);
}

export async function analyzeTwitterProspectTable(tableText: string): Promise<BatchAnalysis> {
  loadLocalEnv();
  const prospects = parseProspectTable(tableText);
  if (prospects.length === 0) {
    throw new Error("No Twitter/X prospects found. Add at least a name and profile URL or handle.");
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY. Add it to your shell env before running npm run dev.");
  }

  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";
  const outreach = fs.readFileSync(path.join(docsDir, "outreach.md"), "utf8");
  const brand = fs.readFileSync(path.join(docsDir, "brand.md"), "utf8");
  const prompt = buildTwitterPrompt({ prospects, outreach, brand });

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:4377",
      "X-Title": "Tempolis Outreach App",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a strict JSON-producing public affairs outreach analyst. Return only valid JSON. Never include markdown.",
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

  return normalizeTwitterAnalysis(parseJson(content), prospects.length);
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

function buildPrompt({ prospects, outreach, brand }: { prospects: RawProspect[]; outreach: string; brand: string }) {
  return `
Analyze this new Tempolis LinkedIn outreach batch.

TASK
- Classify every prospect as LEARN, WARM, SAVE or SKIP using the outreach playbook.
- Assign a wave: 1 for immediate learning outreach, 2 for calibration, 3 for premium/saved prospects, null for SKIP.
- Pick only the best first-wave LEARN profiles for contactToday=true.
- Generate exact LinkedIn connection messages for contactToday=true profiles.
- Write all outreach messages in English by default: connectionMessage, reportMessage, noNoteReportMessage, and followupMessage.
- Do not use French greetings or French message templates unless the input explicitly requests French. For now, assume English.
- Use brief topics of 1 to 3 words only.
- A brief topic is not the prospect's broad profession. It must be a concrete Tempolis brief subject: a figure, movement, issue, policy, controversy, narrative risk, or public debate.
- Never use vague discipline labels as briefTopic: "public policy", "policy", "communications", "public affairs", "EU affairs", "regulation", "strategy".
- If the user provides briefDirection, treat it as the strongest hint. If they provide signals/recent posts, use them to choose the topic.
- Treat activity evidence carefully:
  - A repost, like, comment, or visible activity is evidence of recent interest only, not proof that the prospect works on that topic.
  - Do not write "your work on [topic]" unless the role/about/experience explicitly says they work on that topic.
  - For repost-derived topics, use wording like "your recent interest in [topic]", "a topic you recently shared", or "given the policy issues visible in your activity".
  - In briefPreparation, distinguish "profile evidence" from "activity signal"; do not claim a subject is in their professional domain based only on a repost.
- Good briefTopic examples: "AI Act", "Energy security", "Tech backlash", "EU competitiveness", "Strategic autonomy", "Narrative risk", "Trade tensions".
- Respect the outreach rule: no product pitch, no demo/call request, short connection note under 300 characters.
- Generate two post-acceptance variants:
  - reportMessage assumes a custom connection note was sent and may refer to the promised brief.
  - noNoteReportMessage assumes no custom connection note was sent; it must open naturally with "Thanks for connecting" or equivalent and must not say "as promised" or "the brief I mentioned".
- Make noNoteReportMessage genuinely adapted to the prospect:
  - Use their role, company context, about field, signals, briefDirection, rationale, recommendedTemplate and briefTopic to pick one concrete angle.
  - Mention the builder context lightly: the sender is building Tempolis / testing a small public affairs brief format.
  - Explain why the brief may be relevant in one specific phrase, but do not overclaim the prospect's work from reposts or activity.
  - Ask for feedback on angle, signal quality, or format, not generic "thoughts".
  - Avoid filler phrases: "key topics", "professionals like yourself", "might be of interest", "any initial thoughts", "greatly appreciated".
- Generate the J+2 follow-up.
- Do not invent facts beyond the profile fields.

OUTPUT JSON SHAPE
{
  "summary": {
    "total": number,
    "contactToday": number,
    "wave2": number,
    "saved": number,
    "skipped": number
  },
  "prospects": [
    {
      "name": string,
      "position": string,
      "profileUrl": string,
      "about": string,
      "priorityTag": "LEARN" | "WARM" | "SAVE" | "SKIP",
      "wave": 1 | 2 | 3 | null,
      "contactNow": boolean,
      "rationale": string,
      "briefTopic": string,
      "briefPreparation": string,
      "recommendedTemplate": string,
      "connectionMessage": string,
      "reportMessage": string,
      "noNoteReportMessage": string,
      "followupMessage": string
    }
  ]
}

TEMPLATES AND RULES
${outreach}

BRAND GUARDRAILS
${brand.slice(0, 16000)}

PROSPECTS
${JSON.stringify(prospects, null, 2)}
`;
}

function buildTwitterPrompt({ prospects, outreach, brand }: { prospects: RawProspect[]; outreach: string; brand: string }) {
  return `
Analyze this new Tempolis Twitter/X outreach batch.

CONTEXT
This is not LinkedIn. We are testing Twitter/X as a manual acquisition channel. The app will help copy messages and track follow-ups, but it will not automate X.

TASK
- Classify every prospect as LEARN, WARM, SAVE or SKIP using the outreach playbook.
- Assign a wave: 1 for immediate learning outreach, 2 for calibration, 3 for premium/saved prospects, null for SKIP.
- Pick only the best first-wave LEARN profiles for contactToday=true.
- Write all outreach messages in English by default.
- Use brief topics of 1 to 3 words only.
- A brief topic must be concrete: a figure, movement, issue, policy, controversy, narrative risk, public debate, or public discourse signal.
- Never use vague discipline labels as briefTopic: "public policy", "policy", "communications", "public affairs", "EU affairs", "regulation", "strategy".
- Treat Twitter activity carefully: posts, reposts, likes, follows and bio claims are signals of interest, not proof of professional ownership unless explicitly stated.
- Do not say "your work on [topic]" unless the bio/about/role explicitly says they work on that topic.
- For post-derived topics, use wording like "your recent posts on [topic]", "a topic you recently shared", or "given the policy issues visible in your feed".
- Keep Twitter/X copy lighter and more direct than LinkedIn:
  - twitterDmMessage: 4 lines max, no pitch, no demo/call ask, includes [shared link] on its own line if a brief is being sent.
  - twitterDmMessage must explicitly connect the brief to one concrete source signal from the profile/feed.
  - Preferred structure: "I prepared a short brief on [briefTopic], based on [specific signal from your bio/posts/feed]."
  - The source signal should be specific but cautious: "your recent posts on...", "a topic you shared", "the policy signals in your feed", "your bio focus on...".
  - Do not write vague copy like "I saw your recent interest in [topic]" unless the exact source signal is unclear.
  - twitterFollowupMessage: one gentle follow-up at J+2 max.
- If DMs may be closed, still generate a DM-style message that can be adapted as a reply after interaction.
- Mention the builder context lightly: the sender is building Tempolis / testing a small public affairs brief format.
- Ask for feedback on the angle, signal quality, or format. Do not ask for generic "thoughts".
- Do not invent facts beyond the profile fields.

OUTPUT JSON SHAPE
{
  "summary": {
    "total": number,
    "contactToday": number,
    "wave2": number,
    "saved": number,
    "skipped": number
  },
  "prospects": [
    {
      "name": string,
      "position": string,
      "profileUrl": string,
      "twitterHandle": string,
      "about": string,
      "priorityTag": "LEARN" | "WARM" | "SAVE" | "SKIP",
      "wave": 1 | 2 | 3 | null,
      "contactNow": boolean,
      "rationale": string,
      "briefTopic": string,
      "briefPreparation": string,
      "recommendedTemplate": string,
      "twitterDmMessage": string,
      "twitterFollowupMessage": string
    }
  ]
}

LINKEDIN PLAYBOOK TO ADAPT, NOT COPY LITERALLY
${outreach}

BRAND GUARDRAILS
${brand.slice(0, 16000)}

TWITTER/X PROSPECTS
${JSON.stringify(prospects, null, 2)}
`;
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

function normalizeAnalysis(value: unknown, total: number): BatchAnalysis {
  const input = value as Partial<BatchAnalysis>;
  const prospects = Array.isArray(input.prospects) ? input.prospects.map(normalizeProspect).filter((item) => item.name && item.profileUrl) : [];
  const summary = {
    total,
    contactToday: prospects.filter((item) => item.contactNow).length,
    wave2: prospects.filter((item) => item.wave === 2).length,
    saved: prospects.filter((item) => item.priorityTag === "SAVE").length,
    skipped: prospects.filter((item) => item.priorityTag === "SKIP").length,
  };
  return { summary, prospects };
}

function normalizeTwitterAnalysis(value: unknown, total: number): BatchAnalysis {
  const input = value as Partial<BatchAnalysis>;
  const prospects = Array.isArray(input.prospects) ? input.prospects.map(normalizeTwitterProspect).filter((item) => item.name && item.profileUrl) : [];
  const summary = {
    total,
    contactToday: prospects.filter((item) => item.contactNow).length,
    wave2: prospects.filter((item) => item.wave === 2).length,
    saved: prospects.filter((item) => item.priorityTag === "SAVE").length,
    skipped: prospects.filter((item) => item.priorityTag === "SKIP").length,
  };
  return { summary, prospects };
}

function normalizeProspect(item: Partial<AnalyzedProspect>): AnalyzedProspect {
  const tag = ["LEARN", "WARM", "SAVE", "SKIP"].includes(String(item.priorityTag)) ? item.priorityTag : "SKIP";
  const wave = typeof item.wave === "number" ? item.wave : null;
  const rawBriefTopic = clean(item.briefTopic).split(/\s+/).slice(0, 3).join(" ");
  const briefTopic = isGenericBriefTopic(rawBriefTopic) ? fallbackBriefTopic(item) : rawBriefTopic;
  const firstName = clean(item.name).split(/\s+/)[0] || clean(item.name);
  const connectionMessage = enforceEnglish(
    clean(item.connectionMessage),
    `Hi ${firstName}, I'm building a tool aimed at EU public affairs professionals. I prepared a brief on ${briefTopic || "your policy area"} that might resonate. Would value your view.`,
  );
  const reportMessage = enforceEnglish(
    clean(item.reportMessage),
    `Hi ${firstName},

As promised, the brief on ${briefTopic || "your policy area"}: what public discourse is saying over the last 24 hours, outside media coverage.

[shared link]

I'm testing it with public affairs profiles before a proper launch. If the angle resonates, or if something feels off in the brief, your feedback would mean a lot.`,
  );
  const noNoteFallback = noNoteFallbackCopy(firstName, briefTopic, item.position, item.about, item.recommendedTemplate);
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

function normalizeTwitterProspect(item: Partial<AnalyzedProspect>): AnalyzedProspect {
  const base = normalizeProspect({
    ...item,
    connectionMessage: "",
    reportMessage: "",
    noNoteReportMessage: "",
    followupMessage: item.twitterFollowupMessage || item.followupMessage || "",
  });
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
      enforceEnglish(clean(item.twitterDmMessage), twitterDmFallback(first, topic, item)),
      twitterDmFallback(first, topic, item),
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

function twitterDmFallback(firstName: string, topic: string, item: Partial<AnalyzedProspect>) {
  const signal = twitterSourceSignal(item);
  return `Hi ${firstName}, I'm building Tempolis and testing a short public affairs brief format.

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

function isGenericBriefTopic(value: string) {
  const normalized = value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  return [
    "policy",
    "public policy",
    "communications",
    "public affairs",
    "eu affairs",
    "regulation",
    "strategy",
    "stakeholder management",
  ].includes(normalized);
}

function fallbackBriefTopic(item: Partial<AnalyzedProspect>) {
  const text = `${clean(item.position)} ${clean(item.about)} ${clean(item.rationale)} ${clean(item.recommendedTemplate)}`.toLowerCase();
  if (/\b(ai|artificial intelligence|ai act)\b/.test(text)) return "AI Act";
  if (/\b(energy|climate|grid|power)\b/.test(text)) return "Energy security";
  if (/\b(competitiveness|industry|industrial)\b/.test(text)) return "EU competitiveness";
  if (/\b(trade|tariff|canada|market access)\b/.test(text)) return "Trade tensions";
  if (/\b(privacy|gdpr|data)\b/.test(text)) return "Data privacy";
  if (/\b(digital|tech|platform)\b/.test(text)) return "Tech regulation";
  if (/\b(communications|comms|reputation|narrative|editorial)\b/.test(text)) return "Narrative risk";
  return "Policy backlash";
}

function noNoteFallbackCopy(firstName: string, briefTopic: string, position?: unknown, about?: unknown, template?: unknown) {
  const topic = briefTopic || "your policy area";
  const context = prospectContext(position, about, template);
  return `Hi ${firstName},

Thanks for connecting. I'm building Tempolis, a tool for public affairs narrative briefs, and I prepared a short brief on ${topic} because it seems close to your work on ${context}.

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
