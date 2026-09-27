// Layout audit: single-word lines, overlapping elements, horizontal overflow.
// Usage: node audit.mjs            (server must be running: node serve.mjs)
//        node audit.mjs --verbose  (print every problem, not just a summary)
import puppeteer from 'puppeteer';

const VERBOSE = process.argv.includes('--verbose');
const PAGES = ['http://localhost:3000/', 'http://localhost:3000/de/'];
const DEVICES = [
  ['iPhone SE (1st)', 320, 568], ['Galaxy S8', 360, 740], ['iPhone SE', 375, 667], ['iPhone 12 mini', 375, 812],
  ['iPhone 14', 390, 844], ['Pixel 7', 393, 851], ['Galaxy S20 Ultra', 412, 915], ['iPhone 11', 414, 896],
  ['iPhone 14 Pro Max', 430, 932], ['Surface Duo', 540, 720], ['iPad mini', 768, 1024], ['iPad Air', 820, 1180],
  ['iPad Pro', 1024, 1366], ['Laptop', 1280, 800], ['MacBook', 1440, 900], ['Full HD', 1920, 1080],
];

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
let total = 0;
for (const [name, w, h] of DEVICES) for (const url of PAGES) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, isMobile: w < 1024, hasTouch: w < 1024 });
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.evaluate(() => document.fonts.ready);
  // settle every animation / reveal so geometry is final
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}.action-bar{display:none!important}' });
  await page.evaluate(() => { document.documentElement.classList.remove('js'); });
  await new Promise(r => setTimeout(r, 150));

  const res = await page.evaluate(() => {
    const visible = el => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; const r = el.getBoundingClientRect(); if (el.closest('details:not([open])') && !el.closest('summary')) return false; return r.width > 0 && r.height > 0 && !el.closest('.sr-only,.hp,[aria-hidden="true"]'); };
    const label = el => { const t = (el.innerText || el.value || el.placeholder || '').trim().replace(/\s+/g, ' '); return `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''} "${t.slice(0, 50)}"`; };

    // 1. single-word lines — examine every text node, group its words by rendered line
    const lonely = [];
    const blocks = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode; if (!n.textContent.trim()) continue;
      let b = n.parentElement; if (!b || ['SCRIPT', 'STYLE', 'OPTION', 'TEXTAREA'].includes(b.tagName)) continue;
      while (b && getComputedStyle(b).display === 'inline' && b.parentElement) b = b.parentElement;
      if (b && visible(b)) blocks.add(b);
    }
    for (const b of blocks) {
      const words = [];
      const tw = document.createTreeWalker(b, NodeFilter.SHOW_TEXT);
      while (tw.nextNode()) {
        const n = tw.currentNode;
        let own = n.parentElement; while (own !== b && getComputedStyle(own).display === 'inline') own = own.parentElement;
        if (own !== b) continue; const re = /[^\s ]+(?: [^\s ]+)*/g; let m;
        while ((m = re.exec(n.textContent))) {
          const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
          const rects = [...rg.getClientRects()].filter(r => r.width > 0);
          if (!rects.length) continue;
          // a nbsp-glued group counts as its real number of words
          const parts = m[0].split(' ');
          if (rects.length === 1) parts.forEach(() => words.push({ top: Math.round(rects[0].top), w: m[0] }));
          else rects.forEach((r, i) => words.push({ top: Math.round(r.top), w: parts[i] || m[0] }));
        }
      }
      // real words only (symbols like "·", "–", "+", "*" do not count as words)
      const real = words.filter(x => /[\p{L}\p{N}]/u.test(x.w));
      if (real.length < 2) continue;
      const lines = new Map();
      for (const x of real) { const k = [...lines.keys()].find(t => Math.abs(t - x.top) < 6) ?? x.top; lines.set(k, [...(lines.get(k) || []), x.w]); }
      if (lines.size < 2) continue;
      for (const [, ws] of lines) if (ws.length === 1) lonely.push(`${label(b)} → lone "${ws[0]}"`);
    }

    // 2. overlaps between text blocks / controls that are not nested in one another
    const items = [...document.querySelectorAll('h1,h2,h3,h4,p,li,a.btn,button,input,select,textarea,label,figcaption,.tag,.live,address,summary,.logo,.lang,.stat,.step-num,.step h3')]
      .filter(visible).filter(el => !el.closest('.mobile-nav'));
    const overlaps = [];
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], c = items[j]; if (a.contains(c) || c.contains(a)) continue;
      const r1 = a.getBoundingClientRect(), r2 = c.getBoundingClientRect();
      const ix = Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left), iy = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top);
      if (ix > 2 && iy > 2) overlaps.push(`${label(a)} ✕ ${label(c)} (${Math.round(ix)}×${Math.round(iy)})`);
    }

    // 3. horizontal overflow + text escaping its own box
    const escapes = [...document.querySelectorAll('h1,h2,h3,h4,p,li,a,button,span,b,figcaption,summary,label')].filter(visible)
      .filter(el => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow === 'visible' && el.clientWidth > 0 && getComputedStyle(el).display !== 'inline')
      .map(el => `${label(el)} content ${el.scrollWidth}px > box ${el.clientWidth}px`);
    return { lonely, overlaps, escapes, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });

  const n = res.lonely.length + res.overlaps.length + res.escapes.length + (res.overflow > 0 ? 1 : 0);
  total += n;
  const tag = `${name} ${w}×${h} ${url.endsWith('/de/') ? 'DE' : 'IT'}`;
  if (!n) console.log(`OK    ${tag}`);
  else {
    console.log(`ISSUE ${tag}: ${res.lonely.length} single-word lines, ${res.overlaps.length} overlaps, ${res.escapes.length} overflowing boxes${res.overflow > 0 ? `, page ${res.overflow}px too wide` : ''}`);
    if (VERBOSE) [...res.lonely, ...res.overlaps, ...res.escapes].forEach(x => console.log('      ' + x));
  }
  await page.close();
}
await browser.close();
console.log(total ? `\n${total} issues` : '\nNo issues on any device.');
