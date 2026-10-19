import { pageTitle } from "$design/site";
import { Showcase } from "../components/Showcase";

export const title = pageTitle("Components");

export function ComponentsPage() {
  return <Showcase kind="component" title="Components" lead="Interactive and composite bricks of @saas-design/ui: every recipe variant and every codegen showcase case, rendered from the generated React 19 / Svelte 5 parts." />;
}
