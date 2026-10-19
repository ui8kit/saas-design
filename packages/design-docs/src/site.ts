// Design-app names and page titles from fixtures/site.config.json (design.name, design.title), shared by
// apps/design-svelte and apps/design-react so both render the same <title> and brand link.
import config from "../../../fixtures/site.config.json";

export const designName: string = config.design.name;
export const designTitle: string = config.design.title;
/** "Blocks" → "Blocks · Habitus Design"; several parts are joined in order. */
export const pageTitle = (...parts: string[]) => [...parts, designName].join(" · ");
