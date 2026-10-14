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
out = ROOT / 'dist' / 'freetogo-mockup.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print(f'wrote {out} ({out.stat().st_size // 1024} KB)')
