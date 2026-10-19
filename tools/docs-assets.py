"""Optimized README screenshots: <paths.shots of fixtures/site.config.json>/*.png (tools/shots.ts, tools/shots-modes.ts) -> docs/assets/*.png
(downscaled, 256-color palette). Needs Pillow.   python3 tools/docs-assets.py [shots-dir]"""
import json, os, sys
from pathlib import Path
from PIL import Image

_ROOT = Path(__file__).resolve().parents[1]
_CFG = json.loads((_ROOT / "fixtures/site.config.json").read_text())
SHOTS = Path(sys.argv[1] if len(sys.argv) > 1 else os.environ.get("SHOTS_DIR") or (_ROOT / _CFG["paths"]["shots"]).resolve())
OUT = Path(__file__).resolve().parent.parent / "docs/assets"
# name -> (source, crop height at source width or None, target width)
JOBS = {
    "hero-compare.png": ("compare/hero.png", None, 1200),
    "site-light.png": ("site-light.png", 1800, 720),
    "site-dark.png": ("site-dark.png", 1800, 720),
    "site-mobile-menu.png": ("site-mobile-menu.png", None, 390),
    "design-light.png": ("design-light.png", None, 960),
    "design-dark.png": ("design-dark.png", None, 960),
    "design-mobile-menu.png": ("design-mobile-menu.png", None, 390),
    "design-react-light.png": ("design-react-light.png", None, 960),
    "design-react-dark.png": ("design-react-dark.png", None, 960),
    "design-react-mobile.png": ("design-react-mobile.png", 844, 390),
}
for name, (src, crop, width) in JOBS.items():
    im = Image.open(SHOTS / src).convert("RGB")
    if crop:
        im = im.crop((0, 0, im.width, min(crop, im.height)))
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.quantize(256, method=Image.Quantize.MEDIANCUT).save(OUT / name, optimize=True)
    print(f"{name}: {im.size[0]}x{im.size[1]}, {(OUT / name).stat().st_size // 1024} KB")
