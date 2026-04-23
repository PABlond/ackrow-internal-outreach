import { data } from "react-router";

import type { Route } from "./+types/api.extension.dashboard";
import { getExtensionDashboard, getWorkspaceBySlug, getWorkspaces } from "~/lib/outreach.server";

export async function loader({ request }: Route.LoaderArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  const workspaces = await getWorkspaces();
  const requestedSlug = new URL(request.url).searchParams.get("workspaceSlug") || "tempolis";
  const workspace = await getWorkspaceBySlug(requestedSlug) || await getWorkspaceBySlug("tempolis");
  if (!workspace) {
    return data({ ok: false, error: "No workspace configured" }, { status: 500, headers: corsHeaders(request) });
  }
  const dashboard = await getExtensionDashboard(workspace.id);
  return data({ ok: true, workspaces, ...dashboard }, { headers: corsHeaders(request) });
}

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };
}
