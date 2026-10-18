# templ: generated code must match the runtime version (now v0.3.1070)

Status: worked-around (pinned via `go run github.com/a-h/templ/cmd/templ@v0.3.1070`)

**Context.** codegen's templ output targets `github.com/a-h/templ v0.3.1001`. A locally installed `templ` CLI (v0.3.1070) generates `_templ.go`
calling `templ.ResolveAttributeValue`, which v0.3.1001 does not have.

**Repro.** `cd packages/ui/templ && templ generate && go build ./...` → `undefined: templ.ResolveAttributeValue`.

**Impact.** Confusing build break; Vercel/CI must not depend on whatever `templ` is on PATH.

**Proposed fix.** Always run `go run github.com/a-h/templ/cmd/templ@<pinned> generate` (done in our scripts) and commit `*_templ.go`;
upstream codegen should document the pin or emit a `tools.go` with the templ version.

**Update (codegen 2.0, 2026-10-18).** codegen 2.0 exports the pin (`TEMPL_VERSION = "v0.3.1070"` in `@ui8kit/xgen-runtime-templ`) and writes it into the generated `go.mod`. Every script, `go.mod` and doc of this repo moved to v0.3.1070, and every `*_templ.go` was regenerated. The rule is the same: never use the `templ` on PATH.
