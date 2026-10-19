import { designName } from "$design/site";
import { Block, Box, LinkPlain, SheetTrigger, ThemeToggle } from "@saas-design/ui/react";

// Mobile top bar (hidden from lg): brand, theme toggle, Sheet trigger for the navigation.
export function Topbar() {
  return (
    <Block tag="header" className="ds-topbar">
      <LinkPlain className="ds-brand" href="/">{designName}</LinkPlain>
      <Box className="ds-topbar-actions">
        <ThemeToggle variant="ghost" />
        <SheetTrigger variant="ghost" controls="ds-nav-sheet" aria-label="Open navigation" />
      </Box>
    </Block>
  );
}
