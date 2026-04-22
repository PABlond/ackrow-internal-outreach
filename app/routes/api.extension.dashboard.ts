import { data } from "react-router";

import type { Route } from "./+types/api.extension.dashboard";
import { getExtensionDashboard } from "~/lib/outreach.server";

export async function loader({ request }: Route.LoaderArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const dashboard = await getExtensionDashboard();
  return data({ ok: true, ...dashboard }, { headers: corsHeaders() });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
