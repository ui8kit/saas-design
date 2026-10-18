import type { ReactNode } from "react";
import { Block, Text, Title } from "@saas-design/ui/react";

// The header of every page: the page's one Block (semantic <header>). Pages open on it (block-root rule).
export function PageHeader({ title, lead, eyebrow, children }: { title: string; lead?: ReactNode; eyebrow?: string; children?: ReactNode }) {
  return (
    <Block tag="header" className="ds-header">
      {eyebrow ? <Text className="ds-meta">{eyebrow}</Text> : null}
      <Title as={1} className="ds-title">{title}</Title>
      {lead ? <Text className="ds-lead">{lead}</Text> : null}
      {children}
    </Block>
  );
}
