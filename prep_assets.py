"""Build assets/img/*.webp (800w + up to 1600w) and assets/img/manifest.json.

Real job-site photos come from Фото/ (portfolio, company van).
Illustrative photos come from gen/ (generated with gen/generate.sh).
"""
from PIL import Image, ImageOps
import json, os

REAL = {  # output name -> timestamp in the WhatsApp file name
    'van': '17.39.47', 'contact': '17.35.37',
    # project gallery
    'pf-living': '17.35.34', 'pf-room': '17.35.35', 'pf-balcony': '17.35.02',
    'pf-bath': '17.35.29', 'pf-walkin': '17.35.30', 'pf-tub': '17.35.03',
    'pf-floor': '17.39.48', 'pf-laminate': '17.39.56', 'pf-shower': '17.39.52',
    'pf-electric': '17.35.31', 'pf-plumbing': '17.39.51', 'pf-progress': '17.35.36',
    # testimonials
    'review-1': '17.39.49', 'review-2': '17.39.54',
}
GENERATED = [
    'turnkey-start', 'turnkey-end',
    'hero', 'benefits', 'faq', 'step-1', 'step-2', 'step-3',
    'svc-turnkey', 'svc-bath', 'svc-electric', 'svc-paint', 'svc-floor',
    'svc-tiles', 'svc-plumbing', 'svc-demolition', 'svc-rental',
]
OUT = 'assets/img'
os.makedirs(OUT, exist_ok=True)
manifest = {}

def export(name, im, quality):
    im = im.convert('RGB')
    widths = sorted({min(w, im.width) for w in (800, 1600)})
    sizes = []
    for w in widths:
        c = im if w == im.width else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        c.save(f'{OUT}/{name}-{w}.webp', 'WEBP', quality=quality, method=6)
        sizes.append([w, c.height])
    manifest[name] = sizes
    print(name, sizes)

for name, stamp in REAL.items():
    export(name, ImageOps.exif_transpose(Image.open(f'Фото/WhatsApp Image 2026-09-21 at {stamp}.jpeg')), 78)
for name in GENERATED:
    export(name, Image.open(f'gen/{name}.jpg'), 82)

# drop files that are no longer referenced
keep = {f'{n}-{w}.webp' for n, s in manifest.items() for w, _ in s} | {'manifest.json'}
for f in os.listdir(OUT):
    if f not in keep:
        os.remove(f'{OUT}/{f}'); print('removed', f)
json.dump(manifest, open(f'{OUT}/manifest.json', 'w'), indent=1)
