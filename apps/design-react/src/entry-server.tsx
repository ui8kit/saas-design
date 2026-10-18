import { renderToStaticMarkup } from "react-dom/server";
import { Layout } from "./components/Layout";
import { routes } from "./routes";

export { routes };

/** Static markup of one route inside the app frame (no hydration: interactivity is packages/ui/behaviors/ui8kit.js). */
export function render(path: string): { title: string; body: string } {
  const route = routes.find((r) => r.path === path);
  if (!route) throw new Error(`unknown route ${path}`);
  return { title: route.title, body: renderToStaticMarkup(<Layout path={path}>{route.page()}</Layout>) };
}
