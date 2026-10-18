import { Inline, List, ListItem } from "@saas-design/ui/react";
import { radii, radius } from "$design/foundations";
import { PageHeader } from "../components/PageHeader";

export const title = "Radius · Habitus Design";

export function RadiusPage() {
  return (
    <>
      <PageHeader title="Radius" lead={`--radius is ${radius.base} (${radius.px}px, from Figma). rounded-sm/md/lg/xl derive from it (×0.25 / ×0.5 / ×1 / ×1.5).`} />
      <List className="ds-grid">
        {radii.map((r) => <ListItem className="ds-sample" key={r}><Inline className={`ds-tile ds-radius-${r}`} /><Inline className="ds-name">rounded-{r}</Inline></ListItem>)}
      </List>
    </>
  );
}
