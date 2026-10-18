import type { ReactNode } from "react";
import { Box, Container, LinkPlain, Sheet, SheetClose } from "@saas-design/ui/react";
import { NavTree } from "./NavTree";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

// App frame, same DOM as apps/design-svelte/src/routes/+layout.svelte. Behaviors (theme toggle, Sheet) come from
// packages/ui/behaviors/ui8kit.js, loaded by the document shell; there is no client React.
export function Layout({ path, children }: { path: string; children?: ReactNode }) {
  return (
    <>
      <LinkPlain className="ui-skip" href="#content">Skip to content</LinkPlain>
      <Topbar />
      <Sheet id="ds-nav-sheet" side="left" aria-label="Design system navigation">
        <SheetClose variant="ghost" className="ds-sheet-close" aria-label="Close navigation" />
        <NavTree prefix="sheet" path={path} />
      </Sheet>
      <Box className="ds-shell">
        <Sidebar path={path} />
        <Container tag="main" className="ds-main" id="content">
          {children}
        </Container>
      </Box>
    </>
  );
}
