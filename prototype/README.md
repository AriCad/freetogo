# Free To Go — Stage One clickable mockup

Plain HTML + CSS + vanilla JavaScript. No build, server, login, backend, API keys or internet needed. All data is fictional.

## Open it

**Easiest (any computer or phone):** download `dist/freetogo-mockup.html` (one self-contained file) and open it in a browser.
- GitHub: open the file on the `design/html-mockup` branch → **Download raw file** → double-click it.
- Phone: send the file to yourself and open it in Chrome/Safari, or open it from the Files app.

**From a clone:**
```bash
git clone https://github.com/AriCad/freetogo.git
cd freetogo
git checkout design/html-mockup
open prototype/index.html        # macOS
xdg-open prototype/index.html    # Linux
start prototype\index.html       # Windows
```
Also open `prototype/brand.html` for the three palettes and icon concepts.

## Test it

- **Desktop:** the phone frame is on the right; the **demo panel** on the left loads scenarios, ticks steps off as you do them, fires simulated events (another shop publishes, other collectors report "Kaikki loppu", reservation race), moves the demo clock, switches language and screen width (360/390/430 px), and shows the notification log (where deduplication is visible).
- **Phone or narrow window:** the app fills the screen; tap the dark **Demo** button (bottom right) for the panel.
- Start with **"1 · Ei ruokaa → ilmoitus → nouto"** and follow the checklist, then 2–5.
- Browser dev tools device mode (e.g. iPhone 14, Pixel 7) also works.

## What's simulated

Push notifications, OS permission prompts, GPS, camera, map, QR codes and stock are all simulated and labelled as such. Food pictures are drawn illustrations standing in for merchant photos.

## Rebuild the single-file version

After editing, regenerate `dist/freetogo-mockup.html` (Python 3, no packages):
```bash
python3 prototype/tools/build_single.py
```
