import { Block, Inline, LinkPlain } from "@saas-design/ui/react";
import type { BlockMeta } from "$design/blocks";

// Previous / next block links at the bottom of a block page.
export function Pager({ prev, next }: { prev?: BlockMeta; next?: BlockMeta }) {
  return (
    <Block tag="nav" className="ds-pager" aria-label="Blocks">
      {prev ? <LinkPlain className="ds-toc-link" href={`/blocks/${prev.id}`}>← {prev.title}</LinkPlain> : <Inline />}
      {next ? <LinkPlain className="ds-toc-link" href={`/blocks/${next.id}`}>{next.title} →</LinkPlain> : null}
    </Block>
  );
}
