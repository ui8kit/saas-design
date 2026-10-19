export const prerender = true;
export const trailingSlash = "never";
// Static pages, no client Svelte (like design-react): the theme toggle and Sheet run on packages/ui/behaviors/ui8kit.js,
// loaded from app.html. Without hydration the SSR anchor comments can be stripped (src/hooks.server.ts).
export const csr = false;
