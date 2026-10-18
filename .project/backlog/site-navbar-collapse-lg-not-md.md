# site navbar collapses below `lg`, not `md` as requested

Status: deviation

**Context.** The request was "below md the nav collapses to a burger". At 768px the Figma navbar (brand 141px + six 18px items with 30px gaps = 592px + theme toggle + 113px CTA + 48px padding) overflows the 736px content width.

**Impact.** Between 768 and 1023px the site shows the burger + CTA instead of the full menu. The CTA is hidden below `md` and repeated inside the sheet.

**Proposed fix.** Accept `lg`. Alternatively, shrink the menu to 16px / gap-6 at `md` (a Figma deviation) and collapse at `md`. Decide with design.
