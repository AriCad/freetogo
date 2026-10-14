#!/usr/bin/env python3
"""Inline CSS, JS and fonts of prototype/index.html into dist/freetogo-mockup.html (one file, works offline)."""
import base64, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
html = (ROOT / 'index.html').read_text(encoding='utf-8')

def css(m):
    path = ROOT / m.group(1)
    text = path.read_text(encoding='utf-8')
    def font(f):
        data = base64.b64encode((path.parent / f.group(1)).resolve().read_bytes()).decode()
        return f'url("data:font/woff2;base64,{data}")'
    text = re.sub(r'url\("(\.\./fonts/[^"]+)"\)', font, text)
    return f'<style>\n{text}\n</style>'

def js(m):
    return '<script>\n' + (ROOT / m.group(1)).read_text(encoding='utf-8').replace('</script', '<\\/script') + '\n</script>'

html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css, html)
html = re.sub(r'<script src="([^"]+)"></script>', js, html)
# Embed photos so the single file works offline (FTG.photoSrc reads window.FTG_PHOTOS first).
import json
photos = {f.stem: 'data:image/jpeg;base64,' + base64.b64encode(f.read_bytes()).decode() for f in sorted((ROOT / 'v2' / 'photos').glob('*.jpg'))}
html = html.replace('<head>', '<head>\n<script>window.FTG_PHOTOS = ' + json.dumps(photos) + ';</script>', 1)
out = ROOT / 'dist' / 'freetogo-mockup.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print(f'wrote {out} ({out.stat().st_size // 1024} KB)')
