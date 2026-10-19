import type { Handle } from "@sveltejs/kit";
import themeInit from "../../../packages/ui/behaviors/theme-init.js?raw";

// Inline the no-flash theme snippet (the only inline script) into <head> of every prerendered page.
const snippet = `<script>${themeInit.trim()}</script>`;
// Pages are static (csr = false in +layout.ts: no hydration, behaviors come from ui8kit.js), so the Svelte SSR anchor
// comments (<!--[-->, <!---->, <!--]-->, head hash) carry no meaning: strip every comment and whitespace-only line,
// leaving <pre>/<textarea> contents untouched. Same output as design-react, whose renderer emits no comments.
const keep = /(<(?:pre|textarea)\b[\s\S]*?<\/(?:pre|textarea)>)/;
const clean = (html: string) =>
  html.split(keep).map((part, i) => (i % 2 ? part : part.replace(/<!--[\s\S]*?-->/g, "").replace(/\n[ \t]*(?=\n)/g, ""))).join("");
export const handle: Handle = ({ event, resolve }) =>
  resolve(event, { transformPageChunk: ({ html }) => clean(html.replace("%theme-init%", snippet)) });
