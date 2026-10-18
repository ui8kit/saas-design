/**
 * Shared @apply emitter for the adapter (packages/ui + packages/blocks generators).
 * - `placeholder:` / `backdrop:` utilities become ::placeholder / ::backdrop rules (ui8px only accepts a fixed
 *   modifier set; pseudo-element rules are plain CSS and keep the utility itself linted).
 * - inset-ring color utilities go into a second @apply on the same selector: ui8px groups every `inset-*`
 *   token as one spacing conflict group, so `inset-ring inset-ring-input` is a false UI8PX004
 *   (see .project/backlog/ui8px-inset-ring-false-positives.md).
 */
const PSEUDO: Record<string, string> = { placeholder: "::placeholder", backdrop: "::backdrop" };
const isInsetRingColor = (t: string) => /^inset-ring-(?!\d|\[)/.test(t.split(":").pop()!);

export function applyRules(selector: string, utilities: string, indent = "  "): string[] {
  const tokens = utilities.trim().split(/\s+/).filter(Boolean);
  const main: string[] = [], color: string[] = [];
  const pseudo = new Map<string, string[]>();
  for (const t of tokens) {
    const mods = t.split(":"); const first = mods[0]!;
    if (mods.length > 1 && PSEUDO[first]) { const p = PSEUDO[first]!; pseudo.set(p, [...(pseudo.get(p) ?? []), mods.slice(1).join(":")]); continue; }
    (isInsetRingColor(t) ? color : main).push(t);
  }
  const out: string[] = [];
  const decl = [main, color].filter((g) => g.length).map((g) => `@apply ${g.join(" ")};`);
  if (decl.length) out.push(`${indent}${selector} { ${decl.join(" ")} }`);
  for (const [p, list] of pseudo) out.push(`${indent}${selector}${p} { @apply ${list.join(" ")}; }`);
  return out;
}
