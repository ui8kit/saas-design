import { pageTitle } from "$design/site";
import { Inline, List, ListItem } from "@saas-design/ui/react";
import { shadows, shadowTokens } from "$design/foundations";
import { PageHeader } from "../components/PageHeader";

export const title = pageTitle("Shadows");

export function ShadowsPage() {
  return (
    <>
      <PageHeader title="Shadows" lead={`${shadowTokens.$comment} The Tailwind shadow steps stay available for app-level surfaces.`} />
      <List className="ds-grid">
        {shadows.map((s) => <ListItem className="ds-sample" key={s}><Inline className={`ds-tile ds-radius-lg ds-shadow-${s}`} /><Inline className="ds-name">{s === "base" ? "shadow" : `shadow-${s}`}</Inline></ListItem>)}
      </List>
    </>
  );
}
