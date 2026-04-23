import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/_app.tsx", [
    index("routes/home.tsx"),
    route("prospects", "routes/prospects._index.tsx"),
    route("prospects/:id", "routes/prospect.$id.tsx"),
    route("import", "routes/import.tsx"),
    route("discover", "routes/discover.tsx"),
  ]),

  route("api/extension/dashboard", "routes/api.extension.dashboard.ts"),
  route("api/extension/connection-status", "routes/api.extension.connection-status.ts"),
  route("api/extension/prospect", "routes/api.extension.prospect.ts"),

  route("batch", "routes/_redirects/batch.ts"),
  route("twitter", "routes/_redirects/twitter.ts"),
  route("search", "routes/_redirects/search.ts"),
] satisfies RouteConfig;
