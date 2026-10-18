# site navbar collapses below `lg`, not `md` as requested

Status: decided: keep lg (user, 2026-10-18)

**Context.** The request was "below md the nav collapses to a burger". At 768px the Figma navbar (brand 141px + six 18px items with 30px gaps = 592px + theme toggle + 113px CTA + 48px padding) overflows the 736px content width.

**Impact.** Between 768 and 1023px the site shows the burger + CTA instead of the full menu. The CTA is hidden below `md` and repeated inside the sheet.

**Decision.** Keep the burger below `lg` (1024px). Decided by the user on 2026-10-18; no change planned.
