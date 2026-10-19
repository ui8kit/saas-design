# New brand: rename and recolour

This takes you from a fresh clone to a renamed, recoloured copy that passes `bun run check`. The Figma frame and the blocks stay the same. For a different Figma file, see [replicate-with-new-figma.md](replicate-with-new-figma.md).

Verified on 2026-10-19 in a clean clone in `/tmp`: Habitus was renamed to Lumen, primary/ring went from Orange to `#2563eb`, then `bun run check` passed (all checks) along with `bun tools/test-behaviors.ts`.

## 0. Clone and install

```bash
git clone https://github.com/ui8kit/saas-design.git my-brand && cd my-brand
bun install --frozen-lockfile
bun run check            # baseline: green before you change anything
```

You need bun, Go (for templ and apps/site) and Chrome at `/usr/bin/google-chrome` for the layout audit and behaviour tests. Set `CHROME=/path/to/chrome` to use another Chrome.

## 1. Names: `fixtures/site.config.json`

One file holds everything that makes this repo a specific product:

| Key | Used by | Example |
|---|---|---|
| `brand.name` | `tools/content.ts` (footer title, settings, `site.name`, media alts, `proof.logos`), `tools/views.ts` (catalog demo titles), `tools/tokens.ts` (brand-os meta) | `"Lumen"` |
| `brand.slug`, `brand.description` | `tools/tokens.ts` → `fixtures/tokens/brand.contract.json` | `"lumen"` |
| `site.homeTitle` | `<title>` of apps/site (page record `page-home`) | `"Lumen — Build Better Focus"` |
| `design.name`, `design.title` | both design apps: sidebar/topbar brand link, every `<title>` (`X · <name>`), overview heading (`packages/design-docs/src/site.ts`) | `"Lumen Design"`, `"Lumen Design System"` |
| `figma.frame`, `figma.fig` | `tools/content.ts`, `tokens.ts`, `shots.ts`, `figma-render.ts`, `extract.sh` | `"1-10"`, `"../fig-fixtures/saas.fig"` |
| `paths.shots` | `tools/shots*.ts`, `figma-render.ts`, `docs-assets.py` | `"../shots-saas"` |

Paths are relative to the repo root. These env vars override them: `FIG`, `FIGMA_FRAME`, `SHOTS_DIR` and `CHROME`. Print the resolved values with `bun tools/config.ts` (or `bun tools/config.ts shots` for one value).

## 2. Authored copy: `fixtures/content/source/`

Product copy you wrote yourself (FAQ, features, steps, …) lives in `fixtures/content/source/authored.json` and `blocks.json`. It is content, not config, so rename it there:

```bash
rg -n Habitus fixtures/content/source        # 6 lines in authored.json
sed -i 's/Habitus/Lumen/g' fixtures/content/source/*.json
```

Also set `repository` in `authored.json` (the footer source link) to your repo.

Copy that comes **from the Figma frame** stays as it is: for example, the testimonials headline "…using Habitus…", the CTA text and the footer copyright. `tools/content.ts` reads it by node id (`txt("1:…")`). To change it, re-extract an edited `.fig` ([replicate-with-new-figma.md](replicate-with-new-figma.md)) or override that one field in `content.ts`.

## 3. Colours: `fixtures/tokens/mapping.json`

Every shadcn role (`primary`, `ring`, `accent`, `chart-1..5`, …) in `light` and `dark` maps to a Figma variable name from `fixtures/figma/variables.json` or to a literal hex:

```json
"primary": "#2563eb",
"ring": "#2563eb",
```

Use only tokens: never put a colour in a block def or app CSS. See [learn/01-tokens.md](learn/01-tokens.md) for the dark side and contrast notes.

## 4. Regenerate, in order

```bash
bun run regen            # tokens → content → icons → ui → blocks (+templ) → views → ui8px policy → design-docs → site templ → contract
bun run brand:emit && bun run brand:check
bun run check
bun tools/test-behaviors.ts
```

If you would rather run the steps one by one, keep this order:

1. `bun run tokens`: writes `packages/tokens/theme.css`, the brand CSS and `fixtures/tokens/*`.
2. `bun run content`: **required after a token change**. The records embed token values (`token-light-primary.json`) and the brand name, so `check` fails with records drift until you run it.
3. `bun tools/views.ts`: writes `fixtures/views/{home,blocks}.json`.
4. `bun run brand:emit`, then `bun run check`.

What changes (28 files in the walkthrough): records under `fixtures/content/records/`, `fixtures/tokens/*`, `fixtures/views/*.json` and `packages/tokens/theme.css`. FAQ records whose slug contains the name get renamed (`faq-can-i-use-lumen-offline.json`). Commit them all. They are generated, so never edit them by hand.

## 5. Look at it

```bash
bun run site:build && bun run design-svelte:build && bun run design-react:build
bun run shots:modes      # light / dark / mobile → paths.shots
```

## Not covered here

- A different Figma file or frame: [replicate-with-new-figma.md](replicate-with-new-figma.md). Set `figma.frame` and `figma.fig` first.
- Radius, spacing and button sizes: [design-settings.md](design-settings.md).
- Deploying your copy: [deploy-vercel.md](deploy-vercel.md).
