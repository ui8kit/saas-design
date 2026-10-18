import { Block, Box, List, ListItem, LinkPlain, Text } from "@saas-design/ui/react";
import { nav } from "$design/nav";

// The design-system navigation (sidebar and mobile Sheet). The current page link carries a static aria-current in its own branch.
export function NavTree({ prefix, path }: { prefix: string; path: string }) {
  return (
    <Block tag="nav" aria-label="Design system">
      {nav.map((group, gi) => (
        <Box className="ds-nav-group" key={group.title}>
          <Text className="ds-nav-title" id={`${prefix}-group-${gi}`}>{group.title}</Text>
          <List className="ds-nav-list" aria-labelledby={`${prefix}-group-${gi}`}>
            {group.items.map((item) => (
              <ListItem key={item.href}>
                {path === item.href ? (
                  <LinkPlain className="ds-nav-link" href={item.href} aria-current="page">{item.label}</LinkPlain>
                ) : (
                  <LinkPlain className="ds-nav-link" href={item.href}>{item.label}</LinkPlain>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
    </Block>
  );
}
