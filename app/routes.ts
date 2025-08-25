import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/dashboard-layout.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("admin", "routes/admin.tsx"),
  ]),
  index("routes/home/index.tsx"),
  route("auth/callback", "routes/auth/callback.ts"),
  route("auth/logout", "routes/auth/logout.ts"),
] satisfies RouteConfig;
