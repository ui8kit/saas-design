import type { ReactElement } from "react";
import { blocks } from "$design/blocks";
import * as BlockPage from "./pages/BlockPage";
import * as Blocks from "./pages/Blocks";
import * as Colors from "./pages/Colors";
import * as Components from "./pages/Components";
import * as Overview from "./pages/Overview";
import * as Primitives from "./pages/Primitives";
import * as Radius from "./pages/Radius";
import * as Shadows from "./pages/Shadows";
import * as Spacing from "./pages/Spacing";
import * as Typography from "./pages/Typography";
import * as Widgets from "./pages/Widgets";

export type Route = { path: string; title: string; page: () => ReactElement };

// Every prerendered page: the same 49 routes as apps/design-svelte (10 static pages + 39 blocks).
export const routes: Route[] = [
  { path: "/", title: Overview.title, page: () => <Overview.OverviewPage /> },
  { path: "/foundations/colors", title: Colors.title, page: () => <Colors.ColorsPage /> },
  { path: "/foundations/typography", title: Typography.title, page: () => <Typography.TypographyPage /> },
  { path: "/foundations/spacing", title: Spacing.title, page: () => <Spacing.SpacingPage /> },
  { path: "/foundations/radius", title: Radius.title, page: () => <Radius.RadiusPage /> },
  { path: "/foundations/shadows", title: Shadows.title, page: () => <Shadows.ShadowsPage /> },
  { path: "/primitives", title: Primitives.title, page: () => <Primitives.PrimitivesPage /> },
  { path: "/components", title: Components.title, page: () => <Components.ComponentsPage /> },
  { path: "/widgets", title: Widgets.title, page: () => <Widgets.WidgetsPage /> },
  { path: "/blocks", title: Blocks.title, page: () => <Blocks.BlocksPage /> },
  ...blocks.map((b) => ({ path: `/blocks/${b.id}`, title: BlockPage.title(b.id), page: () => <BlockPage.BlockPage id={b.id} /> })),
];
