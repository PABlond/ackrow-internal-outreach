import { data, redirect } from "react-router";

import type { Route } from "./+types/api.extension.prospect";
import { analyzeProspectTable, analyzeTwitterProspectTable, prospectEvidenceToTable } from "~/lib/batch.server";
import { findProspectByProfileUrl, importAnalyzedProspects, setProspectOutreachPreference } from "~/lib/outreach.server";

type ExtensionPayload = {
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
  sourceChannel?: "linkedin" | "twitter";
  twitterHandle?: string;
  twitterUrl?: string;
  open?: boolean;
};

export async function action({ request }: Route.ActionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method !== "POST") {
    return data({ ok: false, error: "Method not allowed" }, { status: 405, headers: corsHeaders() });
  }

  const payload = await readPayload(request);
  if (payload.sourceChannel === "twitter") {
    return handleTwitterPayload(payload);
  }

  const profileUrl = normalizeLinkedInUrl(String(payload.profileUrl || ""));
  if (!profileUrl.includes("linkedin.com/in/")) {
    return data({ ok: false, error: "Open a LinkedIn profile page first." }, { status: 400, headers: corsHeaders() });
  }

  const existingId = await findProspectByProfileUrl(profileUrl);
  if (existingId) {
    await setProspectOutreachPreference(existingId, normalizeOutreachMode(payload.outreachMode));
    return respond(payload, existingId, true);
  }

  const table = prospectEvidenceToTable({ ...payload, profileUrl });
  const analysis = await analyzeProspectTable(table);
  await importAnalyzedProspects(analysis.prospects);
  const id = await findProspectByProfileUrl(profileUrl);

  if (!id) {
    return data({ ok: false, error: "Profile analyzed but not found after import." }, { status: 500, headers: corsHeaders() });
  }

  await setProspectOutreachPreference(id, normalizeOutreachMode(payload.outreachMode));
  return respond(payload, id, false);
}

async function handleTwitterPayload(payload: ExtensionPayload) {
  const profileUrl = normalizeTwitterUrl(String(payload.profileUrl || payload.twitterUrl || payload.twitterHandle || ""));
  if (!profileUrl.includes("x.com/") && !profileUrl.includes("twitter.com/")) {
    return data({ ok: false, error: "Open a Twitter/X profile page first." }, { status: 400, headers: corsHeaders() });
  }

  const existingId = await findProspectByProfileUrl(profileUrl);
  if (existingId) {
    return respond(payload, existingId, true);
  }

  const table = prospectEvidenceToTable({
    ...payload,
    profileUrl,
    signals: [
      payload.signals,
      payload.activity ? `Visible posts: ${payload.activity}` : "",
      payload.rawText ? `Visible page text: ${payload.rawText}` : "",
    ].filter(Boolean).join("\n\n"),
  });
  const analysis = await analyzeTwitterProspectTable(table);
  await importAnalyzedProspects(analysis.prospects);
  const id = await findProspectByProfileUrl(profileUrl);

  if (!id) {
    return data({ ok: false, error: "Twitter/X profile analyzed but not found after import." }, { status: 500, headers: corsHeaders() });
  }

  return respond(payload, id, false);
}

function respond(payload: ExtensionPayload, id: number, existing: boolean) {
  if (payload.open) return redirect(`/prospects/${id}`);
  return data({ ok: true, id, existing, url: `http://localhost:4377/prospects/${id}` }, { headers: corsHeaders() });
}

function normalizeLinkedInUrl(value: string) {
  return value.trim().replace(/[?#].*$/, "").replace(/\/$/, "");
}

function normalizeTwitterUrl(value: string) {
  const trimmed = value.trim().replace(/[?#].*$/, "").replace(/\/$/, "");
  const match = trimmed.match(/(?:x\.com|twitter\.com)\/@?([^/?#\s]+)/i);
  const rawHandle = match?.[1] || trimmed.replace(/^@/, "");
  const handle = rawHandle && !/^https?:\/\//i.test(rawHandle) ? rawHandle.replace(/[^a-zA-Z0-9_]/g, "") : "";
  if (handle) return `https://x.com/${handle}`;
  return trimmed;
}

function normalizeOutreachMode(value: unknown): "with_note" | "no_note" {
  return value === "with_note" ? "with_note" : "no_note";
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function readPayload(request: Request): Promise<ExtensionPayload> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await request.json()) as ExtensionPayload;
  }

  const text = await request.text();
  return JSON.parse(text) as ExtensionPayload;
}
