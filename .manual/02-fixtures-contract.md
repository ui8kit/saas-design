# 2. Fixtures (@ui8kit/contract)

```bash
bun run content              # fixtures/figma → fixtures/content/records (entries, dictionaries, menus, settings, manifest)
bun run contract             # schema-validate all records → "errors 0, warnings 0"
bun tools/views.ts           # records → fixtures/views/home.json (site page) + blocks.json (one data set per block)
```

- Text/media changes: edit the mapping in `tools/content.ts`, not the JSON records.
- Each image is a `media` entry (`metadata.file` = repo path, `metadata.public_path` = URL); apps copy them with `node tools/copy-media.mjs <dest>`.
- Drift checks: `bun tools/content.ts --check`, `bun tools/views.ts --check`.
