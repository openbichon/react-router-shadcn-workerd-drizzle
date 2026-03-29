import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"),
  route("home", "routes/home.tsx"),
  route("users", "routes/users.tsx"),
  route("users/new", "routes/users.new.tsx"),
  route("users/:id/edit", "routes/users.$id.edit.tsx"),
] satisfies RouteConfig;
