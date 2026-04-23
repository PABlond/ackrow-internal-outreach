import { data } from "react-router";

import type { Route } from "./+types/api.extension.connection-status";
import { syncProspectConnectionState } from "~/lib/outreach.server";

type ConnectionStatusPayload = {
  id?: number;
  state?: "accepted" | "declined" | "pending" | "unknown";
};

export async function action({ request }: Route.ActionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (request.method !== "POST") {
    return data({ ok: false, error: "Method not allowed" }, { status: 405, headers: corsHeaders(request) });
  }

  const payload = await readPayload(request);
  const id = Number(payload.id);
  if (!id) {
    return data({ ok: false, error: "Missing prospect id" }, { status: 400, headers: corsHeaders(request) });
  }

  if (payload.state === "unknown") {
    return data({ ok: true, synced: false }, { headers: corsHeaders(request) });
  }

  if (!["accepted", "declined", "pending"].includes(String(payload.state))) {
    return data({ ok: false, error: "Unknown connection state" }, { status: 400, headers: corsHeaders(request) });
  }

  await syncProspectConnectionState(id, payload.state as "accepted" | "declined" | "pending");
  return data({ ok: true, synced: true, state: payload.state }, { headers: corsHeaders(request) });
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

async function readPayload(request: Request): Promise<ConnectionStatusPayload> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await request.json()) as ConnectionStatusPayload;
  }

  const text = await request.text();
  return JSON.parse(text) as ConnectionStatusPayload;
}
