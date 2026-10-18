import type { ComponentType } from "react";
import { Block, Box, Inline, List, ListItem, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Text, Title } from "@saas-design/ui/react";
import type showcase from "@saas-design/ui/showcase.json";

type Part = (typeof showcase)[number]["parts"][number];
// One part of a brick: every showcase case rendered with the codegen React output (`react` = React prop names), plus its prop table.
export function ShowcasePart({ part, Comp }: { part: Part; Comp?: ComponentType<Record<string, unknown>> }) {
  return (
    <Block tag="article" className="ds-part">
      <Title as={3} className="ds-h3">{part.name}</Title>
      {part.docs ? <Text className="ds-meta">{part.docs}</Text> : null}
      {Comp ? (
        <List className="ds-preview">
          {part.cases.map((c) => (
            <ListItem className="ds-case" key={c.id}>
              <Inline className="ds-meta">{c.id}</Inline>
              <Box className="ds-case-body">
                {part.children ? <Comp {...c.react}>{part.name}</Comp> : <Comp {...c.react} />}
              </Box>
            </ListItem>
          ))}
        </List>
      ) : null}
      {part.props.length ? (
        <Table className="ds-table">
          <TableHead>
            <TableRow><TableHeadCell className="ds-th">Prop</TableHeadCell><TableHeadCell className="ds-th">Type</TableHeadCell><TableHeadCell className="ds-th">Notes</TableHeadCell></TableRow>
          </TableHead>
          <TableBody>
            {part.props.map((p) => (
              <TableRow key={p.name}>
                <TableCell className="ds-td ds-name">{p.name}</TableCell><TableCell className="ds-td ds-meta">{p.type}</TableCell><TableCell className="ds-td ds-meta">{p.docs}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </Block>
  );
}
