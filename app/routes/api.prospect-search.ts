import { data } from "react-router";

import type { Route } from "./+types/api.prospect-search";
import { searchProspectsGlobally } from "~/lib/outreach.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const prospects = await searchProspectsGlobally(query, 8);
  return data({ ok: true, prospects });
}
