# @ui8kit/contract: media ids and id lists in metadata are not reference-checked

Status: worked-around (`tools/validate-content.ts` checks them locally)

## Context
`validateCollectionV04` checks `parent_id`, terms and comment references, but not `featured_media_id`,
`settings.logo_media_id` / `front_page_id`, nor ids stored in `metadata` collections (our sections list
`items`, `media`, `logos`). A typo such as `featured_media_id: "media-avtar-sarah"` passes (0 errors).
The manifest `relation` type would check ids, but only for one-to-one / id arrays declared as `relation`
fields, and media are an entry `kind` like any other, so `featured_media_id` has no relation declaration.

Also met: `parent_id` must point to an entry of the same kind (`core.entry.parent_kind_invalid`), so a
page -> section tree cannot use `parent_id`; we keep the order in `page.metadata.sections` instead.
Metadata keys named like core fields (`version`, `status`) give `core.metadata_key_shadowed` warnings
(fine, but the README could suggest a prefix convention).

## Repro
Edit `fixtures/content/records/entries/testimonial/testimonial-sarah.json` -> `featured_media_id: "nope"`,
run `bun run contract` with the local check removed: 0 errors.

## Impact
Broken images surface only at build time of the apps.

## Proposed fix
Option `{ mediaKind: "media" }` (or a `references` map `{ featured_media_id: "media", "settings.logo_media_id": "media" }`)
that turns these into `core.entry.media_missing`; allow `relation` fields with `cardinality: many-to-many` inside
`collection` metadata to be checked as id lists. Document the same-kind parent rule in the README table.
