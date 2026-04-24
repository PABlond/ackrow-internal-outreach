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
  sourceChannel?: "linkedin" | "twitter";
  extensionEvidence?: unknown;
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
  const prospects = parseProspectTable(tableText);
  if (prospects.length === 0) {
    throw new Error("No prospects found. Paste a table with Name, Position, Profile URL and About columns.");
  }
  return await analyzeRawProspects(prospects, workspace, "linkedin", { tableText });
}

export async function analyzeTwitterProspectTable(tableText: string, workspace: Workspace): Promise<BatchAnalysis> {
  const prospects = parseProspectTable(tableText);
  if (prospects.length === 0) {
    throw new Error("No Twitter/X prospects found. Add at least a name and profile URL or handle.");
  }
  return await analyzeRawProspects(prospects, workspace, "twitter", { tableText });
}

export async function analyzeLinkedInExtensionProspect(profile: ExtensionProspectEvidence, workspace: Workspace): Promise<BatchAnalysis> {
  const prospects = [extensionProfileToRawProspect(profile, "linkedin")];
  return await analyzeRawProspects(prospects, workspace, "linkedin", { extensionPayload: profile });
}

export async function analyzeTwitterExtensionProspect(profile: ExtensionProspectEvidence, workspace: Workspace): Promise<BatchAnalysis> {
  const prospects = [extensionProfileToRawProspect(profile, "twitter")];
  return await analyzeRawProspects(prospects, workspace, "twitter", { extensionPayload: profile });
}

type ExtensionProspectEvidence = {
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
  outreachMode?: "with_note" | "no_note";
  twitterHandle?: string;
  twitterUrl?: string;
};

async function analyzeRawProspects(
  prospects: RawProspect[],
  workspace: Workspace,
  channel: "linkedin" | "twitter",
  inputJson: Record<string, unknown>,
): Promise<BatchAnalysis> {
  loadLocalEnv();
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY. Add it to your shell env before running npm run dev.");
  }

  const template = await getActivePromptTemplate(workspace.id, channel, "batch_analysis");
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
    inputJson: { ...inputJson, prospects, prompt, channel },
    outputJson: parsed,
    model,
  });
  const analysis = channel === "twitter"
    ? normalizeTwitterAnalysis(parsed, prospects.length, workspace.product_name)
    : normalizeAnalysis(parsed, prospects.length, workspace.product_name);
  return applyExtensionClassificationRecovery(analysis, prospects, workspace, channel);
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

function extensionProfileToRawProspect(profile: ExtensionProspectEvidence, channel: "linkedin" | "twitter"): RawProspect {
  const normalizedProfile = channel === "linkedin" ? sanitizeLinkedInExtensionProfile(profile) : profile;
  const channelContext = channel === "twitter"
    ? [
        normalizedProfile.signals,
        normalizedProfile.activity ? `Visible X posts: ${normalizedProfile.activity}` : "",
        normalizedProfile.rawText ? `Visible X page text: ${normalizedProfile.rawText}` : "",
      ]
    : [
        normalizedProfile.signals,
        normalizedProfile.experience ? `LinkedIn experience: ${normalizedProfile.experience}` : "",
        normalizedProfile.education ? `LinkedIn education: ${normalizedProfile.education}` : "",
        normalizedProfile.activity ? `LinkedIn activity: ${normalizedProfile.activity}` : "",
        normalizedProfile.rawText ? `Visible LinkedIn page text: ${normalizedProfile.rawText}` : "",
      ];
  const evidence = [
    `Source: browser extension ${channel} single-profile capture.`,
    "Important: do not classify as LEARN by default. Apply the strict LEARN/WARM/SAVE/SKIP strategy.",
    channel === "twitter"
      ? "Channel behavior: write Twitter/X DM copy, not LinkedIn connection copy."
      : `Channel behavior: write LinkedIn copy. Outreach mode requested: ${normalizedProfile.outreachMode || "no_note"}.`,
    ...channelContext,
  ].filter(Boolean).join("\n\n");

  return {
    name: normalizedProfile.name || "",
    position: normalizedProfile.position || "",
    profileUrl: normalizedProfile.profileUrl || normalizedProfile.twitterUrl || "",
    about: normalizedProfile.about || "",
    signals: evidence,
    briefDirection: normalizedProfile.briefDirection || "",
    sourceChannel: channel,
    extensionEvidence: normalizedProfile,
  };
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
- If the prospect is clearly inside the brand/social/PR/agency/communications ICP but the brief angle is still broad or needs refinement, prefer WARM over SKIP.
- For a strong ICP-fit profile with enough real role/about/activity evidence, missing the perfect brief topic is not by itself a reason to SKIP.
- If the profile is excellent but senior/premium enough that a weak early message could waste the opportunity, choose SAVE.
- If there is no concrete brief angle, do not mark LEARN.
`;

function applyExtensionClassificationRecovery(
  analysis: BatchAnalysis,
  inputs: RawProspect[],
  workspace: Workspace,
  channel: "linkedin" | "twitter",
): BatchAnalysis {
  if (channel !== "linkedin" || !isNarralensProduct(workspace.product_name)) return analysis;

  return {
    ...analysis,
    prospects: analysis.prospects.map((prospect, index) => recoverNarralensLinkedInExtensionProspect(prospect, inputs[index])),
  };
}

function recoverNarralensLinkedInExtensionProspect(prospect: AnalyzedProspect, input?: RawProspect): AnalyzedProspect {
  if (!input || prospect.priorityTag !== "SKIP" || input.sourceChannel !== "linkedin") return prospect;

  const evidence = `${input.position} ${input.about} ${input.signals}`.toLowerCase();
  const icpFit = /\b(communications?|comms|pr\b|public relations|brand|branding|social media|agency|editorial|content|campaign|marketing|reputation|influence|csr reporting|reporting)\b/.test(evidence);
  const clearNoiseOnly = isMostlyLinkedInNoise(input.about) && clean(input.position).length < 10;
  const richEnough = clean(input.about).length >= 280 || clean(input.signals).length >= 900 || clean(input.position).length >= 24;

  if (!icpFit || clearNoiseOnly || !richEnough) return prospect;

  return {
    ...prospect,
    priorityTag: "WARM",
    wave: 2,
    contactNow: false,
    rationale: "Strong Narralens fit for agency/communications workflow, but the best outreach angle still needs refinement before first-wave contact.",
  };
}

function sanitizeLinkedInExtensionProfile(profile: ExtensionProspectEvidence): ExtensionProspectEvidence {
  const rawText = cleanLinkedInNoise(profile.rawText || "");
  const position = clean(profile.position) || extractLinkedInHeadline(rawText, profile.name || "");
  const about = sanitizeLinkedInSection(profile.about || "", rawText, ["Featured", "Activity", "Experience", "Education", "Skills", "Recommendations"]);
  const activity = sanitizeLinkedInSection(profile.activity || "", rawText, ["Experience", "Education", "Skills", "Recommendations"]);

  return {
    ...profile,
    position,
    about,
    activity,
    rawText,
  };
}

function sanitizeLinkedInSection(section: string, rawText: string, endLabels: string[]) {
  const cleanedSection = cleanLinkedInNoise(stripAfterLabels(section || "", endLabels));
  if (cleanedSection && !isMostlyLinkedInNoise(cleanedSection)) return cleanedSection;

  const extracted = cleanLinkedInNoise(extractSectionFromRawText(rawText, rawText.includes("About") ? "About" : "", endLabels));
  return stripAfterLabels(extracted, endLabels);
}

function extractSectionFromRawText(rawText: string, startLabel: string, endLabels: string[]) {
  if (!startLabel) return "";
  const lines = String(rawText || "").split(/\n+/).map((line) => clean(line)).filter(Boolean);
  const start = lines.findIndex((line) => line.toLowerCase() === startLabel.toLowerCase());
  if (start === -1) return "";
  const end = lines.findIndex((line, index) => index > start && endLabels.some((label) => line.toLowerCase() === label.toLowerCase()));
  return lines.slice(start + 1, end === -1 ? start + 32 : end).join("\n");
}

function stripAfterLabels(value: string, labels: string[]) {
  let output = String(value || "");
  for (const label of labels) {
    const pattern = new RegExp(`\\n${escapeRegExp(label)}\\n[\\s\\S]*$`, "i");
    output = output.replace(pattern, "");
  }
  return output.trim();
}

function extractLinkedInHeadline(rawText: string, name: string) {
  const lines = String(rawText || "").split(/\n+/).map((line) => clean(line)).filter(Boolean);
  const start = lines.findIndex((line) => line === clean(name));
  const candidates = (start === -1 ? lines : lines.slice(start + 1, start + 10))
    .filter((line) => line.length >= 12 && line.length <= 180)
    .filter((line) => !/^(1st|2nd|3rd|contact info|message|pending|follow|connect|about)$/i.test(line))
    .filter((line) => !/^\d+\+?\s*(connections|followers?)$/i.test(line))
    .filter((line) => !/^(france|paris|brussels|london|new york|berlin)$/i.test(line));
  return candidates[0] || "";
}

function cleanLinkedInNoise(value: string) {
  return String(value || "")
    .replace(/\bAccessibility\b[\s\S]*?Select language/gi, "")
    .replace(/\bQuestions\?\b[\s\S]*?Select language/gi, "")
    .replace(/\bLinkedIn Corporation © \d{4}\b[\s\S]*$/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isMostlyLinkedInNoise(value: string) {
  const text = clean(value).toLowerCase();
  if (!text) return true;
  const noiseHits = [
    "accessibility",
    "talent solutions",
    "community guidelines",
    "privacy & terms",
    "advertising",
    "sales solutions",
    "small business",
    "safety center",
    "linkedin corporation",
    "help center",
    "manage your account and privacy",
    "recommendation transparency",
    "select language",
  ].filter((needle) => text.includes(needle)).length;
  return noiseHits >= 3 && text.length < 800;
}

function isNarralensProduct(productName = "") {
  return clean(productName).toLowerCase() === "narralens";
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
  const reportFallback = reportFallbackCopy(firstName, briefTopic, item.position, item.about, item.recommendedTemplate, productName);
  const reportMessage = sanitizeNarralensFirstMessage(enforceEnglish(clean(item.reportMessage), reportFallback), reportFallback, productName);
  const noNoteFallback = noNoteFallbackCopy(firstName, briefTopic, item.position, item.about, item.recommendedTemplate, productName);
  const noNoteReportMessage = sanitizeNarralensFirstMessage(
    noPriorNoteCopy(enforceEnglish(clean(item.noNoteReportMessage), noNoteFallback), noNoteFallback),
    noNoteFallback,
    productName,
  );
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

function reportFallbackCopy(firstName: string, briefTopic: string, position?: unknown, about?: unknown, template?: unknown, productName = "Tempolis") {
  const topic = briefTopic || "";
  const context = isNarralens(productName)
    ? narralensProfileSignal(position, about, template)
    : prospectContext(position, about, template);
  if (isNarralens(productName)) {
    return pickFallbackVariant(`${firstName}:${topic}:${context}:narralens-report`, [
      `Hi ${firstName},

I'm building ${productName}, a tool for turning public conversations into short campaign and competitor readouts. Given your background in ${context}, I thought this kind of short brief could be a relevant example${topic ? `, starting with ${topic}` : ""}.

[shared link]

I'm testing whether this format is actually useful for monitoring, client updates, or positioning decisions. If the angle feels useful or off, your blunt feedback would help a lot.`,
      `Hi ${firstName},

I'm currently building ${productName} for brand, social, and PR teams. Since your background touches ${context}, I wanted to test the format on a concrete brief rather than send a generic product pitch${topic ? `, and ${topic} seemed like a reasonable starting point` : ""}.

[shared link]

I'm trying to learn whether this kind of brief helps with campaign monitoring or client updates. A blunt read on the angle would be very helpful.`,
      `Hi ${firstName},

I'm building ${productName} and testing a short brief format for campaign and competitor readouts. Your background in ${context} made me think this could be a relevant example${topic ? `, with ${topic} as the first angle` : ""}.

[shared link]

I'm testing the format with people close to brand, social, or PR workflows. If this feels useful or misses the mark, I'd value your read.`,
    ]);
  }
  return pickFallbackVariant(`${firstName}:${topic}:${context}:tempolis-report`, [
    `Hi ${firstName},

I'm building ${productName}, a tool for short public-discourse briefs. Given your background in ${context}, I prepared the brief on ${topic} as a concrete example.

[shared link]

I'm testing the format with relevant policy and public affairs profiles before a proper launch. If the angle resonates, or if something feels off, your feedback would mean a lot.`,
    `Hi ${firstName},

I'm currently building ${productName} and testing brief formats with people close to policy and public affairs work. Since your background touches ${context}, I prepared this one on ${topic}.

[shared link]

I'm trying to learn whether this format is actually useful for policy or public affairs work. Any blunt reaction would help.`,
    `Hi ${firstName},

I'm building ${productName} and testing whether short issue briefs can be useful in public affairs workflows. Given your background in ${context}, I thought ${topic} would be a relevant test case.

[shared link]

I'm testing whether the brief is useful enough for real public affairs workflows. If the angle feels useful or off, I'd value your read.`,
  ]);
}

function noNoteFallbackCopy(firstName: string, briefTopic: string, position?: unknown, about?: unknown, template?: unknown, productName = "Tempolis") {
  const topic = briefTopic || "";
  const context = prospectContext(position, about, template);
  if (isNarralens(productName)) {
    const signal = narralensProfileSignal(position, about, template);
    return pickFallbackVariant(`${firstName}:${topic}:${signal}:narralens-no-note`, [
      `Hi ${firstName},

Thanks for connecting. I'm building ${productName}, a tool for turning public conversations into short campaign and competitor readouts. Given your background in ${signal}, I thought this kind of short brief could be a relevant example${topic ? `, starting with ${topic}` : ""}.

[shared link]

If the angle feels useful for the kind of monitoring or client updates you deal with, your blunt feedback would help a lot.`,
      `Hi ${firstName},

Thanks for connecting. I'm currently building ${productName} for brand, social, and PR teams. Since your background touches ${signal}, I wanted to test the format on a concrete brief rather than send a generic pitch${topic ? `, and ${topic} was my starting point` : ""}.

[shared link]

I'm trying to learn whether this format would help with campaign monitoring or client updates. A blunt read would help.`,
      `Hi ${firstName},

Thanks for connecting. I'm building ${productName} and testing a short brief format for campaign and competitor readouts. Your background in ${signal} made me think this could be a relevant example${topic ? `, with ${topic} as the first angle` : ""}.

[shared link]

If this feels useful for brand, social, or PR work, or if the angle is off, I'd value your feedback.`,
    ]);
  }
  return pickFallbackVariant(`${firstName}:${topic}:${context}:tempolis-no-note`, [
    `Hi ${firstName},

Thanks for connecting. I'm building ${productName} and testing short briefs, and I prepared one on ${topic} because it seems close to your work on ${context}.

[shared link]

If the angle feels useful, or if the signal is off for your workflow, your feedback would be very helpful.`,
    `Hi ${firstName},

Thanks for connecting. I'm building ${productName}, a tool for short public-discourse briefs. Given your background in ${context}, I prepared one on ${topic} as a concrete example.

[shared link]

I'm testing whether this format is useful for policy and public affairs work. Any blunt reaction would help.`,
    `Hi ${firstName},

Thanks for connecting. I'm currently building ${productName} and testing brief formats with people close to policy and public affairs. Since your background touches ${context}, I prepared this one on ${topic}.

[shared link]

If this feels useful, or if the angle misses what you would need, I'd value your read.`,
  ]);
}

function pickFallbackVariant(seed: string, variants: string[]) {
  const hash = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return variants[hash % variants.length];
}

function sanitizeNarralensFirstMessage(value: string, fallback: string, productName = "Tempolis") {
  if (!isNarralens(productName)) return value;
  if (!value.trim()) return fallback;
  if (!/\[shared link\]/i.test(value)) return fallback;
  if (/\b(used the signals|signals on your profile|scraped|profile pointed me|from what i saw on your profile)\b/i.test(value)) return fallback;
  if (/\byour work on\b/i.test(value) && /\b(repost|shared|activity|feed|interest)\b/i.test(value)) return fallback;
  return value;
}

function narralensProfileSignal(position?: unknown, about?: unknown, template?: unknown) {
  const text = `${clean(position)} ${clean(about)} ${clean(template)}`.toLowerCase();
  if (/\b(agency|client|consultant|consulting|account|advisory)\b/.test(text)) return "agency and client update work";
  if (/\b(social|community|creator|tiktok|instagram|linkedin|content)\b/.test(text)) return "social and content signals";
  if (/\b(pr|communications|comms|media|press|public relations)\b/.test(text)) return "PR and communications work";
  if (/\b(brand|marketing|campaign|growth|positioning)\b/.test(text)) return "brand and campaign work";
  if (/\b(founder|ceo|operator|startup)\b/.test(text)) return "founder-led positioning work";
  if (/\b(reputation|crisis|risk|issues)\b/.test(text)) return "reputation and issue monitoring";
  return "brand, social, or campaign signals";
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
