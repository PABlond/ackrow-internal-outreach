import { data, redirect } from "react-router";

import type { Route } from "./+types/api.extension.prospect";
import { analyzeLinkedInExtensionProspect, analyzeTwitterExtensionProspect } from "~/lib/batch.server";
import {
  findProspectByProfileUrl,
  getWorkspaceBySlug,
  importAnalyzedProspects,
  saveProspectEvidence,
  setProspectOutreachPreference,
  type Workspace,
} from "~/lib/outreach.server";

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
  workspaceSlug?: string;
};

export async function action({ request }: Route.ActionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (request.method !== "POST") {
    return data({ ok: false, error: "Method not allowed" }, { status: 405, headers: corsHeaders(request) });
  }

  const payload = await readPayload(request);
  const workspace = await workspaceFromPayload(payload, request);
  if (payload.sourceChannel === "twitter") {
    return handleTwitterPayload(payload, workspace, request);
  }

  const profileUrl = normalizeLinkedInUrl(String(payload.profileUrl || ""));
  if (!profileUrl.includes("linkedin.com/in/")) {
    return data({ ok: false, error: "Open a LinkedIn profile page first." }, { status: 400, headers: corsHeaders(request) });
  }

  const existingId = await findProspectByProfileUrl(profileUrl, workspace.id);
  if (existingId) {
    await setProspectOutreachPreference(existingId, normalizeOutreachMode(payload.outreachMode));
    await saveProspectEvidence({
      prospectId: existingId,
      workspaceId: workspace.id,
      sourceChannel: "linkedin",
      captureSource: "extension",
      payload: { ...payload, profileUrl, sourceChannel: "linkedin" },
    });
    return respond(payload, existingId, true, workspace, request);
  }

  const analysis = await analyzeLinkedInExtensionProspect({ ...payload, profileUrl }, workspace);
  await importAnalyzedProspects(analysis.prospects, workspace.id);
  const id = await findProspectByProfileUrl(profileUrl, workspace.id);

  if (!id) {
    return data({ ok: false, error: "Profile analyzed but not found after import." }, { status: 500, headers: corsHeaders(request) });
  }

  await setProspectOutreachPreference(id, normalizeOutreachMode(payload.outreachMode));
  await saveProspectEvidence({
    prospectId: id,
    workspaceId: workspace.id,
    sourceChannel: "linkedin",
    captureSource: "extension",
    payload: { ...payload, profileUrl, sourceChannel: "linkedin" },
  });
  return respond(payload, id, false, workspace, request);
}

async function handleTwitterPayload(payload: ExtensionPayload, workspace: Workspace, request: Request) {
  const profileUrl = normalizeTwitterUrl(String(payload.profileUrl || payload.twitterUrl || payload.twitterHandle || ""));
  if (!profileUrl.includes("x.com/") && !profileUrl.includes("twitter.com/")) {
    return data({ ok: false, error: "Open a Twitter/X profile page first." }, { status: 400, headers: corsHeaders(request) });
  }

  const existingId = await findProspectByProfileUrl(profileUrl, workspace.id);
  if (existingId) {
    await saveProspectEvidence({
      prospectId: existingId,
      workspaceId: workspace.id,
      sourceChannel: "twitter",
      captureSource: "extension",
      payload: { ...payload, profileUrl, twitterUrl: profileUrl, sourceChannel: "twitter" },
    });
    return respond(payload, existingId, true, workspace, request);
  }

  const analysis = await analyzeTwitterExtensionProspect({ ...payload, profileUrl, twitterUrl: profileUrl }, workspace);
  await importAnalyzedProspects(analysis.prospects, workspace.id);
  const id = await findProspectByProfileUrl(profileUrl, workspace.id);

  if (!id) {
    return data({ ok: false, error: "Twitter/X profile analyzed but not found after import." }, { status: 500, headers: corsHeaders(request) });
  }

  await saveProspectEvidence({
    prospectId: id,
    workspaceId: workspace.id,
    sourceChannel: "twitter",
    captureSource: "extension",
    payload: { ...payload, profileUrl, twitterUrl: profileUrl, sourceChannel: "twitter" },
  });
  return respond(payload, id, false, workspace, request);
}

async function workspaceFromPayload(payload: ExtensionPayload, request: Request) {
  if (payload.workspaceSlug) {
    const workspace = await getWorkspaceBySlug(payload.workspaceSlug);
    if (workspace) return workspace;
  }
  const querySlug = new URL(request.url).searchParams.get("workspaceSlug");
  if (querySlug) {
    const workspace = await getWorkspaceBySlug(querySlug);
    if (workspace) return workspace;
  }
  const fallback = await getWorkspaceBySlug("tempolis");
  if (!fallback) throw new Error("Default workspace is missing.");
  return fallback;
}

function respond(payload: ExtensionPayload, id: number, existing: boolean, workspace: Workspace, request: Request) {
  const path = `/${workspace.slug}/prospects/${id}`;
  if (payload.open) return redirect(path);
  return data({ ok: true, id, existing, url: `http://localhost:4377${path}` }, { headers: corsHeaders(request) });
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

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
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
