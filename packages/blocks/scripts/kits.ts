/**
 * Shared block kits: compositions that repeat across blocks get ONE semantic class
 * (found by `ui8px validate patterns`). A node opts in with { kit: "<name>" } → class ui-<name>.
 * Block-specific classes are emitted after kits, so a block can still refine a kit.
 */
export const kits: Record<string, string> = {
  "section": "px-6 py-16 md:px-10 md:py-20 lg:px-12 lg:py-24",
  "section-container": "mx-auto flex w-full max-w-page flex-col gap-8 md:gap-10 lg:gap-12",
  "section-container-narrow": "mx-auto flex w-full max-w-3xl flex-col gap-8 md:gap-10 lg:gap-12",
  "section-head": "flex flex-col gap-4",
  "section-head-center": "flex flex-col items-center gap-4 text-center",
  "section-title": "text-4xl font-bold md:text-5xl",
  "section-title-display": "text-4xl leading-tight font-bold md:text-5xl lg:text-6xl",
  "section-title-sm": "text-3xl font-bold",
  "section-lead": "max-w-2xl text-lg font-light text-muted-foreground md:text-xl",
  "stack-2": "flex flex-col gap-2",
  "stack-4": "flex flex-col gap-4",
  "stack-6": "flex flex-col gap-6",
  "stack-8": "flex flex-col gap-8",
  "item-title": "text-xl font-semibold",
  "item-title-sm": "text-lg font-semibold",
  "muted": "text-muted-foreground",
  "muted-sm": "text-sm text-muted-foreground",
  "grid-3": "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-10",
  "cell": "px-2 py-4 whitespace-nowrap md:px-6",
  "icon-sm": "size-4",
};
