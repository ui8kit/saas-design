import { attrClass, attrExpr, attrRest, attrStatic, brick, defaultIfEmpty, el, fwd, pAttrs, pClass, pPass, prop, pSize, pStr, pVariant } from "@ui8kit/codegen/bricks/_dsl";
import { lucide } from "../_lucide";
import variants from "./themetoggle.variants.json";

/**
 * ThemeToggle: light/dark switch. Static markup is identical in both runtimes; behavior (aria-pressed sync, localStorage,
 * prefers-color-scheme) comes from the shared vanilla script packages/ui/behaviors/ui8kit.js via data-ui8kit="theme-toggle".
 * The sun is shown in dark mode (action: go light), the moon in light mode — pure CSS on the .dark root class.
 */
export default brick({
  id: "ui.themetoggle",
  dir: "themetoggle",
  docs: "ThemeToggle switches between light and dark color schemes (button with aria-pressed). Behavior: data-ui8kit=\"theme-toggle\" in behaviors/ui8kit.js.",
  recipes: { themetoggle: { file: "themetoggle.variants.json", recipe: variants } },
  parts: [
    {
      name: "ThemeToggle",
      docs: "ThemeToggle renders a button with Lucide sun/moon icons; aria-pressed reflects dark mode.",
      recipeId: "themetoggle",
      classes: { recipe: { variant: "Variant", size: "Size" } },
      props: [pVariant("default, ghost, contrast (on primary surfaces), current (inherits text color)"), pSize("sm, default, lg"), pClass(), pPass("ID"), pStr("AriaLabel", "accessible name (default: Dark mode)"), pAttrs()],
      render: el(
        "button",
        [
          attrStatic("type", "button"),
          attrClass(),
          fwd("id", "ID"),
          attrStatic("data-ui8kit", "theme-toggle"),
          attrExpr("aria-label", defaultIfEmpty(prop("AriaLabel"), "Dark mode")),
          attrStatic("aria-pressed", "false"),
          attrRest(),
        ],
        [lucide("sun", "ui-themetoggle-sun"), lucide("moon", "ui-themetoggle-moon")],
      ),
    },
  ],
});
