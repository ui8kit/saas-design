/**
 * Shared block kits: compositions that repeat across blocks get ONE semantic class
 * (found by `ui8px validate patterns`). A node opts in with { kit: "<name>" } → class ui-<name>.
 * Block-specific classes are emitted after kits, so a block can still refine a kit.
 */
export const kits: Record<string, string> = {
  "section": "py-24",
  "section-container": "mx-auto flex max-w-page flex-col gap-12 px-6 lg:px-0",
  "section-container-narrow": "mx-auto flex max-w-3xl flex-col gap-12 px-6",
  "section-head": "flex flex-col gap-4",
  "section-head-center": "flex flex-col items-center gap-4 text-center",
  "section-title": "text-5xl font-bold",
  "section-title-display": "text-6xl leading-tight font-bold",
  "section-title-sm": "text-3xl font-bold",
  "section-lead": "max-w-2xl text-xl font-light text-muted-foreground",
  "stack-2": "flex flex-col gap-2",
  "stack-4": "flex flex-col gap-4",
  "stack-6": "flex flex-col gap-6",
  "stack-8": "flex flex-col gap-8",
  "item-title": "text-xl font-semibold",
  "item-title-sm": "text-lg font-semibold",
  "muted": "text-muted-foreground",
  "muted-sm": "text-sm text-muted-foreground",
  "grid-3": "grid grid-cols-1 gap-10 md:grid-cols-3",
  "cell": "px-6 py-4",
  "icon-sm": "size-4",
};
