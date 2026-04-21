import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), route("batch", "routes/batch.tsx")] satisfies RouteConfig;
