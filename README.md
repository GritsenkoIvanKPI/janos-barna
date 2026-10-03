# János Barna BAU — website

Landing page for turnkey flat and house renovations, in German (`/`, main language) and Italian (`/it/`).

## Build

Both pages are generated from one template:

```bash
node build.mjs          # writes index.html (DE) and it/index.html (IT)
```

Edit text, styles and layout in `build.mjs`, never in the generated HTML.
Set `SITE_URL` in `build.mjs` once the domain is known (enables canonical + hreflang).

Images in `assets/img/` are produced from the original photos by `python3 prep_assets.py`
(expects the source photos in `Фото/`, which are not in the repository).

## Local preview and checks

```bash
node serve.mjs          # http://localhost:3000
node audit.mjs          # single-word lines, overlaps, overflow on 16 devices × 2 languages
node screenshot.mjs http://localhost:3000
```

`audit.mjs` / `screenshot.mjs` need Puppeteer (`npm i puppeteer`).

## Deploy

Upload `index.html`, `it/`, `assets/`, `send-form.php` to the web root (PHP 7.4+ required for the form).
Then create `config.php` next to `send-form.php` from `config.example.php` with the Telegram bot token and chat id.
Check with `https://<domain>/send-form.php?selftest=1`.
