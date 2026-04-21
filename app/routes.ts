import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("batch", "routes/batch.tsx"),
  route("discover", "routes/discover.tsx"),
  route("search", "routes/search.tsx"),
  route("prospects/:id", "routes/prospect.$id.tsx"),
] satisfies RouteConfig;
