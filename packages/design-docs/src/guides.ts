// The repo's guides, grouped for the design apps' Instructions page (/instructions). Framework-neutral data, rendered by
// apps/design-svelte and apps/design-react. Every path must exist in the repo: `bun run check` in packages/design-docs
// (scripts/guides.ts) fails on a missing file.

export const repo = "https://github.com/ui8kit/saas-design";
export const guideHref = (path: string) => `${repo}/blob/main/${path}`;

export type Guide = { title: string; path: string; text: string };
export type GuideGroup = { id: string; title: string; guides: Guide[] };

export const guideGroups: GuideGroup[] = [
  {
    id: "getting-started", title: "Getting started", guides: [
      { title: "README", path: "README.md", text: "What the repo builds, the pipeline diagram, prerequisites, quickstart and how to run the three apps." },
      { title: "Learn, in order", path: "docs/learn/README.md", text: "Ten short lessons from tokens to deploy, each linking the real files." },
      { title: "Agent guide", path: "AGENTS.md", text: "Golden rules, pipeline order, how to read common requests and the definition of done." },
      { title: "Architecture", path: "docs/architecture.md", text: "Layers, data flow and why the adapter layer exists." },
      { title: "Command manual", path: ".manual/README.md", text: "Short command-by-command manual, setup to deploy." },
      { title: "Contributing", path: "CONTRIBUTING.md", text: "Commit rules and how to propose a change." },
    ],
  },
  {
    id: "tokens", title: "Tokens & theming", guides: [
      { title: "Tokens", path: "docs/learn/01-tokens.md", text: "Where colors, radius and type come from; package tokens vs app brand tokens." },
      { title: "Design settings", path: "docs/design-settings.md", text: "Corners, spacing rhythm, media and control sizes, with the Figma measurements." },
      { title: "Tokens and brand-os", path: ".manual/03-tokens-brand-os.md", text: "Commands: mapping.json → theme.css, brand.css and the brand-os bundle." },
      { title: "Token rule", path: ".cursor/rules/tokens.mdc", text: "Token colors only in packages; brand colors only at app level." },
      { title: "Radius rule", path: ".cursor/rules/radius.mdc", text: "Outer 40px brand radius, one fixed md token inside, 8px preview frame." },
      { title: "Dark mode rule", path: ".cursor/rules/dark-mode.mdc", text: "How the dark theme is defined and switched." },
    ],
  },
  {
    id: "blocks", title: "Blocks & codegen", guides: [
      { title: "Primitives", path: "docs/learn/03-primitives.md", text: "codegen 2.0 bricks, recipe overrides and the generated templ, Svelte and React components." },
      { title: "Retag", path: "docs/learn/04-retag.md", text: "Why apps and blocks never write raw HTML tags, and the lint that checks it." },
      { title: "Blocks", path: "docs/learn/05-blocks.md", text: "The block DSL and how one def becomes three runtimes." },
      { title: "Adapter", path: "docs/learn/07-adapter.md", text: "Semantic ui-* classes and @apply." },
      { title: "Runtimes", path: "docs/learn/08-runtimes.md", text: "The three apps and DOM parity between them." },
      { title: "Add a runtime", path: "docs/add-a-runtime.md", text: "Adding Vue, Solid or a server template language, following how React was added." },
      { title: "Blocks and retag rule", path: ".cursor/rules/blocks-retag.mdc", text: "Block as the only landmark unit, retagged by meaning; no raw tags." },
    ],
  },
  {
    id: "figma", title: "Figma parser", guides: [
      { title: "Replicate with a new Figma file", path: "docs/replicate-with-new-figma.md", text: "Extract another .fig with fig2design, map its palette, frames and texts, then measure drift." },
      { title: "Contract and fixtures", path: "docs/learn/06-contract-fixtures.md", text: "Figma dump → contract records → view models; why copy never lives in components." },
      { title: "Extract a Figma file", path: ".manual/01-extract-figma.md", text: "Commands to run the fig2design parser on a .fig kept outside the repo." },
      { title: "Figma-to-site skill", path: ".cursor/skills/figma-to-site/SKILL.md", text: "The agent workflow from .fig to deployed apps." },
      { title: "Figma blocks source", path: "packages/blocks/defs/figma.ts", text: "The ten blocks rebuilt from the Figma frame, as block DSL." },
      { title: "Figma content mapping", path: "tools/content.ts", text: "Reads the parsed frame by node id and image hash and writes the contract records." },
    ],
  },
  {
    id: "checks", title: "Checks & policy", guides: [
      { title: "Checks lesson", path: "docs/learn/09-checks.md", text: "What bun run check runs and how to read a failure." },
      { title: "All checks", path: "docs/checks.md", text: "Every check, what it verifies and how to fix it." },
      { title: "The 8+4 grid", path: "docs/learn/02-grid-8-4.md", text: "Layout and control rhythm, and how ui8px enforces both." },
      { title: "Grid rule", path: ".cursor/rules/grid-8-4.mdc", text: "Allowed spacing steps per scope and how new utilities are reviewed." },
      { title: "Troubleshooting", path: "docs/troubleshooting.md", text: "Known gaps and their fixes, linked to the backlog." },
      { title: "Backlog format", path: ".project/backlog/README.md", text: "How tool problems and deliberate deviations are logged." },
    ],
  },
  {
    id: "deploy", title: "Deploy", guides: [
      { title: "Deploy lesson", path: "docs/learn/10-deploy.md", text: "The three Vercel projects in short." },
      { title: "Deploy to Vercel", path: "docs/deploy-vercel.md", text: "Three Vercel projects from one repo: root directories, install and build commands." },
      { title: "Deploy commands", path: ".manual/08-deploy-vercel.md", text: "Terse deploy manual." },
      { title: "Git workflow rule", path: ".cursor/rules/git-workflow.mdc", text: "Small verified commits, normal push, no force or amend." },
    ],
  },
];
