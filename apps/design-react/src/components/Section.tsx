import type { ReactNode } from "react";
import { Container, Title } from "@saas-design/ui/react";

// A page section: <section aria-labelledby> + <h2>. Container, not Block: a page has one Block (its header).
export function Section({ id, title, titleClass = "ds-h2", label, sectionId, children }: { id?: string; title?: string; titleClass?: string; label?: string; sectionId?: string; children?: ReactNode }) {
  return (
    <Container tag="section" className="ds-section" id={sectionId} aria-labelledby={title ? id : undefined} aria-label={label}>
      {title ? <Title as={2} className={titleClass} id={id}>{title}</Title> : null}
      {children}
    </Container>
  );
}
