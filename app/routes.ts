import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("formulacreator", "routes/formulacreator/FormulaCreator.tsx"),
  route("inventory", "routes/inventory/InventoryManager.tsx"),

] satisfies RouteConfig;
