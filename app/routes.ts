import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"),
  route("home", "routes/home.tsx"),
  route("users", "routes/users.tsx"),
  route("products", "routes/products.tsx"),
] satisfies RouteConfig;
