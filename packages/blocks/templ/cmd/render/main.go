// Command render reads [{"block": id, "data": {...}}] on stdin and prints a JSON array of rendered HTML.
// Used by packages/blocks/scripts/parity.ts (templ vs Svelte SSR).
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/ui8kit/saas-design/packages/blocks/templ/blocks"
)

func main() {
	var cases []struct {
		Block string          `json:"block"`
		Data  json.RawMessage `json:"data"`
	}
	if err := json.NewDecoder(os.Stdin).Decode(&cases); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(2)
	}
	out := make([]string, 0, len(cases))
	for _, c := range cases {
		comp, err := blocks.Render(c.Block, c.Data)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		var buf bytes.Buffer
		if err := comp.Render(context.Background(), &buf); err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		out = append(out, buf.String())
	}
	_ = json.NewEncoder(os.Stdout).Encode(out)
}
