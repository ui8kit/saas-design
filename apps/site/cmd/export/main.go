// Command export renders fixtures/views/*.json with the templ blocks into static HTML (apps/site/public).
//
//	go run ./cmd/export -views ../../fixtures/views -out public
package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/a-h/templ"
	"github.com/ui8kit/saas-design/apps/site/views"
	"github.com/ui8kit/saas-design/packages/blocks/templ/blocks"
)

type pageFile struct {
	Page   views.PageMeta `json:"page"`
	Blocks []struct {
		ID     string          `json:"id"`
		Block  string          `json:"block"`
		Region string          `json:"region"`
		Data   json.RawMessage `json:"data"`
	} `json:"blocks"`
}

// pages maps view files to output paths.
var pages = map[string]string{"home.json": "index.html"}

func main() {
	viewsDir := flag.String("views", "../../fixtures/views", "view model directory")
	out := flag.String("out", "public", "output directory")
	css := flag.String("css", "/assets/app.css", "stylesheet href")
	js := flag.String("js", "/assets/ui8kit.js", "behavior script href (packages/ui/behaviors/ui8kit.js)")
	themeInit := flag.String("theme-init", "../../packages/ui/behaviors/theme-init.js", "inline <head> script that sets .dark before first paint")
	flag.Parse()
	initJS, err := os.ReadFile(*themeInit)
	if err != nil {
		fmt.Fprintln(os.Stderr, "export:", err)
		os.Exit(1)
	}
	assets := views.Assets{CSS: *css, JS: *js, ThemeInit: strings.TrimSpace(string(initJS))}
	for src, dst := range pages {
		if err := export(filepath.Join(*viewsDir, src), filepath.Join(*out, dst), assets); err != nil {
			fmt.Fprintln(os.Stderr, "export:", err)
			os.Exit(1)
		}
		fmt.Printf("export: %s -> %s\n", src, filepath.Join(*out, dst))
	}
}

func export(src, dst string, assets views.Assets) error {
	raw, err := os.ReadFile(src)
	if err != nil {
		return err
	}
	var pf pageFile
	if err := json.Unmarshal(raw, &pf); err != nil {
		return fmt.Errorf("%s: %w", src, err)
	}
	var r views.Regions
	for _, b := range pf.Blocks {
		c, err := blocks.Render(b.Block, b.Data)
		if err != nil {
			return err
		}
		switch b.Region {
		case "header":
			r.Header = append(r.Header, c)
		case "footer":
			r.Footer = append(r.Footer, c)
		default:
			r.Main = append(r.Main, c)
		}
	}
	if err := os.MkdirAll(filepath.Dir(dst), 0o755); err != nil {
		return err
	}
	f, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer f.Close()
	var _ templ.Component = views.Page(pf.Page, r, assets)
	return views.Page(pf.Page, r, assets).Render(context.Background(), f)
}
