# templ: generated code must match the runtime version (v0.3.1001)

**Context.** codegen's templ output targets `github.com/a-h/templ v0.3.1001`. A locally installed `templ` CLI (v0.3.1070) generates `_templ.go`
calling `templ.ResolveAttributeValue`, which v0.3.1001 does not have.

**Repro.** `cd packages/ui/templ && templ generate && go build ./...` → `undefined: templ.ResolveAttributeValue`.

**Impact.** Confusing build break; Vercel/CI must not depend on whatever `templ` is on PATH.

**Proposed fix.** Always run `go run github.com/a-h/templ/cmd/templ@v0.3.1001 generate` (done in our scripts) and commit `*_templ.go`;
upstream codegen should document the pin or emit a `tools.go` with the templ version.
