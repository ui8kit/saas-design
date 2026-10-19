import { designName } from "$design/site";
import { Block, Box, LinkPlain, ThemeToggle } from "@saas-design/ui/react";
import { NavTree } from "./NavTree";

// Desktop sidebar (from lg): brand, theme toggle, navigation.
export function Sidebar({ path }: { path: string }) {
  return (
    <Block tag="aside" className="ds-sidebar">
      <Box className="ds-sidebar-head">
        <LinkPlain className="ds-brand" href="/">{designName}</LinkPlain>
        <ThemeToggle variant="ghost" size="sm" />
      </Box>
      <NavTree prefix="side" path={path} />
    </Block>
  );
}
