import { attrBool, attrClass, attrExpr, attrRest, attrStatic, brick, defaultIfEmpty, el, fwd, not, pAttrs, pBool, pChildren, pClass, pCva, prop, pSize, pStr, pVariant, slot } from "@ui8kit/codegen/bricks/_dsl";
import { lucide } from "../_lucide";
import sheetVariants from "./sheet.variants.json";
import triggerVariants from "./sheettrigger.variants.json";

/**
 * Sheet: side drawer dialog (role=dialog, aria-modal) + trigger/close buttons. Markup is identical in templ and Svelte;
 * open/close, focus trap, Esc, overlay click, focus restore and aria-expanded sync live in packages/ui/behaviors/ui8kit.js
 * (data-ui8kit="sheet" | "sheet-trigger" | "sheet-close"). Without JS the sheet stays hidden and the trigger does nothing.
 */
export default brick({
  id: "ui.sheet",
  dir: "sheet",
  docs: "Sheet is a side drawer dialog with a trigger (Lucide menu/x) and a close button. Behavior: behaviors/ui8kit.js.",
  recipes: {
    sheet: { file: "sheet.variants.json", recipe: sheetVariants },
    sheettrigger: { file: "sheettrigger.variants.json", recipe: triggerVariants },
  },
  parts: [
    {
      name: "Sheet",
      docs: "Sheet renders the hidden dialog root: overlay + panel (children). ID is required for the trigger's aria-controls.",
      recipeId: "sheet",
      classes: { recipe: { side: "Side" } },
      props: [pCva("Side", "side", "left or right"), pClass(), pStr("ID", "dialog id (target of SheetTrigger Controls)"), pStr("AriaLabel", "accessible name (default: Menu)"), pBool("Open", "render open (static); default hidden"), pAttrs(), pChildren()],
      render: el(
        "div",
        [
          attrClass(),
          fwd("id", "ID"),
          attrStatic("role", "dialog"),
          attrStatic("aria-modal", "true"),
          attrExpr("aria-label", defaultIfEmpty(prop("AriaLabel"), "Menu")),
          attrStatic("data-ui8kit", "sheet"),
          attrBool("hidden", not(prop("Open"))),
          attrRest(),
        ],
        [
          el("div", [attrStatic("class", "ui-sheet-overlay"), attrStatic("data-ui8kit", "sheet-overlay")], []),
          el("div", [attrStatic("class", "ui-sheet-panel")], [slot()]),
        ],
      ),
    },
    {
      name: "SheetTrigger",
      docs: "SheetTrigger renders the menu button (aria-expanded, aria-controls, aria-haspopup=dialog) with Lucide menu/x icons.",
      recipeId: "sheettrigger",
      classes: { recipe: { variant: "Variant", size: "Size" } },
      props: [pVariant("default, ghost, contrast, current"), pSize("sm, default, lg"), pClass(), pStr("Controls", "id of the Sheet"), pStr("AriaLabel", "accessible name (default: Open menu)"), pAttrs()],
      render: el(
        "button",
        [
          attrStatic("type", "button"),
          attrClass(),
          attrStatic("data-ui8kit", "sheet-trigger"),
          fwd("aria-controls", "Controls"),
          attrStatic("aria-expanded", "false"),
          attrStatic("aria-haspopup", "dialog"),
          attrExpr("aria-label", defaultIfEmpty(prop("AriaLabel"), "Open menu")),
          attrRest(),
        ],
        [lucide("menu", "ui-sheet-icon-open"), lucide("x", "ui-sheet-icon-close")],
      ),
    },
    {
      name: "SheetClose",
      docs: "SheetClose renders the close button (Lucide x) inside the panel.",
      recipeId: "sheettrigger",
      classes: { recipe: { variant: "Variant", size: "Size" } },
      props: [pVariant("default, ghost, contrast, current"), pSize("sm, default, lg"), pClass(), pStr("AriaLabel", "accessible name (default: Close menu)"), pAttrs()],
      render: el(
        "button",
        [
          attrStatic("type", "button"),
          attrClass(),
          attrStatic("data-ui8kit", "sheet-close"),
          attrExpr("aria-label", defaultIfEmpty(prop("AriaLabel"), "Close menu")),
          attrRest(),
        ],
        [lucide("x", "ui-sheet-close-icon")],
      ),
    },
  ],
});
