"""Optimize source photos from Фото/ into assets/img as WebP (800w + 1600w)."""
from PIL import Image, ImageOps
import os
SRC = 'Фото'
MAP = {
    'hero': '17.35.34', 'svc-turnkey': '17.35.35', 'svc-bath': '17.35.30',
    'svc-electric': '17.35.27', 'svc-paint': '17.39.50', 'svc-floor': '17.39.56',
    'svc-tiles': '17.39.48', 'svc-plumbing': '17.39.46', 'svc-demolition': '17.35.32',
    'svc-rental': '17.35.02', 'van': '17.39.47', 'benefits': '17.39.49',
    'contact': '17.35.37', 'review-1': '17.39.54', 'review-2': '17.39.53',
    'pf-bath': '17.35.29', 'pf-tub': '17.35.03', 'pf-shower': '17.39.52',
    'pf-electric': '17.35.31', 'pf-plumbing': '17.39.51', 'pf-demolition': '17.35.33', 'pf-progress': '17.35.36',
}
os.makedirs('assets/img', exist_ok=True)
for name, stamp in MAP.items():
    im = ImageOps.exif_transpose(Image.open(f'{SRC}/WhatsApp Image 2026-09-21 at {stamp}.jpeg')).convert('RGB')
    for w in (800, 1600):
        c = im.copy()
        if c.width > w:
            c = c.resize((w, round(c.height * w / c.width)), Image.LANCZOS)
        c.save(f'assets/img/{name}-{w}.webp', 'WEBP', quality=78, method=6)
    print(name, im.size)
