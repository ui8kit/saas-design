import type { Handle } from "@sveltejs/kit";
import themeInit from "../../../packages/ui/behaviors/theme-init.js?raw";

// Inline the no-flash theme snippet (the only inline script) into <head> of every prerendered page.
const snippet = `<script>${themeInit.trim()}</script>`;
export const handle: Handle = ({ event, resolve }) =>
  resolve(event, { transformPageChunk: ({ html }) => html.replace("%theme-init%", snippet) });
