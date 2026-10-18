# hero: remaining fidelity gaps (badge star colour, logo glyph, phone tilt)

Status: open

**Context.** In compare/hero.png the badge star is yellow in Figma but white here, because no yellow token exists in mapping.json. The Figma logo is two overlapping `Polygon 1/2` vectors (22×19). Our `brand-mark` icon (packages/icons) is a bow-tie made of both triangles, but the Figma render shows one left-pointing shape. fig2design gives no vector geometry or rotation, so the real shape is unclear. Phone screens sit within about 8px of Figma. Figma `absoluteBoundingBox` is the post-rotation box and fig2design doesn't export the rotation pivot, so positions were nudged by eye.

**Impact.** Small visual gaps only.

**Proposed fix.** Add a `brand.star` token (app-level), confirm the logo shape with design (or get vector paths from fig2design), and get rotation and transform from fig2design (see fig2design-children-order-undocumented.md).
