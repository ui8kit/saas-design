// React 19 icon component: renders the same <svg> as svg(name, cls) (templ icons.SVG, Svelte {@html svg()}).
import { icon } from "./icons.generated";

export function Icon({ name, className }: { name: string; className?: string }) {
  const i = icon(name);
  if (!i) return null;
  const paint = i.stroke
    ? { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
    : { fill: "currentColor" };
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={i.viewBox} {...paint} className={className} aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: i.inner }} />;
}
