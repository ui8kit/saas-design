import { Box, Text } from "@saas-design/ui/react";
import { registry } from "@saas-design/blocks/react";
import { blockData } from "$design/blocks";

// One block of packages/blocks (codegen React output) rendered with its fixture view data.
export function BlockPreview({ id }: { id: string }) {
  const Preview = registry[id];
  const data = blockData(id);
  return (
    <Box className="ds-frame">
      {Preview && data ? <Preview data={data} /> : <Text className="ds-meta">No preview data for {id}.</Text>}
    </Box>
  );
}
