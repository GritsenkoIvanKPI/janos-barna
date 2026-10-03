// Generates index.html (Italian) and de/index.html (German) from one template.
// Run: node build.mjs
import fs from 'fs';

// real pixel sizes of every image (written by prep_assets.py)
const IMAGES = JSON.parse(fs.readFileSync('assets/img/manifest.json', 'utf8'));

// Set the production domain once it is known — enables canonical + hreflang.
const SITE_URL = '';

const NB = '\u00a0';
// Keep every line at 2+ words: phrases of up to 3 words never break; longer texts
// keep their first two and last two words together (no lone first/last word).
// <br> splits a string into independently handled lines.
function glue(str) {
  str = String(str).replace(/\b([Ee])-([Mm]ail)/g, '$1\u2011$2');
  const isWord = x => /[\p{L}\p{N}]/u.test(x);
  return String(str).split(/(<br>)/).map(seg => {
    if (seg === '<br>') return seg;
    const w = seg.split(' ').filter(Boolean);
    const n = w.filter(isWord).length;
    if (n <= 3) return w.join(NB);
    if (true) {
      // chunks of two words (first chunk takes the odd one); punctuation rides along
      const chunks = []; let cur = [], cnt = 0, size = n % 2 ? 3 : 2;
      for (const x of w) {
        cur.push(x); if (isWord(x)) cnt++;
        if (cnt === size) { chunks.push(cur); cur = []; cnt = 0; size = 2; }
      }
      if (cur.length) { if (chunks.length && cnt === 0) chunks[chunks.length - 1].push(...cur); else chunks.push(cur); }
      return chunks.map(c => c.join(NB)).join(' ');
    }
    let i = 0, c = 0;
    while (i < w.length && c < 2) { if (isWord(w[i])) c++; i++; }
    while (i < w.length && !isWord(w[i])) i++;
    let j = w.length, d = 0;
    while (j > i && d < 2) { j--; if (isWord(w[j])) d++; }
    while (j > i && !isWord(w[j - 1])) j--;
    // middle: short words (≤3 letters: für, ein, und, di, la …) stick to the next word
    const mid = [];
    const midW = w.slice(i, j);
    midW.forEach((x, k) => {
      const next = midW[k + 1] || '';
      if (mid.length && mid[mid.length - 1].endsWith('\u0001')) mid[mid.length - 1] = mid[mid.length - 1].slice(0, -1) + NB + x;
      else mid.push(x);
      if (x.replace(/[^\p{L}]/gu, '').length <= 3 && /[\p{L}]$/u.test(x) && next.replace(/[^\p{L}]/gu, '').length >= 10) mid[mid.length - 1] += '\u0001';
    });
    const midOut = mid.map(x => x.replace('\u0001', ''));
    const tail = w.slice(j).join(NB);
    // a short word right before the tail joins the tail
    if (midOut.length && /^[\p{L}]{1,3}$/u.test(midOut[midOut.length - 1]) && tail.replace(/[^\p{L}]/gu, '').length >= 10) return [w.slice(0, i).join(NB), ...midOut.slice(0, -1), midOut[midOut.length - 1] + NB + tail].filter(Boolean).join(' ');
    return [w.slice(0, i).join(NB), ...midOut, tail].filter(Boolean).join(' ');
  }).join('');
}
const keep = str => String(str).replace(/ /g, NB); // never break (numbers, addresses)
const PHONE = '+49 1521 3405131';
const PHONE_HREF = 'tel:+4915213405131';
const WA = '4915213405131';
// Work mobile as printed on the company van (the sign mock-up shows 792876 — confirm with client).
const PHONE2 = '+49 162 7928876';
const PHONE2_HREF = 'tel:+491627928876';
const EMAIL = 'janos.barna.bau@gmail.com';

/* ---------------- icons (24px line set) ---------------- */
const ICONS = {
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
  bath: '<path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.68 3 4 3.68 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="m10 5-2 2"/><path d="M2 12h20"/><path d="M7 19v2"/><path d="M17 19v2"/>',
  bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  roller: '<rect x="2" y="2" width="16" height="6" rx="2"/><path d="M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="8" y="16" width="4" height="6" rx="1"/>',
  layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  tiles: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18"/><path d="M12 3v18"/>',
  drop: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  hammer: '<path d="m15 12-8.37 8.37a2.12 2.12 0 1 1-3-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.91-1.91A2 2 0 0 1 19 8.17V7l-2.26-1.13A6 6 0 0 0 14.1 5H13l.5 1.5L12 9"/>',
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9"/><path d="M10 21v-6h4v6"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  whatsapp: '<path d="M3 21l1.65-4.8A8.5 8.5 0 1 1 7.8 19.4Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.4-1.9-.9-.8.8a4 4 0 0 1-2.4-2.4l.8-.8-.9-1.9Z"/>',
  receipt: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  usercheck: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
};
const icon = (name, cls = 'icon') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

/* ---------------- styles ---------------- */
const CSS = `
:root{
  /* palette sampled from the company sign: charcoal plate, champagne gold, brushed silver */
  --bg:#161615; --bg-2:#1E1E1D; --bg-3:#282827; --charcoal:#2A2A29;
  --line:rgba(236,228,208,.09); --line-2:rgba(236,228,208,.17);
  --gold:#C8AE7A; --gold-hi:#E9D7AD; --gold-lo:#8A6F48; --gold-text:#D8C08F;
  --silver:#C0C2C3; --silver-hi:#EEEFEF;
  --title:#F3F1EB; --text:#A9AAA7; --text-light:rgba(243,241,235,.74);
  --metal-gold:linear-gradient(135deg,#F0DFB6 0%,#CDB27C 34%,#A38450 62%,#E2CB99 100%);
  --metal-silver:linear-gradient(180deg,#FBFBFB 0%,#D2D4D6 48%,#9C9FA3 100%);
  --r-lg:24px; --r-md:16px; --r-sm:10px;
  --s-1:4px; --s-2:8px; --s-3:12px; --s-4:16px; --s-5:24px; --s-6:32px; --s-7:48px; --s-8:64px; --s-9:96px;
  --section:96px; --gutter:20px; --edge:12px; --header:84px;
  --serif:Cinzel,"Trajan Pro",Georgia,serif;
  --fs-h1:clamp(23px,7.4vw,62px); --fs-h2:clamp(28px,3.7vw,54px); --fs-h3:clamp(21px,1.8vw,25px);
  --ease-spring:cubic-bezier(.34,1.56,.64,1); --ease-out:cubic-bezier(.22,1,.36,1);
  --sh-float:0 1px 2px rgba(0,0,0,.3),0 10px 24px -10px rgba(0,0,0,.55),0 30px 60px -30px rgba(0,0,0,.7);
  --sh-gold:0 1px 2px rgba(60,44,16,.4),0 12px 28px -12px rgba(200,174,122,.55);
  --grain:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
}
@media (min-width:768px){:root{--section:128px;--gutter:32px;--edge:24px}}
@media (min-width:1200px){:root{--section:160px;--gutter:100px;--edge:32px;--header:110px}}

*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;scroll-padding-top:calc(var(--header) + 16px);background:var(--bg)}
body{margin:0;background:radial-gradient(1200px 700px at 85% -10%,rgba(200,174,122,.07),rgba(200,174,122,0) 70%),radial-gradient(900px 600px at -10% 40%,rgba(192,194,195,.04),rgba(192,194,195,0) 70%),var(--bg);
  color:var(--text);font-family:Onest,system-ui,sans-serif;font-size:16px;line-height:1.7;font-weight:400;-webkit-font-smoothing:antialiased;overflow-x:hidden}
body::before{content:"";position:fixed;inset:0;background-image:var(--grain);opacity:.045;pointer-events:none;z-index:100;mix-blend-mode:overlay}
@media (min-width:768px){body{font-size:18px}}
img,video{display:block;max-width:100%}
a{color:inherit;text-decoration:none}
h1,h2,h3,h4{margin:0;color:var(--title);font-family:var(--serif);font-weight:600;letter-spacing:-.01em}
p{margin:0}
button,input,select,textarea{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--gold-hi);outline-offset:3px}
::selection{background:var(--gold);color:var(--bg)}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.svg-defs{position:absolute;width:0;height:0;overflow:hidden}

.container{width:100%;max-width:calc(1240px + var(--gutter)*2);margin:0 auto;padding:0 var(--gutter)}
.wide{width:calc(100% - var(--gutter) * 2);max-width:1240px;margin-left:auto;margin-right:auto}
.section{padding-top:var(--section)}
.tag{display:inline-flex;align-items:center;gap:var(--s-3);font-size:13px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--gold-text)}
.tag::before{content:"";width:32px;height:1px;background:linear-gradient(90deg,rgba(200,174,122,0),var(--gold))}
.center .tag::after{content:"";width:32px;height:1px;background:linear-gradient(90deg,var(--gold),rgba(200,174,122,0))}
@media (min-width:768px){.tag{font-size:14px}}
.h2{font-size:var(--fs-h2);line-height:1.14;margin-top:var(--s-5)}
.lead{margin-top:var(--s-5);max-width:540px}
.center{text-align:center}
.center .lead{margin-left:auto;margin-right:auto}

/* media treatment */
.media{position:relative;overflow:hidden;background:var(--bg-3)}
.media img,.media video{width:100%;height:100%;object-fit:cover;filter:saturate(.94) contrast(1.02)}
.media::before{content:"";position:absolute;inset:0;background:#3a2f1c;mix-blend-mode:multiply;opacity:.1;z-index:1;pointer-events:none}
.media::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(10,10,9,.6),rgba(10,10,9,0) 55%);z-index:1;pointer-events:none;opacity:.5}
.media--dark::after{opacity:1}

.grain{position:relative;isolation:isolate}
.grain::before{content:"";position:absolute;inset:0;background-image:var(--grain);opacity:.08;mix-blend-mode:overlay;pointer-events:none;z-index:0;border-radius:inherit}

/* inverted corners: a page-coloured surface cutting into a rounded photo */
.corner{position:absolute;width:var(--r-lg);height:var(--r-lg);z-index:3;pointer-events:none;
  background:radial-gradient(circle at var(--cx) var(--cy),transparent calc(var(--r-lg) - .5px),var(--bg) var(--r-lg))}
.corner--tl{--cx:0;--cy:0}
.corner--tr{--cx:100%;--cy:0}
.corner--bl{--cx:0;--cy:100%}
.corner--br{--cx:100%;--cy:100%}

/* buttons */
.btn{--h:54px;display:inline-flex;align-items:center;gap:var(--s-3);height:var(--h);padding:0 10px 0 22px;border-radius:999px;border:0;cursor:pointer;
  font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;
  transition:transform .45s var(--ease-spring),box-shadow .3s var(--ease-out),opacity .2s}
@media (min-width:768px){.btn{--h:60px;font-size:15px;padding:0 12px 0 26px}}
.btn .btn-dot{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;transition:transform .45s var(--ease-spring)}
.btn .btn-dot svg{width:18px;height:18px;stroke-width:2.25}
.btn:hover{transform:translateY(-2px)}
.btn:hover .btn-dot{transform:translateX(3px)}
.btn:active{transform:translateY(0) scale(.97)}
.btn--gold{background:var(--metal-gold);background-size:140% 140%;color:#171613;box-shadow:var(--sh-gold),inset 0 1px 0 rgba(255,255,255,.45)}
.btn--gold .btn-dot{background:#171613;color:var(--gold-hi)}
.btn--gold:hover{box-shadow:0 1px 2px rgba(60,44,16,.4),0 18px 36px -12px rgba(200,174,122,.7),inset 0 1px 0 rgba(255,255,255,.55)}
.btn--outline{background:transparent;color:var(--title);border:1px solid var(--line-2);padding:0 26px}
.btn--outline:hover{border-color:var(--gold)}
.btn--outline .icon{width:20px;height:20px;color:var(--gold)}
.btn-row{display:flex;flex-wrap:wrap;gap:var(--s-4)}

/* logo (artwork: assets/logo, cut from logo.png) */
.logo{display:inline-flex;flex:none;align-items:center;gap:10px;border-radius:12px;transition:transform .45s var(--ease-spring)}
.logo:hover{transform:translateY(-1px)}
.logo:active{transform:scale(.97)}
.logo img{display:block;width:auto}
.logo-emblem{height:52px;filter:drop-shadow(0 4px 14px rgba(200,174,122,.22))}
.logo-word{height:37px}
.logo-full{height:190px;filter:drop-shadow(0 10px 30px rgba(200,174,122,.18))}
@media (max-width:479px){
  .header .container{gap:var(--s-3)}
  .header .logo{gap:6px}
  .header .logo-emblem{height:34px}
  .header .logo-word{height:24px}
  .header-actions{gap:var(--s-2)}
  .lang a{min-width:32px;height:30px}
  .burger{width:42px;height:42px}
}

/* header */
.header{position:sticky;top:0;z-index:50}
.header::before{content:"";position:absolute;inset:0;z-index:-1;background:rgba(22,22,21,.78);backdrop-filter:blur(16px) saturate(1.2);-webkit-backdrop-filter:blur(16px) saturate(1.2);border-bottom:1px solid var(--line);opacity:0;transition:opacity .35s var(--ease-out)}
.scrolled .header::before{opacity:1}
@media (max-height:520px){.header{position:relative}}
.header .container{display:flex;align-items:center;justify-content:space-between;height:var(--header);gap:var(--s-5)}
.nav{display:none}
.nav a{position:relative;white-space:nowrap;font-size:14px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--silver);padding:var(--s-2) 0;transition:color .2s}
.nav a::after{content:"";position:absolute;left:0;right:0;bottom:2px;height:1px;background:var(--gold);transform:scaleX(0);transform-origin:left;transition:transform .35s var(--ease-out)}
.nav a:hover,.nav a:focus-visible{color:var(--title)}
.nav a:hover::after,.nav a:focus-visible::after{transform:scaleX(1)}
.nav a:active{opacity:.7}
.header-actions{display:flex;align-items:center;gap:var(--s-4)}
.header-actions .btn{display:none}
.lang{display:inline-flex;padding:4px;border-radius:999px;background:var(--bg-2);border:1px solid var(--line)}
.lang a{display:grid;place-items:center;min-width:38px;height:32px;padding:0 var(--s-2);border-radius:999px;font-size:12px;font-weight:700;letter-spacing:.1em;color:var(--text);transition:transform .35s var(--ease-spring),color .2s}
.lang a:hover{color:var(--title)}
.lang a:active{transform:scale(.94)}
.lang a[aria-current]{background:var(--metal-gold);color:#171613}
.burger{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;border:1px solid var(--line-2);background:var(--bg-2);color:var(--title);cursor:pointer;transition:transform .35s var(--ease-spring),border-color .2s}
.burger:hover{border-color:var(--gold)}
.burger:active{transform:scale(.94)}
.burger .icon{width:22px;height:22px}
.burger .icon-close{display:none}
.menu-open .burger .icon-open{display:none}
.menu-open .burger .icon-close{display:block}
.mobile-nav{position:absolute;left:var(--s-3);right:var(--s-3);top:var(--header);padding:var(--s-4);border-radius:var(--r-md);background:var(--bg-3);box-shadow:var(--sh-float);border:1px solid var(--line-2);
  display:grid;gap:2px;opacity:0;transform:translateY(-8px);pointer-events:none;transition:opacity .25s var(--ease-out),transform .35s var(--ease-out)}
.menu-open .mobile-nav{opacity:1;transform:none;pointer-events:auto}
.mobile-nav a:not(.btn){padding:var(--s-3) var(--s-4);border-radius:var(--r-sm);font-weight:600;color:var(--title);text-transform:uppercase;letter-spacing:.12em;font-size:14px;transition:background-color .2s}
.mobile-nav a:not(.btn):hover,.mobile-nav a:not(.btn):focus-visible{background:rgba(255,255,255,.04)}
.mobile-nav a:not(.btn):active{background:rgba(255,255,255,.08)}
.mobile-nav .btn{margin-top:var(--s-3)}
@media (max-width:359px){
  .header .container{gap:var(--s-3);padding:0 var(--s-4)}
  .header-actions{gap:var(--s-2)}
  .header .logo-emblem{height:30px}
  .header .logo-word{height:21px}
  .header .logo{gap:4px}
  .lang a{min-width:30px}
  .burger{width:40px;height:40px}
}
@media (min-width:1024px){.header-actions .btn{display:inline-flex}}
@media (min-width:1360px){
  .nav{display:flex;gap:28px}
  .burger,.mobile-nav{display:none}
}

/* hero */
/* first screen: header + hero (+ quick-quote card) always fit the viewport height */
.hero{position:relative;display:flex;flex-direction:column;gap:var(--s-3);
  height:calc(100vh - var(--header) - var(--s-3));height:calc(100svh - var(--header) - var(--s-3));min-height:460px}
.hero-media{position:relative;flex:1 1 auto;min-height:0;border-radius:var(--r-lg)}
.hero-media img{object-position:50% 62%}
.hero-media::after{background:linear-gradient(to top,rgba(12,12,11,.86),rgba(12,12,11,.12) 58%,rgba(12,12,11,0)),linear-gradient(to right,rgba(12,12,11,.4),rgba(12,12,11,0) 55%)}
.hero-content{position:absolute;z-index:2;left:0;right:0;bottom:0;padding:var(--s-5);max-width:800px}
@media (min-width:768px){.hero-content{padding:var(--s-7)}}
.hero h1{font-size:min(var(--fs-h1),7.2vh);font-size:min(var(--fs-h1),7.2svh);line-height:1.1;color:var(--title);letter-spacing:-.01em;text-shadow:0 2px 30px rgba(0,0,0,.35)}
.hero h1 em{font-style:normal;background:var(--metal-gold);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero-content p{margin-top:var(--s-4);color:rgba(243,241,235,.86);max-width:520px}
.hero-content .btn{margin-top:var(--s-5)}
.book{position:relative;z-index:4;flex:none;margin:0;padding:var(--s-5);border-radius:var(--r-lg);background:var(--bg-2);border:1px solid var(--line)}
.book .corner{display:none}
.book h2{font-size:clamp(22px,2.3vw,32px);line-height:1.2}
.book > p{margin-top:var(--s-3)}
@media (min-width:1360px){
  .hero{display:block;gap:0;min-height:460px}
  .hero-media{height:100%;border-bottom-right-radius:0}
  .hero-content{left:64px;right:564px;padding:0 0 56px}
  .book{position:absolute;right:0;bottom:0;width:500px;padding:48px 56px 20px;border:0;border-radius:var(--r-lg) 0 0 0;background:var(--bg)}
  .book .corner{display:block}
  .book .corner--tl{top:calc(var(--r-lg) * -1);right:0}
  .book .corner--tl.b{top:auto;bottom:0;right:auto;left:calc(var(--r-lg) * -1)}
}
.quick{position:relative;margin-top:var(--s-5);display:flex;align-items:center;height:64px;padding:0 6px 0 var(--s-5);border-radius:999px;background:var(--bg-3);border:1px solid var(--line);transition:border-color .2s}
.quick:focus-within{border-color:var(--gold)}
.quick input{flex:1;min-width:0;height:100%;border:0;background:none;outline:none;font-size:17px;color:var(--title)}
.quick input::placeholder{color:#7D7E7B}
.quick button{display:grid;place-items:center;width:52px;height:52px;flex:none;border-radius:50%;border:0;background:var(--metal-gold);color:#171613;cursor:pointer;box-shadow:var(--sh-gold);transition:transform .45s var(--ease-spring)}
.quick button svg{width:22px;height:22px;stroke-width:2.25}
.quick button:hover{transform:translateX(2px) scale(1.04)}
.quick button:active{transform:scale(.94)}
.quick-note{margin-top:var(--s-3);font-size:13px;line-height:1.5;color:#7D7E7B}
/* shorter screens: drop secondary lines so the whole first screen stays visible */
@media (max-width:1359px){.book > p{display:none}}
@media (max-width:1359px) and (max-height:820px){.hero-content .btn{display:none}}
@media (max-height:560px){.hero{min-height:360px}}
@media (max-height:760px){.hero-tag{display:none}}
@media (max-height:700px){.hero-content p{display:none}.quick-note{font-size:12px;line-height:1.4;margin-top:var(--s-2)}.quick{margin-top:var(--s-3)}}
@media (min-width:1360px) and (max-height:760px){.book{padding-top:36px}.book > p{display:none}}
/* short landscape phones: photo and quick-quote side by side */
@media (orientation:landscape) and (max-height:540px) and (max-width:1359px){
  :root{--header:64px}
  .hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,38%);min-height:220px}
  .hero-media{height:auto}
  .book{align-self:stretch;display:flex;flex-direction:column;justify-content:center;padding:var(--s-4) var(--s-5)}
  .hero h1{font-size:min(var(--fs-h1),9svh)}
}
.form-status{margin-top:var(--s-3);font-size:15px;font-weight:600}
.form-status[data-state="ok"]{color:#8FD19E}
.form-status[data-state="error"]{color:#F09A8E}

/* trust bar */
.trust{list-style:none;margin:var(--s-5) 0 0;padding:var(--s-4) 0;display:grid;gap:var(--s-3) var(--s-5);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
@media (min-width:640px){.trust{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (min-width:1360px){.trust{grid-template-columns:auto auto auto auto;justify-content:space-between}}
.trust li{display:flex;align-items:center;gap:var(--s-3);font-size:14px;font-weight:500;letter-spacing:.02em;color:var(--silver);line-height:1.4}
.trust li b{font-family:var(--serif);font-size:22px;font-weight:600;line-height:1;background:var(--metal-gold);-webkit-background-clip:text;background-clip:text;color:transparent}
.trust .icon{flex:none;width:18px;height:18px;color:var(--gold)}

/* turnkey chain */
.turnkey{display:grid;gap:var(--s-5);margin-top:var(--s-7);align-items:stretch}
@media (min-width:560px){.turnkey{grid-template-columns:repeat(2,minmax(0,1fr))}.stages{grid-column:1/-1;grid-row:2}}
@media (min-width:1360px){.turnkey{grid-template-columns:280px minmax(0,1fr) 280px;margin-top:var(--s-8)}.stages{grid-column:auto;grid-row:auto}}
.turnkey-img{position:relative;margin:0;border-radius:var(--r-lg);aspect-ratio:16/10;box-shadow:var(--sh-float)}
@media (min-width:560px){.turnkey-img{aspect-ratio:4/3}}
@media (min-width:1360px){.turnkey-img{aspect-ratio:auto;min-height:420px}}
.turnkey-img img{position:absolute;inset:0}
@media (max-width:1359px){.turnkey-img img{object-position:30% 22%}}
.hero-tag{display:flex;margin-bottom:var(--s-4)}
.turnkey-img.media::after{opacity:1}
.turnkey-img figcaption{position:absolute;z-index:2;left:var(--s-5);right:var(--s-5);bottom:var(--s-5)}
.turnkey-img figcaption span{display:block;font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-text)}
.turnkey-img figcaption b{display:block;margin-top:var(--s-1);font-family:var(--serif);font-weight:600;font-size:22px;color:var(--title)}
.stages{list-style:none;margin:0;padding:0;display:grid;gap:var(--s-3);align-content:center}
@media (min-width:700px){.stages{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (min-width:1024px) and (max-width:1359px){.stages{grid-template-columns:repeat(4,minmax(0,1fr))}.stage{flex-direction:column;align-items:flex-start;gap:var(--s-2)}}
.stage{display:flex;align-items:center;gap:var(--s-4);padding:var(--s-4);border-radius:var(--r-md);background:var(--bg-2);border:1px solid var(--line);transition:transform .45s var(--ease-spring),border-color .3s}
.stage:hover{transform:translateY(-3px);border-color:rgba(200,174,122,.4)}
.stage-num{flex:none;font-family:var(--serif);font-weight:600;font-size:26px;line-height:1;min-width:1.5em;background:var(--metal-gold);-webkit-background-clip:text;background-clip:text;color:transparent}
.stage > div{min-width:0}
.stage b{display:block;color:var(--title);font-weight:600;font-size:16px;line-height:1.3}
.stage div span{display:block;font-size:14px;line-height:1.4}
.stage--final{background:radial-gradient(120% 140% at 0% 0%,rgba(200,174,122,.2),rgba(200,174,122,0) 70%),var(--bg-2);border-color:rgba(200,174,122,.45)}
.turnkey-facts{list-style:none;margin:var(--s-6) 0 0;padding:0;display:grid;gap:var(--s-3)}
@media (min-width:1024px){.turnkey-facts{grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s-5)}}
.turnkey-facts li{display:flex;align-items:center;gap:var(--s-3);padding:var(--s-4) var(--s-5);border-radius:var(--r-md);border:1px solid var(--line-2);color:var(--title);font-size:15px;font-weight:500;line-height:1.35}
.turnkey-facts .icon{flex:none;width:20px;height:20px;color:var(--gold)}

/* section heads */
.head-split{display:grid;gap:var(--s-6);padding-bottom:var(--s-7);border-bottom:1px solid var(--line)}
@media (min-width:1024px){.head-split{grid-template-columns:1fr auto;align-items:end;gap:var(--s-7)}}
.head-split .h2{max-width:680px}

/* services */
.cards{display:grid;gap:var(--s-8) var(--s-6);margin-top:var(--s-7)}
@media (min-width:640px){.cards{grid-template-columns:repeat(2,1fr)}}
@media (min-width:1024px){
  .cards{grid-template-columns:repeat(3,1fr);gap:var(--s-9) var(--s-7);margin-top:var(--s-8)}
}
.card{display:flex;flex-direction:column;align-items:flex-start;border-radius:var(--r-md)}
.card .media{align-self:stretch}
.card .media{aspect-ratio:4/3;border-radius:var(--r-md);box-shadow:var(--sh-float)}
@media (min-width:640px){.card .media{aspect-ratio:1/1}}
.card .media img{transition:transform .9s var(--ease-out)}
.card:hover .media img{transform:scale(1.045)}
.card{container-type:inline-size}
.card h3{margin-top:var(--s-6);font-size:clamp(17px,6.3cqi,25px);line-height:1.25;white-space:nowrap}
.card p{margin-top:var(--s-3);margin-bottom:var(--s-5)}
.card .icon{width:22px;height:22px}
.card .icon-chip{display:inline-grid;place-items:center;margin-top:auto;width:46px;height:46px;border-radius:50%;background:rgba(200,174,122,.1);border:1px solid rgba(200,174,122,.28);color:var(--gold);transition:transform .45s var(--ease-spring)}
.card:hover .icon-chip{transform:rotate(-8deg) scale(1.08)}

/* portfolio: bento gallery of real project photos + lightbox */
.works{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:150px;grid-auto-flow:dense;gap:var(--s-3);margin-top:var(--s-7)}
@media (min-width:640px){.works{grid-auto-rows:220px;gap:var(--s-4)}}
@media (min-width:1024px){.works{grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:230px;gap:var(--s-5);margin-top:var(--s-8)}}
.work{position:relative;display:block;border-radius:var(--r-md);box-shadow:var(--sh-float);cursor:zoom-in;container-type:inline-size}
.work--tall{grid-row:span 2}
.work--wide{grid-column:span 2}
.work--big{grid-column:span 2;grid-row:span 2}
.work.media::after{opacity:.85;background:linear-gradient(to top,rgba(10,10,9,.85),rgba(10,10,9,0) 50%)}
.work img{transition:transform .9s var(--ease-out)}
.work:hover img,.work:focus-visible img{transform:scale(1.05)}
.work:active img{transform:scale(1.02)}
.work-cap{position:absolute;z-index:2;left:0;right:0;bottom:0;padding:var(--s-4)}
@media (min-width:1024px){.work-cap{padding:var(--s-5)}}
.work-cap b{display:block;color:var(--title);font-family:var(--serif);font-size:clamp(12px,5.6cqi,19px);font-weight:600;line-height:1.25;white-space:nowrap}
.work-cap span{display:block;margin-top:2px;color:var(--gold-text);font-size:clamp(11px,4.6cqi,14px);letter-spacing:.03em;white-space:nowrap}
.work--wide .work-cap b,.work--big .work-cap b{font-size:clamp(14px,4.4cqi,22px)}
.work--wide .work-cap span,.work--big .work-cap span{font-size:clamp(11px,3.2cqi,14px)}
@container (max-width:215px){.work-cap{display:none}.work.media::after{opacity:.25}}
.work-zoom{position:absolute;z-index:2;top:var(--s-4);right:var(--s-4);display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:rgba(22,22,21,.6);border:1px solid var(--line-2);color:var(--gold-hi);backdrop-filter:blur(8px);opacity:0;transform:scale(.7);transition:opacity .3s var(--ease-out),transform .45s var(--ease-spring)}
.work-zoom .icon{width:18px;height:18px}
.work:hover .work-zoom,.work:focus-visible .work-zoom{opacity:1;transform:none}
.work .live{position:absolute;z-index:2;top:var(--s-3);left:var(--s-3);display:inline-flex;align-items:center;gap:var(--s-2);padding:5px 10px;border-radius:999px;background:rgba(22,22,21,.72);border:1px solid var(--line-2);color:var(--title);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;backdrop-filter:blur(8px)}
.work .live::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--gold);animation:pulse 1.8s var(--ease-out) infinite}
@keyframes pulse{0%{transform:scale(.8);opacity:1}70%{transform:scale(1.5);opacity:.35}100%{transform:scale(.8);opacity:1}}
.lightbox{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;background:rgba(10,10,9,.94);color:var(--title)}
.lightbox::backdrop{background:rgba(10,10,9,.6)}
.lightbox:not([open]){display:none}
.lightbox-stage{position:absolute;inset:64px var(--s-4) 76px;display:grid;place-items:center}
@media (min-width:768px){.lightbox-stage{inset:72px 96px 84px}}
.lightbox-stage img{position:absolute;inset:0;margin:auto;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;border-radius:var(--r-sm);box-shadow:0 30px 80px -20px rgba(0,0,0,.9);animation:lb-in .45s var(--ease-out)}
@keyframes lb-in{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
.lightbox-bar{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;gap:var(--s-4);height:76px;padding:0 var(--s-4);text-align:center}
.lightbox-title{font-family:var(--serif);font-size:17px}
.lightbox-count{font-size:13px;letter-spacing:.14em;color:var(--gold-text)}
.lightbox button{position:absolute;z-index:2;display:grid;place-items:center;width:48px;height:48px;border-radius:50%;border:1px solid var(--line-2);background:rgba(30,30,29,.8);color:var(--title);cursor:pointer;transition:transform .35s var(--ease-spring),border-color .2s}
.lightbox button:hover{border-color:var(--gold);transform:scale(1.06)}
.lightbox button:active{transform:scale(.94)}
.lightbox button .icon{width:22px;height:22px}
.lb-close{top:var(--s-3);right:var(--s-3)}
.lb-prev,.lb-next{bottom:14px}
.lb-prev{left:var(--s-3)}.lb-next{right:var(--s-3)}
.lb-prev .icon{transform:rotate(180deg)}
@media (min-width:768px){.lb-prev,.lb-next{top:50%;bottom:auto;margin-top:-24px}.lb-prev{left:var(--s-5)}.lb-next{right:var(--s-5)}.lb-close{top:var(--s-4);right:var(--s-5)}}
.sites{margin-top:var(--s-8);padding:var(--s-5) var(--s-4);border-radius:var(--r-lg);background:var(--bg-2);border:1px solid var(--line)}
@media (min-width:768px){.sites{padding:var(--s-7)}}
.sites h3{font-size:22px}
.sites ul{list-style:none;margin:var(--s-5) 0 0;padding:0;display:grid;grid-template-columns:minmax(0,1fr);gap:var(--s-3)}
.sites li > div{min-width:0}
@media (min-width:640px){.sites ul{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (min-width:1200px){.sites ul{grid-template-columns:repeat(3,minmax(0,1fr))}}
.sites li{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:var(--s-3);row-gap:var(--s-2);align-items:center;padding:var(--s-4);border-radius:var(--r-md);background:var(--bg-3);border:1px solid var(--line);box-shadow:0 1px 2px rgba(0,0,0,.25),0 10px 22px -16px rgba(0,0,0,.6)}
.sites li .icon{flex:none;width:22px;height:22px;color:var(--gold)}
.sites li b{display:block;color:var(--title);font-weight:600;font-size:16px;line-height:1.3}
.sites li span{display:block;font-size:14px;line-height:1.4}
.sites li em{grid-column:2;justify-self:start;flex:none;font-style:normal;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:5px 10px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid var(--line-2);color:var(--silver)}
.sites li em.is-live{background:var(--metal-gold);border-color:transparent;color:#171613}

/* why us (CTA) */
.why{display:grid;grid-template-columns:minmax(0,1fr);gap:var(--s-5)}
@media (min-width:1024px){.why{grid-template-columns:1fr 1fr}}
.why-card{border-radius:var(--r-lg);border:1px solid var(--line);
  background:radial-gradient(90% 70% at 100% 0%,rgba(200,174,122,.16) 0%,rgba(200,174,122,0) 60%),radial-gradient(80% 60% at 0% 100%,rgba(192,194,195,.07) 0%,rgba(192,194,195,0) 60%),var(--bg-2);
  padding:var(--s-7) var(--s-5);display:flex;flex-direction:column;justify-content:space-between;gap:var(--s-8);min-height:560px;box-shadow:var(--sh-float)}
@media (min-width:768px){.why-card{padding:60px}}
@media (min-width:1200px){.why-card{min-height:676px}}
.why-card > *{position:relative;z-index:1}
.why-card p{margin-top:var(--s-5);color:var(--text-light);max-width:520px}
.stats{display:grid;grid-template-columns:1fr;gap:var(--s-5);padding-top:var(--s-6);border-top:1px solid var(--line)}
.stat{display:flex;align-items:baseline;gap:var(--s-4)}
.stat b{display:block;min-width:2.2em;font-family:var(--serif);font-size:clamp(38px,4.2vw,60px);font-weight:600;color:var(--title);line-height:1}
.stat b em{font-style:normal;background:var(--metal-gold);-webkit-background-clip:text;background-clip:text;color:transparent}
.stat span{display:block;white-space:nowrap;margin-top:var(--s-3);color:var(--text);font-size:15px;line-height:1.35;max-width:150px}
@media (min-width:768px){.stat span{font-size:17px}}
.stat span{margin-top:0}
@media (min-width:1360px){.stats{grid-template-columns:repeat(3,auto);justify-content:space-between}.stat{display:block}.stat b{min-width:0}.stat span{margin-top:var(--s-3)}}
.why-photo{position:relative;border-radius:var(--r-lg);min-height:480px}
.why-photo img{position:absolute;inset:0;object-position:50% 40%}
.why-notch{position:absolute;z-index:3;left:0;bottom:0;padding:var(--s-6) var(--s-5) 0 0;background:var(--bg);border-top-right-radius:var(--r-lg)}
.why-notch .corner--tr{top:calc(var(--r-lg) * -1);left:0}
.why-notch .corner--tr.b{top:auto;bottom:0;left:auto;right:calc(var(--r-lg) * -1)}

/* benefits */
.benefits{position:relative;margin-top:var(--s-7)}
.benefits-media{position:relative;border-radius:var(--r-lg);height:clamp(260px,48vw,580px)}
.benefits-media img{object-position:50% 45%}
.features{display:grid;gap:var(--s-4);margin-top:var(--s-4)}
@media (min-width:1024px){.features{grid-template-columns:repeat(3,minmax(0,1fr))}.feature{flex-direction:column;gap:var(--s-3)}}
@media (min-width:1360px){
  .features{position:absolute;z-index:2;left:30px;right:30px;bottom:30px;margin:0;gap:var(--s-5)}
  .feature{flex-direction:row;gap:var(--s-4)}
}
.feature{display:flex;gap:var(--s-4);padding:var(--s-5);border-radius:var(--r-md);background:var(--bg-2);border:1px solid var(--line)}
@media (min-width:1360px){.feature{background:rgba(22,22,21,.8);border-color:var(--line-2);backdrop-filter:blur(14px);box-shadow:var(--sh-float);padding:32px 22px}}
.feature .ic{display:grid;place-items:center;flex:none;width:52px;height:52px;border-radius:50%;background:var(--metal-gold);color:#171613;box-shadow:var(--sh-gold)}
.feature .ic .icon{width:24px;height:24px}
.feature h3{font-size:18px;line-height:1.3}
.feature p{margin-top:var(--s-2);font-size:16px;line-height:1.55}
.cta-center{display:flex;justify-content:center;margin-top:var(--s-7)}

/* about / process: video card + numbered step cards */
.process{display:grid;gap:var(--s-7);margin-top:var(--s-7);align-items:center}
@media (min-width:1024px){.process{grid-template-columns:400px minmax(0,1fr);gap:var(--s-8);margin-top:var(--s-8)}}
.process-video{position:relative;margin:0 auto;width:100%;max-width:400px}
.process-frame{position:relative;aspect-ratio:4/5;border-radius:var(--r-lg);border:1px solid rgba(200,174,122,.35);
  box-shadow:0 0 0 6px rgba(200,174,122,.06),0 30px 60px -24px rgba(0,0,0,.75),0 0 90px -30px rgba(200,174,122,.35)}
.process-frame video{position:absolute;inset:0}
@media (max-width:639px){.process-frame{aspect-ratio:1/1}}
.process-frame .live{position:absolute;z-index:2;top:var(--s-4);left:var(--s-4);display:inline-flex;align-items:center;gap:var(--s-2);padding:6px 12px;border-radius:999px;background:rgba(22,22,21,.72);border:1px solid var(--line-2);color:var(--title);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;backdrop-filter:blur(8px)}
.process-frame .live::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--gold);animation:pulse 1.8s var(--ease-out) infinite}
.process-frame{container-type:inline-size}
.process-frame figcaption{position:absolute;z-index:2;left:var(--s-5);right:var(--s-5);bottom:var(--s-5);font-family:var(--serif);font-size:clamp(14px,5.4cqi,20px);color:var(--title)}
.steps{list-style:none;margin:0;padding:0;display:grid;gap:var(--s-4);counter-reset:none}
.step{position:relative;display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--s-5);align-items:center;padding:var(--s-5);border-radius:var(--r-md);background:var(--bg-2);border:1px solid var(--line);
  transition:transform .45s var(--ease-spring),border-color .3s}
@media (min-width:768px){.step{padding:var(--s-5) var(--s-6)}}
.step:hover{transform:translateX(6px);border-color:rgba(200,174,122,.4)}
.step-thumb{display:none;margin:0;width:96px;height:96px;border-radius:var(--r-sm);flex:none}
@media (min-width:640px){.step{grid-template-columns:auto minmax(0,1fr) auto}.step-thumb{display:block}}
.step-thumb img{transition:transform .9s var(--ease-out)}
.step:hover .step-thumb img{transform:scale(1.06)}
.step-num{font-family:var(--serif);font-weight:600;font-size:clamp(40px,4vw,56px);line-height:1;background:var(--metal-gold);-webkit-background-clip:text;background-clip:text;color:transparent;min-width:1.4em}
.step h3{font-size:clamp(20px,1.8vw,24px);line-height:1.25}
.step p{margin-top:var(--s-1);font-size:16px;line-height:1.55}
.step + .step::before{content:"";position:absolute;left:calc(var(--s-5) + .7em);top:calc(var(--s-4) * -1);height:var(--s-4);width:1px;background:linear-gradient(var(--gold-lo),var(--gold))}
.process-body .btn-row{margin-top:var(--s-6)}

/* testimonials */
.reviews{display:grid;gap:var(--s-5);margin-top:var(--s-7)}
.review-row{display:grid;gap:var(--s-5)}
@media (min-width:1024px){.review-row{grid-template-columns:540fr 670fr;gap:28px}.review-row.flip{grid-template-columns:670fr 540fr}}
.review-img{border-radius:var(--r-lg);min-height:320px}
.review-img img{position:absolute;inset:0}
.review{border-radius:var(--r-lg);background:var(--bg-2);border:1px solid var(--line);padding:var(--s-6) var(--s-5)}
@media (min-width:768px){.review{padding:var(--s-8) 56px}}
.review blockquote{margin:0}
.review q{display:block;quotes:"\\201C" "\\201D";color:var(--title);font-family:var(--serif);font-weight:600;font-size:clamp(22px,2.3vw,32px);line-height:1.3;max-width:520px}
.review q::before,.review q::after{color:var(--gold)}
.review .placeholder{margin-top:var(--s-4);max-width:440px}
.who{display:flex;align-items:center;gap:var(--s-4);margin-top:var(--s-6)}
.avatar{display:grid;place-items:center;width:60px;height:60px;border-radius:50%;background:var(--metal-gold);color:#171613;font-family:var(--serif);font-weight:700;font-size:22px;box-shadow:0 0 0 4px var(--bg-2),0 0 0 5px rgba(200,174,122,.35)}
.who b{display:block;color:var(--title);font-size:18px;line-height:1.3}
.who div span{display:block;font-size:16px;line-height:1.3}

/* faq */
.faq-wrap{display:grid;gap:var(--s-6);margin-top:var(--s-7);align-items:start}
@media (min-width:1024px){.faq-wrap{grid-template-columns:minmax(0,400px) minmax(0,1fr);gap:var(--s-8)}}
.faq-media{margin:0;border-radius:var(--r-lg);aspect-ratio:16/9;box-shadow:var(--sh-float)}
.faq-media img{object-position:50% 75%}
@media (min-width:1024px){.faq-media{aspect-ratio:3/4;position:sticky;top:var(--s-5)}.faq-media img{object-position:50% 50%}}
.faq{border-top:1px solid var(--line)}
.faq details{border-bottom:1px solid var(--line)}
.faq summary{display:flex;align-items:center;justify-content:space-between;gap:var(--s-5);padding:var(--s-5) 0;cursor:pointer;list-style:none;color:var(--title);font-weight:500;font-size:clamp(17px,1.5vw,20px);line-height:1.4;border-radius:var(--r-sm);transition:opacity .2s}
.faq summary::-webkit-details-marker{display:none}
.faq summary:hover{opacity:.8}
.faq summary:active{opacity:.6}
.faq .pm{display:grid;place-items:center;flex:none;width:40px;height:40px;border-radius:50%;border:1px solid var(--line-2);color:var(--gold);transition:transform .45s var(--ease-spring)}
.faq .pm .icon{width:18px;height:18px}
.faq details[open] .pm{transform:rotate(45deg);background:var(--metal-gold);border-color:transparent;color:#171613}
.faq details p{padding:0 56px var(--s-5) 0;max-width:760px}

/* contact: form box + full photo box, both on the page grid */
.contact{display:grid;gap:var(--s-5)}
@media (min-width:1024px){.contact{grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:var(--s-6);align-items:stretch}}
.contact-card{border-radius:var(--r-lg);background:radial-gradient(80% 60% at 0% 0%,rgba(200,174,122,.1),rgba(200,174,122,0) 60%),var(--bg-2);border:1px solid var(--line);box-shadow:var(--sh-float);padding:var(--s-6) var(--s-5)}
@media (min-width:768px){.contact-card{padding:var(--s-7)}}
.contact-card .h2{font-size:clamp(28px,3vw,42px)}
.contact-card .lead{margin-top:var(--s-3);max-width:560px}
.form{display:grid;gap:var(--s-3);margin-top:var(--s-6)}
.form .two{display:grid;gap:var(--s-3)}
@media (min-width:640px){.form .two{grid-template-columns:1fr 1fr;gap:var(--s-4)}}
.field label{display:block;margin-bottom:6px;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--silver)}
.field input,.field select,.field textarea{width:100%;height:50px;padding:0 var(--s-4);border-radius:12px;border:1px solid var(--line-2);background:var(--bg);color:var(--title);font-size:16px;outline:none;transition:border-color .2s,background-color .2s}
.field textarea{height:92px;padding:12px var(--s-4);resize:vertical;line-height:1.5}
.field textarea::placeholder{color:#6F706D}
.field select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23C8AE7A' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:44px;cursor:pointer;text-overflow:ellipsis}
.field select option{background:var(--bg-2);color:var(--title)}
.field input:hover,.field select:hover,.field textarea:hover{border-color:rgba(236,228,208,.28)}
.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--gold);background:var(--bg-3)}
.field [aria-invalid="true"]{border-color:#E0705F}
.consent{display:flex;gap:var(--s-3);align-items:flex-start;margin-top:var(--s-1);font-size:14px;line-height:1.5;cursor:pointer}
.consent input{appearance:none;flex:none;display:grid;place-items:center;width:20px;height:20px;margin:2px 0 0;border-radius:6px;border:1px solid var(--line-2);background:var(--bg);cursor:pointer;transition:border-color .2s}
.consent input::after{content:"";width:10px;height:6px;border-left:2px solid #171613;border-bottom:2px solid #171613;transform:rotate(-45deg) scale(0);margin-top:-2px;transition:transform .3s var(--ease-spring)}
.consent input:hover{border-color:var(--gold)}
.consent input:checked{background:var(--metal-gold);border-color:transparent}
.consent input:checked::after{transform:rotate(-45deg) scale(1)}
.consent input[aria-invalid="true"]{border-color:#E0705F}
.form .btn{justify-self:start;margin-top:var(--s-3)}
.form .btn[disabled]{opacity:.6;pointer-events:none}
.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
/* photo keeps its upright 3:4 frame so the scene is shown, not sliced */
.contact-photo{position:relative;border-radius:var(--r-lg);aspect-ratio:3/4;box-shadow:var(--sh-float)}
@media (min-width:1024px){.contact-photo{aspect-ratio:auto;min-height:100%}}
.contact-photo img{position:absolute;inset:0;object-position:50% 70%}
.contact-photo::after{opacity:1;background:linear-gradient(to bottom,rgba(12,12,11,.9) 0%,rgba(12,12,11,.7) 38%,rgba(12,12,11,0) 70%)}
.contact-info{position:absolute;z-index:2;top:0;left:0;right:0;padding:var(--s-6) var(--s-5);color:var(--title)}
@media (min-width:768px){.contact-info{padding:var(--s-7) var(--s-6)}}
.contact-info h3{display:flex;align-items:center;gap:var(--s-2);font-size:20px}
.contact-info h3 .icon{width:22px;height:22px;color:var(--gold)}
.contact-info ul{list-style:none;margin:var(--s-4) 0 0;padding:0;display:grid;gap:var(--s-2);font-size:15px;line-height:1.45}
@media (min-width:768px){.contact-info ul{font-size:16px}}
.contact-info li{display:flex;gap:var(--s-3);align-items:flex-start;color:var(--text-light)}
.contact-info li .icon{flex:none;width:18px;height:18px;margin-top:2px;color:var(--gold)}
.contact-info a{color:var(--title);border-bottom:1px solid transparent;transition:border-color .2s,opacity .2s}
.contact-info a:hover{border-color:var(--gold)}
.contact-info a:active{opacity:.7}
.contact-info address{font-style:normal;color:var(--title)}
@media (max-width:1023px){.contact-photo{aspect-ratio:auto;min-height:600px}.contact-photo img{object-position:50% 80%}}
@media (min-width:640px) and (max-width:1023px){.contact-photo{min-height:760px}.contact-photo img{object-position:50% 60%}}

/* footer */
.footer{margin-top:var(--section);padding-bottom:var(--gutter)}
.footer-inner > .container{padding:0 var(--s-5)}
@media (min-width:768px){.footer-inner > .container{padding:0 var(--s-8)}}
.footer-inner{border-radius:var(--r-lg);border:1px solid var(--line);background:radial-gradient(70% 120% at 100% 100%,rgba(200,174,122,.1) 0%,rgba(200,174,122,0) 60%),var(--bg-2);color:var(--text);padding:var(--s-8) 0 var(--s-6)}
.footer-inner > *{position:relative;z-index:1}
.footer-grid{display:grid;gap:var(--s-7)}
@media (min-width:1024px){.footer-grid{grid-template-columns:1.4fr 1fr 1fr}}
.footer p{margin-top:var(--s-5);max-width:380px;font-size:16px}
.footer h4{font-family:Onest,sans-serif;color:var(--gold-text);font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.2em}
.footer ul{list-style:none;margin:var(--s-4) 0 0;padding:0;display:grid;gap:var(--s-2);font-size:16px}
.footer ul a{display:inline-flex;align-items:center;gap:var(--s-2);transition:color .2s,transform .35s var(--ease-spring)}
.footer ul a:hover{color:var(--gold-hi);transform:translateX(2px)}
.footer ul a:active{opacity:.7}
.footer ul .icon{width:18px;height:18px;color:var(--gold)}
.footer-bottom{display:flex;flex-wrap:wrap;justify-content:space-between;gap:var(--s-3);margin-top:var(--s-8);padding-top:var(--s-5);border-top:1px solid var(--line);font-size:14px}

/* mobile action bar */
.action-bar{position:fixed;z-index:60;left:var(--s-3);right:var(--s-3);bottom:var(--s-3);display:grid;grid-template-columns:1fr 1fr;gap:var(--s-2);padding:var(--s-2);border-radius:999px;background:rgba(30,30,29,.9);border:1px solid var(--line-2);backdrop-filter:blur(12px);box-shadow:0 10px 30px -10px rgba(0,0,0,.7);
  transform:translateY(140%);transition:transform .5s var(--ease-spring)}
.action-bar.show{transform:none}
.action-bar a{display:flex;align-items:center;justify-content:center;gap:var(--s-2);height:48px;border-radius:999px;font-weight:700;font-size:15px;transition:transform .35s var(--ease-spring)}
.action-bar a:active{transform:scale(.96)}
.action-bar a:first-child{background:var(--metal-gold);color:#171613}
.action-bar a:last-child{background:var(--bg-3);color:var(--title)}
.action-bar .icon{width:20px;height:20px}
@media (min-width:1024px){.action-bar{display:none}}
@media (max-width:1023px){.footer{padding-bottom:88px}}

/* line breaking: headings balanced, running text without orphans */
h1,h2,h3,h4,q,summary,figcaption,.work figcaption b,.stat span,.tag{text-wrap:balance}
p,li,label,address,.lead{text-wrap:pretty}

/* titles inside cards size themselves to the card */
.step > div{container-type:inline-size;min-width:0}
.step h3{font-size:clamp(14px,6.8cqi,24px)}
.feature > div{flex:1 1 0;container-type:inline-size;min-width:0}
.feature h3{font-size:clamp(14px,6.5cqi,18px)}
.faq .pm .icon{transition:transform .45s var(--ease-spring)}
.faq details[open] .pm{transform:none}
.faq details[open] .pm .icon{transform:rotate(45deg)}

@media (max-width:639px){
  .h2{font-size:clamp(21px,7.2vw,34px)}
  .contact-card .h2{font-size:clamp(21px,7.2vw,34px)}
  .book h2{font-size:clamp(20px,6.4vw,26px)}
  .step{grid-template-columns:auto minmax(0,1fr);gap:var(--s-4);padding:var(--s-4)}
  .step-num{font-size:34px;min-width:1.3em}
  .step + .step::before{left:calc(var(--s-4) + .6em)}
  .feature{flex-direction:column;gap:var(--s-3)}
  .review q{font-size:clamp(20px,6.2vw,26px)}
  .book h2{font-size:clamp(18px,6vw,26px)}
  .faq summary{font-size:16px;gap:var(--s-4)}
  .contact-info ul{font-size:14px}
}
@media (max-width:399px){
  .step{grid-template-columns:1fr;gap:var(--s-2)}
  .step-num{font-size:28px}
  .step + .step::before{left:calc(var(--s-4) + .5em)}
}

/* phones: buttons span the content width (page gutters stay on both sides) */
@media (max-width:639px){
  .btn{position:relative;width:100%;justify-content:center;padding:0 56px}
  .btn .btn-dot{position:absolute;right:9px;top:50%;margin-top:-18px}
  .btn:hover .btn-dot{transform:translateX(2px)}
  .btn-row{flex-direction:column;gap:var(--s-3)}
  .cta-center .btn,.form .btn,.hero-content .btn{width:100%}
  .form .btn{justify-self:stretch}
  .why-notch{right:0;padding-right:0}
  .why-notch .corner--tr.b{display:none}
}
@media (max-width:374px){
  .btn{padding:0 48px 0 18px;font-size:13px;letter-spacing:.04em}
  .btn .btn-dot{width:32px;height:32px;margin-top:-16px;right:8px}
}

/* reveal */
.js .reveal{opacity:0;transform:translateY(28px);transition:opacity .9s var(--ease-out),transform .9s var(--ease-out)}
.js .reveal.visible{opacity:1;transform:none}
.js .reveal.d1{transition-delay:.08s}.js .reveal.d2{transition-delay:.16s}
.hero-content > *{animation:rise 1s var(--ease-out) both}
.hero-content > :nth-child(2){animation-delay:.12s}
.hero-content > :nth-child(3){animation-delay:.24s}
.hero-content > :nth-child(4){animation-delay:.36s}
@keyframes rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  *,*::before,*::after{animation:none!important;transition-duration:.01ms!important}
  .js .reveal{opacity:1;transform:none}
}
`;

/* ---------------- page ---------------- */
function page(lang) {
  const it = lang === 'it';
  const raw = (a, b) => (it ? a : b);
  const t = (a, b) => glue(raw(a, b));
  // German is the main language at the site root; Italian lives in /it/
  const P = it ? '../' : '';
  const srcset = name => IMAGES[name].map(([w]) => `${P}assets/img/${name}-${w}.webp ${w}w`).join(', ');
  const img = (name, alt, sizes, eager = false) => {
    const [w, h] = IMAGES[name][0];
    return `<img src="${P}assets/img/${name}-${w}.webp" srcset="${srcset(name)}" sizes="${sizes}" width="${w}" height="${h}" alt="${alt}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
  };
  const arrowBtn = (label, href, extra = '') =>
    `<a class="btn btn--gold ${extra}" href="${href}">${label}<span class="btn-dot">${icon('arrow')}</span></a>`;
  const waText = encodeURIComponent(raw('Buongiorno, vorrei un preventivo per una ristrutturazione.', 'Guten Tag, ich möchte ein Angebot für eine Renovierung.'));
  const WA_HREF = `https://wa.me/${WA}?text=${waText}`;
  const CTA = t('Preventivo gratuito', 'Kostenloses Angebot');

  const nav = [
    ['#servizi', t('Servizi', 'Leistungen')],
    ['#progetti', t('Progetti', 'Projekte')],
    ['#vantaggi', t('Vantaggi', 'Vorteile')],
    ['#chi-siamo', t('Chi siamo', 'Über uns')],
    ['#contatti', t('Contatti', 'Kontakt')],
  ];

  const services = [
    ['turnkey', 'svc-turnkey', 'key', t('Ristrutturazione completa', 'Komplettsanierung'),
      t('Dalla demolizione alla pulizia finale, un solo referente.', 'Vom Rückbau bis zur Endreinigung – aus einer Hand.')],
    ['bath', 'svc-bath', 'bath', t('Ristrutturazione bagni', 'Badsanierung'),
      t('Impianti, rivestimenti, sanitari e rubinetteria.', 'Leitungen, Fliesen, Sanitär und Armaturen.')],
    ['electric', 'svc-electric', 'bolt', t('Impianti elettrici', 'Elektroinstallation'),
      t('Nuove linee, prese e punti luce a norma.', 'Leitungen, Steckdosen und Licht – normgerecht.')],
    ['paint', 'svc-paint', 'roller', t('Pittura e carta da parati', 'Malerarbeiten & Tapeten'),
      t('Pareti, porte e radiatori, posa della carta da parati.', 'Wände, Türen und Heizkörper streichen, Tapeten kleben.')],
    ['floor', 'svc-floor', 'layers', t('Laminato e battiscopa', 'Laminat und Sockelleisten'),
      t('Posa di laminato con battiscopa e finiture pulite.', 'Laminat verlegen – mit Sockelleisten und sauberen Abschlüssen.')],
    ['tiles', 'svc-tiles', 'tiles', t('Piastrellatura', 'Fliesenarbeiten'),
      t('Pavimenti e rivestimenti per bagni, cucine e corridoi.', 'Boden- und Wandfliesen für Bad, Küche und Flur.')],
    ['plumbing', 'svc-plumbing', 'drop', t('Impianti idraulici', 'Sanitärinstallation'),
      t('Tubazioni, scarichi, sanitari e allacciamenti.', 'Rohre, Abflüsse, Sanitärobjekte und Anschlüsse.')],
    ['demolition', 'svc-demolition', 'hammer', t('Demolizioni', 'Abbrucharbeiten'),
      t('Rimozione di pavimenti e tramezzi, macerie incluse.', 'Rückbau von Böden und Wänden, inkl. Entsorgung.')],
    ['rental', 'svc-rental', 'home', t('Pronto per l’affitto', 'Renovierung nach Auszug'),
      t('Appartamenti rimessi a nuovo dopo il cambio inquilino.', 'Wohnungen schnell wieder bezugsfertig und vermietbar.')],
  ];

  // the full turnkey chain, in working order
  const stages = [
    [t('Demolizione', 'Rückbau'), t('con smaltimento macerie', 'inklusive Entsorgung')],
    [t('Impianto elettrico', 'Elektrik'), t('linee e prese', 'Leitungen und Steckdosen')],
    [t('Idraulica', 'Sanitär'), t('tubazioni e sanitari', 'Rohre und Sanitärobjekte')],
    [t('Piastrelle', 'Fliesen'), t('pavimenti e rivestimenti', 'Boden und Wand')],
    [t('Pareti', 'Wände'), t('carta da parati e pittura', 'Tapezieren und Streichen')],
    [t('Pavimenti', 'Böden'), t('laminato e battiscopa', 'Laminat und Sockelleisten')],
    [t('Porte e radiatori', 'Türen und Heizkörper'), t('verniciatura e ferramenta', 'Lackierung und Beschläge')],
    [t('Consegna', 'Übergabe'), t('pulizia finale e chiavi', 'Endreinigung und Schlüssel')],
  ];

  // real project photos; shape: '' (1×1), 'tall' (1×2), 'wide' (2×1), 'big' (2×2)
  const works = [
    ['pf-living', 'big', t('Soggiorno ristrutturato', 'Wohnzimmer saniert'), t('Pareti · Laminato · Porte', 'Wände · Laminat · Türen')],
    ['pf-bath', 'tall', t('Ristrutturazione bagno', 'Badsanierung'), t('Piastrelle · Sanitari', 'Fliesen · Sanitär')],
    ['pf-walkin', 'tall', t('Doccia a filo', 'Bodengleiche Dusche'), t('Piastrelle · Idraulica', 'Fliesen · Sanitär')],
    ['pf-room', 'tall', t('Camera rinnovata', 'Zimmer renoviert'), t('Pittura · Laminato', 'Malerarbeiten · Laminat')],
    ['pf-progress', '', t('Bagno in lavorazione', 'Bad im Umbau'), t('Sanitari · Rivestimenti', 'Sanitär · Wandbelag'), true],
    ['pf-tub', 'tall', t('Bagno con vasca', 'Bad mit Wanne'), t('Rivestimenti · Sanitari', 'Fliesen · Sanitärobjekte')],
    ['pf-floor', 'tall', t('Pavimento del bagno', 'Badboden gefliest'), t('Piastrelle grandi', 'Großformat-Fliesen')],
    ['pf-shower', '', t('Rivestimento doccia', 'Wandfliesen Dusche'), t('Piastrellatura', 'Fliesenarbeiten')],
    ['pf-laminate', 'wide', t('Laminato e battiscopa', 'Laminat und Sockelleisten'), t('Pavimenti', 'Bodenbelag')],
    ['pf-electric', 'tall', t('Impianto elettrico', 'Elektroinstallation'), t('Quadro contatori', 'Zählerschrank'), true],
    ['pf-balcony', 'tall', t('Balcone rinnovato', 'Balkon saniert'), t('Rivestimento · Pittura', 'Beschichtung · Anstrich')],
    ['pf-plumbing', 'wide', t('Sanitari sospesi', 'Vorwandinstallation'), t('Idraulica · WC sospeso', 'Sanitär · WC-Vorwand'), true],
  ];


  const done = t('Completato', 'Abgeschlossen');
  const sites = [
    ['Am Heller 6', t('2 appartamenti', '2 Wohnungen'), done, false],
    ['Sternbergstraße 83', t('Ristrutturazione', 'Sanierung'), done, false],
    ['Bodenbacher Ring 109', t('Ristrutturazione', 'Sanierung'), t('In corso', 'In Arbeit'), true],
    ['Hertastraße 8', t('Ristrutturazione', 'Sanierung'), done, false],
    ['Auf der Tanne 11', t('Ristrutturazione', 'Sanierung'), done, false],
    ['Hassjägerweg 30', t('Ristrutturazione', 'Sanierung'), done, false],
  ];

  const faq = [
    [t('Quanto costa ristrutturare un appartamento?', 'Was kostet eine Renovierung?'),
      t('Il costo dipende dalla superficie, dallo stato dell’immobile e dalla quantità di lavori. Dopo il sopralluogo prepariamo un preventivo dettagliato e ti proponiamo la soluzione migliore.', 'Die Kosten hängen von der Wohnfläche, dem Zustand der Räume und dem Umfang der Arbeiten ab. Nach der Besichtigung erstellen wir ein detailliertes Angebot und schlagen Ihnen die passende Lösung vor.')],
    [t('Fate ristrutturazioni chiavi in mano?', 'Bieten Sie Renovierungen schlüsselfertig an?'),
      t('Sì. Eseguiamo l’intero ciclo di lavori: demolizione, impianto elettrico, idraulica, piastrelle, carta da parati, tinteggiatura, laminato, sostituzione della ferramenta delle porte e pulizia finale.', 'Ja. Wir übernehmen alle Arbeiten: Rückbau, Elektrik, Sanitär, Fliesen, Tapezieren, Malerarbeiten, Laminat, Austausch der Türbeschläge und Endreinigung.')],
    [t('In quali città lavorate?', 'In welchen Städten arbeiten Sie?'),
      t('La nostra zona principale è Salzgitter, Braunschweig, Wolfsburg, Hannover e tutta la Bassa Sassonia. Su accordo lavoriamo anche in altre regioni della Germania.', 'Wir arbeiten hauptsächlich in Salzgitter, Braunschweig, Wolfsburg, Hannover und in ganz Niedersachsen. Nach Absprache arbeiten wir auch in anderen Regionen Deutschlands.')],
    [t('Vi occupate dell’acquisto dei materiali?', 'Kümmern Sie sich um den Materialeinkauf?'),
      t('Sì. Possiamo occuparci della scelta, dell’acquisto e della consegna dei materiali e di tutta la logistica.', 'Ja. Wir übernehmen Auswahl, Einkauf und Lieferung der Materialien sowie die gesamte Logistik.')],
    [t('Quanto dura una ristrutturazione?', 'Wie lange dauert eine Renovierung?'),
      t('Dipende dalla superficie e dalla complessità dei lavori. I piccoli interventi si completano in pochi giorni; una ristrutturazione completa di un appartamento richiede di solito alcune settimane.', 'Das hängt von der Fläche und vom Umfang der Arbeiten ab. Kleinere Aufträge sind oft in wenigen Tagen erledigt, eine Komplettsanierung einer Wohnung dauert in der Regel einige Wochen.')],
    [t('Il preventivo è gratuito?', 'Ist das Angebot kostenlos?'),
      t('Sì. Dopo il sopralluogo o dopo aver ricevuto le informazioni necessarie ti prepariamo un’offerta personalizzata.', 'Ja. Nach der Besichtigung oder nach Erhalt der nötigen Informationen erstellen wir Ihnen ein individuelles Angebot.')],
    [t('Offrite una garanzia sui lavori?', 'Gibt es eine Gewährleistung?'),
      t('Sì. Rispondiamo della qualità dei lavori eseguiti secondo le norme vigenti e gli accordi presi con il cliente.', 'Ja. Wir stehen für die Qualität unserer Arbeit ein – nach den gesetzlichen Vorgaben und den Vereinbarungen mit dem Auftraggeber.')],
    [t('Lavorate con società immobiliari e amministratori?', 'Arbeiten Sie für Hausverwaltungen?'),
      t('Sì. Abbiamo esperienza con società immobiliari, investitori e proprietari privati.', 'Ja. Wir arbeiten regelmäßig für Hausverwaltungen, Wohnungsgesellschaften, Investoren und private Eigentümer.')],
    [t('Eseguite anche singoli lavori?', 'Übernehmen Sie auch einzelne Arbeiten?'),
      t('Sì. Puoi richiedere la ristrutturazione completa oppure singoli servizi: impianto elettrico, idraulica, piastrelle, tinteggiatura, carta da parati o posa del laminato.', 'Ja. Sie können eine Komplettsanierung oder einzelne Leistungen beauftragen: Elektrik, Sanitär, Fliesen, Malerarbeiten, Tapezieren oder Laminatverlegung.')],
    [t('Come si richiede una ristrutturazione?', 'Wie beauftrage ich eine Renovierung?'),
      t('Contattaci per telefono, WhatsApp o e-mail. Parliamo del progetto, fissiamo un sopralluogo e prepariamo l’offerta.', 'Kontaktieren Sie uns per Telefon, WhatsApp oder E-Mail. Wir besprechen Ihr Projekt, vereinbaren eine Besichtigung und erstellen ein Angebot.')],
  ];

  const title = t('Ristrutturazioni chiavi in mano di appartamenti e case | János Barna BAU',
    'Wohnungs- und Haussanierung schlüsselfertig | János Barna BAU');
  const desc = t('Ristrutturazione completa di appartamenti e case: demolizione, impianti elettrici e idraulici, piastrelle, tinteggiatura, laminato. Un unico referente, preventivo gratuito. Salzgitter, Braunschweig, Wolfsburg, Hannover.',
    'Komplettsanierung von Wohnungen und Häusern: Rückbau, Elektrik, Sanitär, Fliesen, Malerarbeiten, Laminat. Alles aus einer Hand, kostenloses Angebot. Salzgitter, Braunschweig, Wolfsburg, Hannover.');

  const seoLinks = SITE_URL
    ? `<link rel="canonical" href="${SITE_URL}${it ? '/it/' : '/'}">
<link rel="alternate" hreflang="de" href="${SITE_URL}/">
<link rel="alternate" hreflang="it" href="${SITE_URL}/it/">
<link rel="alternate" hreflang="x-default" href="${SITE_URL}/">`
    : '';

  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'HomeAndConstructionBusiness',
      name: 'János Barna BAU', telephone: PHONE, email: EMAIL,
      ...(SITE_URL ? { logo: SITE_URL + '/assets/logo/logo.png', image: SITE_URL + '/assets/logo/og.jpg' } : {}),
      address: { '@type': 'PostalAddress', streetAddress: 'Martin-Luther-Straße 21', postalCode: '38226', addressLocality: 'Salzgitter', addressCountry: 'DE' },
      areaServed: ['Salzgitter', 'Braunschweig', 'Wolfsburg', 'Hannover', 'Niedersachsen'],
      ...(SITE_URL ? { url: SITE_URL + (it ? '/it/' : '/') } : {}),
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ];

  const serviceOptions = services.map(([key, , , name]) => `<option value="${key}">${name}</option>`).join('')
    + `<option value="other">${t('Altro / consulenza', 'Sonstiges / Beratung')}</option>`;

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
${seoLinks}
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${SITE_URL ? SITE_URL + '/' : P}assets/logo/og.jpg">
<meta property="og:locale" content="${t('it_IT', 'de_DE')}">
<meta name="theme-color" content="#161615">
<link rel="icon" href="${P}assets/logo/favicon-64.png" type="image/png" sizes="64x64">
<link rel="apple-touch-icon" href="${P}assets/logo/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Onest:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="preload" as="image" href="${P}assets/img/hero-${IMAGES.hero[0][0]}.webp" imagesrcset="${srcset('hero')}" imagesizes="100vw">
<style>${CSS}</style>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>


<header class="header" id="top">
  <div class="container">
    <a class="logo" href="#top" aria-label="János Barna BAU">
      <img class="logo-emblem" src="${P}assets/logo/emblem.webp" width="280" height="168" alt=""><img class="logo-word" src="${P}assets/logo/wordmark.webp" width="552" height="132" alt="János Barna BAU">
    </a>
    <nav class="nav" aria-label="${t('Navigazione principale', 'Hauptnavigation')}">
      ${nav.map(([h, l]) => `<a href="${h}">${l}</a>`).join('\n      ')}
    </nav>
    <div class="header-actions">
      <div class="lang" aria-label="${t('Lingua', 'Sprache')}">
        <a href="${it ? '../index.html' : 'index.html'}" hreflang="de" lang="de"${it ? '' : ' aria-current="page"'}>DE</a>
        <a href="${it ? 'index.html' : 'it/index.html'}" hreflang="it" lang="it"${it ? ' aria-current="page"' : ''}>IT</a>
      </div>
      ${arrowBtn(CTA, '#contatti')}
      <button class="burger" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="${t('Apri il menu', 'Menü öffnen')}">
        ${icon('menu', 'icon icon-open')}${icon('close', 'icon icon-close')}
      </button>
    </div>
    <nav class="mobile-nav" id="mobile-nav" aria-label="${t('Menu mobile', 'Mobiles Menü')}">
      ${nav.map(([h, l]) => `<a href="${h}">${l}</a>`).join('\n      ')}
      ${arrowBtn(CTA, '#contatti')}
    </nav>
  </div>
</header>

<main>

<!-- HERO -->
<section class="hero wide">
  <div class="hero-media media media--dark">
    ${img('hero', t('Soggiorno appena ristrutturato con pavimento in laminato', 'Frisch renoviertes Wohnzimmer mit Laminatboden'), '(min-width:1440px) 1240px, 100vw', true)}
    <div class="hero-content">
      <span class="tag hero-tag">${t('Tutto da un’unica impresa', 'Alles aus einer Hand')}</span>
      <h1>${t('La tua casa<br><em>chiavi in mano</em>', 'Ihr Zuhause –<br><em>komplett saniert</em>')}</h1>
      <p>${t('Dalla demolizione all’appartamento finito: un’impresa, un referente, un preventivo.', 'Vom Rückbau bis zur bezugsfertigen Wohnung: ein Betrieb, ein Ansprechpartner, ein Angebot.')}</p>
      ${arrowBtn(t('Richiedi un preventivo', 'Angebot anfordern'), '#contatti')}
    </div>
  </div>
  <div class="book">
    <span class="corner corner--tl"></span><span class="corner corner--tl b"></span>
    <h2>${t('Preventivo gratuito', 'Kostenloses Angebot')}</h2>
    <p>${t('Lascia il tuo numero: ti richiamiamo per parlare del progetto e fissare un sopralluogo.', 'Hinterlassen Sie Ihre Nummer – wir rufen zurück und vereinbaren eine Besichtigung.')}</p>
    <form class="js-form" data-source="hero" novalidate>
      <div class="quick">
        <label class="sr-only" for="quick-phone">${t('Numero di telefono', 'Telefonnummer')}</label>
        <input id="quick-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="${t('Il tuo numero di telefono', 'Ihre Telefonnummer')}" required>
        <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button type="submit" aria-label="${t('Richiedi una chiamata', 'Rückruf anfordern')}">${icon('arrow')}</button>
      </div>
      <p class="quick-note">${t('Inviando il numero accetti di essere ricontattato riguardo alla tua richiesta.', 'Mit dem Absenden stimmen Sie zu, dass wir Sie zu Ihrer Anfrage kontaktieren.')}</p>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>

<!-- TRUST BAR -->
<div class="container">
  <ul class="trust reveal">
    <li><b>10+</b><span>${t('anni di esperienza', 'Jahre Erfahrung')}</span></li>
    <li>${icon('usercheck')}<span>${t('Tutti i lavori da un’unica impresa', 'Alle Gewerke aus einer Hand')}</span></li>
    <li>${icon('receipt')}<span>${t('Sopralluogo e preventivo gratuiti', 'Besichtigung und Angebot kostenlos')}</span></li>
    <li>${icon('pin')}<span>Salzgitter${NB}· Braunschweig · Wolfsburg${NB}· Hannover</span></li>
  </ul>
</div>

<!-- TURNKEY: from demolition to finished flat -->
<section class="section" id="chiavi-in-mano">
  <div class="container">
    <div class="center reveal">
      <span class="tag">${t('Chiavi in mano', 'Schlüsselfertig')}</span>
      <h2 class="h2">${t('Dalla demolizione alle chiavi', 'Vom Rückbau bis zur fertigen Wohnung')}</h2>
      <p class="lead">${t('Incarichi una sola impresa: eseguiamo tutti i lavori nella sequenza giusta e ti consegniamo l’appartamento pronto da abitare.', 'Sie beauftragen einen einzigen Betrieb: Wir übernehmen alle Gewerke in der richtigen Reihenfolge und übergeben die Wohnung bezugsfertig.')}</p>
    </div>
    <div class="turnkey">
      <figure class="turnkey-img media reveal">
        ${img('turnkey-start', t('Stanza svuotata all’inizio dei lavori', 'Entkernter Raum zu Beginn der Arbeiten'), '(min-width:1024px) 300px, 100vw')}
        <figcaption><span>${t('Inizio', 'Start')}</span><b>${t('Demolizione', 'Rückbau')}</b></figcaption>
      </figure>
      <ol class="stages reveal d1">
        ${stages.map(([name, sub], i) => `<li class="stage${i === stages.length - 1 ? ' stage--final' : ''}"><span class="stage-num">${String(i + 1).padStart(2, '0')}</span><div><b>${name}</b><span>${sub}</span></div></li>`).join('\n        ')}
      </ol>
      <figure class="turnkey-img media reveal d2">
        ${img('turnkey-end', t('La stessa stanza a lavori finiti', 'Derselbe Raum nach Abschluss der Arbeiten'), '(min-width:1024px) 300px, 100vw')}
        <figcaption><span>${t('Risultato', 'Ergebnis')}</span><b>${t('Pronto da abitare', 'Bezugsfertig')}</b></figcaption>
      </figure>
    </div>
    <ul class="turnkey-facts reveal">
      <li>${icon('usercheck')}<span>${t('Un contratto, un referente', 'Ein Vertrag, ein Ansprechpartner')}</span></li>
      <li>${icon('layers')}<span>${t('Materiali e logistica inclusi', 'Material und Logistik inklusive')}</span></li>
      <li>${icon('clock')}<span>${t('Nessun coordinamento tra artigiani', 'Keine Abstimmung zwischen Handwerkern')}</span></li>
    </ul>
    <div class="cta-center reveal">${arrowBtn(CTA, '#contatti')}</div>
  </div>
</section>

<!-- SERVICES -->
<section class="section" id="servizi">
  <div class="container">
    <div class="head-split reveal">
      <div>
        <span class="tag">${t('Servizi', 'Leistungen')}</span>
        <h2 class="h2">${t('Tutti i lavori, un’unica impresa', 'Alle Gewerke aus einer Hand')}</h2>
      </div>
      <div class="btn-row">
        ${arrowBtn(CTA, '#contatti')}
        <a class="btn btn--outline" href="${WA_HREF}" target="_blank" rel="noopener">${icon('whatsapp')}WhatsApp</a>
      </div>
    </div>
    <div class="cards">
      ${services.map(([, im, ic, name, text], i) => `<article class="card reveal d${i % 3}">
        <div class="media">${img(im, name, '(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw')}</div>
        <h3>${name}</h3>
        <p>${text}</p>
        <span class="icon-chip">${icon(ic)}</span>
      </article>`).join('\n      ')}
    </div>
  </div>
</section>

<!-- PORTFOLIO -->
<section class="section" id="progetti">
  <div class="container">
    <div class="head-split reveal">
      <div>
        <span class="tag">${t('Progetti', 'Projekte')}</span>
        <h2 class="h2">${t('I nostri lavori', 'Unsere Arbeiten')}</h2>
      </div>
      <p class="lead">${t('Foto reali dei nostri cantieri: appartamenti, case e bagni ristrutturati per privati, investitori e società immobiliari.', 'Echte Fotos von unseren Baustellen: renovierte Wohnungen, Häuser und Bäder.')}</p>
    </div>
    <div class="works">
      ${works.map(([src, shape, name, sub, live], i) => {
        const full = IMAGES[src][IMAGES[src].length - 1];
        const badge = live ? `<span class="live">${t('Cantiere', 'Baustelle')}</span>` : '';
        const sizes = shape === 'big' || shape === 'wide' ? '(min-width:1024px) 620px, 100vw' : '(min-width:1024px) 300px, 50vw';
        return `<a class="work media reveal${shape ? ' work--' + shape : ''}" href="${P}assets/img/${src}-${full[0]}.webp" data-w="${full[0]}" data-h="${full[1]}" data-title="${name}" aria-label="${name} – ${t('ingrandisci la foto', 'Foto vergrößern')}">${img(src, name, sizes)}${badge}<span class="work-cap"><b>${name}</b><span>${sub}</span></span><span class="work-zoom">${icon('plus')}</span></a>`;
      }).join('\n      ')}
    </div>
    <div class="sites reveal">
      <h3>${t('Cantieri recenti', 'Referenzobjekte')}</h3>
      <ul>
        ${sites.map(([addr, what, status, live]) => `<li>${icon('pin')}<div><b>${keep(addr)}</b><span>${what}</span></div><em${live ? ' class="is-live"' : ''}>${status}</em></li>`).join('\n        ')}
      </ul>
    </div>
  </div>
</section>

<!-- CTA / WHY US -->
<section class="section" id="perche">
  <div class="why wide">
    <div class="why-card grain reveal">
      <div>
        <span class="tag tag--light">${t('Perché noi', 'Warum wir')}</span>
        <h2 class="h2">${t('Ci occupiamo di tutto, dall’inizio alla fine', 'Wir kümmern uns um alles – von A bis Z')}</h2>
        <p>${t('Acquisto e consegna dei materiali, smaltimento delle macerie e coordinamento di tutte le fasi del cantiere: tu ricevi l’appartamento finito.', 'Materialeinkauf und -lieferung, Entsorgung des Bauschutts und Koordination aller Bauphasen: Sie erhalten die fertige Wohnung.')}</p>
      </div>
      <div class="stats">
        <div class="stat"><b>10<em>+</em></b><span>${t('anni di esperienza', 'Jahre Erfahrung')}</span></div>
        <div class="stat"><b>1</b><span>${t('referente unico', 'Ansprechpartner')}</span></div>
        <div class="stat"><b>0${it ? "" : NB}<em>€</em></b><span>${t('per il preventivo', 'für das Angebot')}</span></div>
      </div>
    </div>
    <div class="why-photo media reveal d1">
      ${img('van', t('Furgone aziendale János Barna BAU', 'Firmenfahrzeug von János Barna BAU'), '(min-width:1024px) 50vw, 100vw')}
      <div class="why-notch">
        <span class="corner corner--tr"></span><span class="corner corner--tr b"></span>
        ${arrowBtn(CTA, '#contatti')}
      </div>
    </div>
  </div>
</section>

<!-- BENEFITS -->
<section class="section" id="vantaggi">
  <div class="container">
    <div class="center reveal">
      <span class="tag">${t('Vantaggi', 'Vorteile')}</span>
      <h2 class="h2">${t('Oltre 10 anni nell’edilizia', 'Mehr als 10 Jahre Erfahrung am Bau')}</h2>
      <p class="lead">${t('Lavoriamo principalmente a Salzgitter, Braunschweig, Wolfsburg e Hannover, per privati, investitori, società immobiliari e amministratori.', 'Wir arbeiten vor allem in Salzgitter, Braunschweig, Wolfsburg und Hannover – für Privatkunden, Investoren und Hausverwaltungen.')}</p>
    </div>
    <div class="benefits reveal">
    <div class="benefits-media media">
      ${img('benefits', t('Due artigiani controllano il progetto in cantiere', 'Zwei Handwerker besprechen den Plan auf der Baustelle'), '(min-width:1300px) 1240px, 100vw')}
    </div>
      <div class="features">
        <div class="feature"><span class="ic">${icon('receipt')}</span><div><h3>${t('Preventivi trasparenti', 'Transparente Angebote')}</h3><p>${t('Dopo il sopralluogo ricevi un preventivo dettagliato, senza sorprese.', 'Nach der Besichtigung: ein klares Angebot ohne Überraschungen.')}</p></div></div>
        <div class="feature"><span class="ic">${icon('clock')}</span><div><h3>${t('Qualità e tempi rispettati', 'Qualität und Termintreue')}</h3><p>${t('Lavori eseguiti a regola d’arte, nei tempi concordati.', 'Sauber ausgeführte Arbeiten in der vereinbarten Zeit.')}</p></div></div>
        <div class="feature"><span class="ic">${icon('usercheck')}</span><div><h3>${t('Un unico appaltatore', 'Alles aus einer Hand')}</h3><p>${t('Tutti i lavori da un’unica impresa: meno coordinamento, meno stress.', 'Alle Gewerke von einem Betrieb: weniger Abstimmung, weniger Stress.')}</p></div></div>
      </div>
    </div>
    <div class="cta-center reveal">${arrowBtn(CTA, '#contatti')}</div>
  </div>
</section>

<!-- ABOUT / PROCESS -->
<section class="section" id="chi-siamo">
  <div class="container">
    <div class="head-split reveal">
      <div>
        <span class="tag">${t('Chi siamo', 'Über uns')}</span>
        <h2 class="h2">${t('Ecco come lavoriamo', 'So arbeiten wir')}</h2>
      </div>
      <p class="lead">${t('János Barna BAU è un’impresa edile di Salzgitter. Lavoriamo per società immobiliari, amministratori, investitori e privati e seguiamo ogni cantiere dall’inizio alla fine.', 'János Barna BAU ist ein Baubetrieb aus Salzgitter. Wir arbeiten für Wohnungsgesellschaften, Hausverwaltungen, Investoren und Privatkunden und betreuen jede Baustelle von Anfang bis Ende.')}</p>
    </div>
    <div class="process">
      <figure class="process-video reveal">
        <div class="process-frame media">
          <video src="${P}assets/video/about.mp4" poster="${P}assets/video/about-poster.jpg" muted loop playsinline preload="none" data-autoplay aria-label="${t('Video di un appartamento ristrutturato', 'Video einer renovierten Wohnung')}"></video>
          <span class="live">${t('Dal cantiere', 'Von der Baustelle')}</span>
          <figcaption>${t('Appartamento consegnato', 'Übergabefertige Wohnung')}</figcaption>
        </div>
      </figure>
      <div class="process-body">
        <ol class="steps">
          <li class="step reveal"><span class="step-num">01</span><div><h3>${t('Contattaci', 'Kontakt aufnehmen')}</h3><p>${t('Telefono, WhatsApp o e-mail: raccontaci il tuo progetto.', 'Per Telefon, WhatsApp oder E-Mail – erzählen Sie uns von Ihrem Vorhaben.')}</p></div><figure class="step-thumb media">${img('step-1', t('Richiesta via smartphone', 'Anfrage per Smartphone'), '96px')}</figure></li>
          <li class="step reveal d1"><span class="step-num">02</span><div><h3>${t('Sopralluogo gratuito', 'Besichtigung & Angebot')}</h3><p>${t('Visioniamo l’immobile e prepariamo un preventivo gratuito.', 'Wir besichtigen das Objekt und erstellen ein kostenloses Angebot.')}</p></div><figure class="step-thumb media">${img('step-2', t('Misurazione durante il sopralluogo', 'Aufmaß bei der Besichtigung'), '96px')}</figure></li>
          <li class="step reveal d2"><span class="step-num">03</span><div><h3>${t('Lavoro finito!', 'Fertig renoviert!')}</h3><p>${t('Tutti i lavori, con materiali, logistica e pulizia finale.', 'Alle Arbeiten inklusive Material, Logistik und Endreinigung.')}</p></div><figure class="step-thumb media">${img('step-3', t('Consegna delle chiavi', 'Schlüsselübergabe'), '96px')}</figure></li>
        </ol>
        <div class="btn-row reveal">
          ${arrowBtn(CTA, '#contatti')}
          <a class="btn btn--outline" href="${WA_HREF}" target="_blank" rel="noopener">${icon('whatsapp')}WhatsApp</a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- TESTIMONIALS (placeholders — replace with real client reviews before launch) -->
<section class="section" id="recensioni">
  <div class="container">
    <div class="center reveal">
      <span class="tag">${t('Recensioni', 'Bewertungen')}</span>
      <h2 class="h2">${t('Cosa dicono i nostri clienti', 'Was unsere Kunden sagen')}</h2>
    </div>
    <div class="reviews">
      <div class="review-row">
        <div class="review-img media reveal">${img('review-1', t('Bagno ristrutturato con piastrelle bianche', 'Saniertes Bad mit weißen Fliesen'), '(min-width:1024px) 540px, 100vw')}</div>
        <div class="review reveal d1">
          <blockquote><q>${t('Lavoro pulito e tempi rispettati', 'Saubere Arbeit, Termine eingehalten')}</q></blockquote>
          <p class="placeholder">${t('[Testo della recensione — sostituire con una recensione reale del cliente prima della pubblicazione.]', '[Platzhalter – durch eine echte Kundenbewertung ersetzen.]')}</p>
          <div class="who"><span class="avatar">A</span><div><b>${t('Nome Cliente', 'Kundenname')}</b><span>Salzgitter</span></div></div>
        </div>
      </div>
      <div class="review-row flip">
        <div class="review reveal">
          <blockquote><q>${t('Un solo referente per tutta la ristrutturazione', 'Ein Ansprechpartner für die ganze Sanierung')}</q></blockquote>
          <p class="placeholder">${t('[Testo della recensione — sostituire con una recensione reale del cliente prima della pubblicazione.]', '[Platzhalter – durch eine echte Kundenbewertung ersetzen.]')}</p>
          <div class="who"><span class="avatar">B</span><div><b>${t('Nome Cliente', 'Kundenname')}</b><span>Braunschweig</span></div></div>
        </div>
        <div class="review-img media reveal d1">${img('review-2', t('Bagno con sanitari nuovi', 'Bad mit neuen Sanitärobjekten'), '(min-width:1024px) 540px, 100vw')}</div>
      </div>
    </div>
    <div class="cta-center reveal">${arrowBtn(CTA, '#contatti')}</div>
  </div>
</section>

<!-- FAQ -->
<section class="section" id="faq">
  <div class="container">
    <div class="center reveal">
      <span class="tag">FAQ</span>
      <h2 class="h2">${t('Domande frequenti', 'Häufige Fragen')}</h2>
    </div>
    <div class="faq-wrap">
    <figure class="faq-media media reveal">${img('faq', t('Artigiano che prende le misure per il preventivo', 'Handwerker notiert Maße für das Angebot'), '(min-width:1024px) 400px, 100vw')}</figure>
    <div class="faq reveal d1">
      ${faq.map(([q, a], i) => `<details name="faq"${i === 0 ? ' open' : ''}><summary>${q}<span class="pm">${icon('plus')}</span></summary><p>${a}</p></details>`).join('\n      ')}
    </div>
    </div>
  </div>
</section>

<!-- CONTACT + FORM -->
<section class="section" id="contatti">
  <div class="contact wide">
      <div class="contact-card reveal">
        <span class="tag">${t('Contatti', 'Kontakt')}</span>
        <h2 class="h2">${t('Lavoriamo insieme!', 'Starten wir Ihr Projekt!')}</h2>
        <p class="lead">${t('Descrivi il lavoro: ti ricontattiamo per fissare un sopralluogo e preparare un preventivo gratuito.', 'Beschreiben Sie Ihr Vorhaben – wir melden uns, vereinbaren eine Besichtigung und erstellen ein kostenloses Angebot.')}</p>
        <form class="form js-form" data-source="contact" novalidate>
          <div class="two">
            <div class="field"><label for="f-name">${t('Nome', 'Name')} *</label><input id="f-name" name="name" autocomplete="name" required></div>
            <div class="field"><label for="f-phone">${t('Telefono', 'Telefon')} *</label><input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required></div>
          </div>
          <div class="two">
            <div class="field"><label for="f-email">E-mail</label><input id="f-email" name="email" type="email" autocomplete="email"></div>
            <div class="field"><label for="f-service">${t('Tipo di lavoro', 'Art der Arbeiten')}</label><select id="f-service" name="service">${serviceOptions}</select></div>
          </div>
          <div class="field"><label for="f-msg">${t('Messaggio', 'Nachricht')}</label><textarea id="f-msg" name="message" placeholder="${t('Città, metri quadri, lavori da eseguire…', 'Ort, Fläche, gewünschte Arbeiten …')}"></textarea></div>
          <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
          <label class="consent"><input type="checkbox" name="consent" required><span>${t('Acconsento al trattamento dei miei dati per essere ricontattato riguardo a questa richiesta.', 'Ich willige ein, dass meine Angaben zur Bearbeitung dieser Anfrage verwendet werden.')} *</span></label>
          <button class="btn btn--gold" type="submit">${t('Invia richiesta', 'Anfrage senden')}<span class="btn-dot">${icon('arrow')}</span></button>
          <p class="form-status" role="status" aria-live="polite"></p>
        </form>
      </div>
      <div class="contact-photo media reveal d1">
        ${img('contact', t('Furgone aziendale János Barna BAU', 'Firmenfahrzeug von János Barna BAU'), '(min-width:1024px) 520px, 100vw')}
        <div class="contact-info">
          <h3>${icon('chat')}${t('Contatti', 'Kontakt')}</h3>
          <ul>
            <li>${icon('phone')}<span>${t('Telefono', 'Telefon')}:${NB}<a href="${PHONE_HREF}">${keep(PHONE)}</a></span></li>
            <li>${icon('whatsapp')}<span>WhatsApp:${NB}<a href="${WA_HREF}" target="_blank" rel="noopener">${keep(PHONE)}</a></span></li>
            <li>${icon('phone')}<span>${t('Cellulare di servizio', 'Diensthandy')}:${NB}<a href="${PHONE2_HREF}">${keep(PHONE2)}</a></span></li>
            <li>${icon('mail')}<span><a href="mailto:${EMAIL}">${EMAIL}</a></span></li>
            <li>${icon('pin')}<address>János${NB}Barna${NB}BAU, Martin\u2011Luther\u2011Straße${NB}21, 38226${NB}Salzgitter</address></li>
          </ul>
        </div>
      </div>
  </div>
</section>

</main>

<footer class="footer wide">
  <div class="footer-inner grain">
    <div class="container">
      <div class="footer-grid">
        <div>
          <a class="logo" href="#top" aria-label="János Barna BAU"><img class="logo-full" src="${P}assets/logo/logo.webp" width="632" height="480" alt="János Barna BAU" loading="lazy" decoding="async"></a>
          <p>${t('Ristrutturazioni chiavi in mano di appartamenti e case a Salzgitter, Braunschweig, Wolfsburg, Hannover e in tutta la Bassa Sassonia.', 'Schlüsselfertige Sanierung von Wohnungen und Häusern in Salzgitter, Braunschweig, Wolfsburg, Hannover und ganz Niedersachsen.')}</p>
        </div>
        <div>
          <h4>${t('Navigazione', 'Navigation')}</h4>
          <ul>${nav.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('')}<li><a href="#faq">FAQ</a></li></ul>
        </div>
        <div>
          <h4>${t('Contatti', 'Kontakt')}</h4>
          <ul>
            <li><a href="${PHONE_HREF}">${icon('phone')}${keep(PHONE)}</a></li>
            <li><a href="${PHONE2_HREF}">${icon('phone')}${keep(PHONE2)}${NB}· ${t('servizio', 'Dienst')}</a></li>
            <li><a href="${WA_HREF}" target="_blank" rel="noopener">${icon('whatsapp')}WhatsApp</a></li>
            <li><a href="mailto:${EMAIL}">${icon('mail')}${EMAIL}</a></li>
            <li>${icon('pin', 'icon')}<span> Martin\u2011Luther\u2011Straße${NB}21, 38226${NB}Salzgitter</span></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© <span class="js-year">2026</span> János Barna BAU</span>
        <span>${t('Ristrutturazioni chiavi in mano', 'Schlüsselfertige Sanierung')}</span>
      </div>
    </div>
  </div>
</footer>

<dialog class="lightbox" aria-label="${t('Galleria progetti', 'Projektgalerie')}">
  <div class="lightbox-stage"><img alt=""></div>
  <div class="lightbox-bar"><span class="lightbox-title"></span><span class="lightbox-count"></span></div>
  <button class="lb-close" type="button" aria-label="${t('Chiudi', 'Schließen')}">${icon('close')}</button>
  <button class="lb-prev" type="button" aria-label="${t('Foto precedente', 'Vorheriges Foto')}">${icon('arrow')}</button>
  <button class="lb-next" type="button" aria-label="${t('Foto successiva', 'Nächstes Foto')}">${icon('arrow')}</button>
</dialog>

<nav class="action-bar" aria-label="${t('Contatto rapido', 'Schnellkontakt')}">
  <a href="${PHONE_HREF}">${icon('phone')}${t('Chiama', 'Anrufen')}</a>
  <a href="${WA_HREF}" target="_blank" rel="noopener">${icon('whatsapp')}WhatsApp</a>
</nav>

<script>
(function(){
  var d=document, root=d.documentElement;
  root.classList.add('js');

  // header gets its glass background once the page is scrolled
  var onScroll=function(){root.classList.toggle('scrolled',window.scrollY>8);};
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});

  // project gallery lightbox
  var lb=d.querySelector('.lightbox'), tiles=[].slice.call(d.querySelectorAll('.work')), cur=0;
  if(lb&&lb.showModal){
    var lbImg=lb.querySelector('img'), lbTitle=lb.querySelector('.lightbox-title'), lbCount=lb.querySelector('.lightbox-count');
    var show=function(i){
      cur=(i+tiles.length)%tiles.length; var a=tiles[cur];
      lbImg.style.animation='none'; void lbImg.offsetWidth; lbImg.style.animation='';
      lbImg.src=a.href; lbImg.width=a.dataset.w; lbImg.height=a.dataset.h; lbImg.alt=a.dataset.title;
      lbTitle.textContent=a.dataset.title; lbCount.textContent=(cur+1)+' / '+tiles.length;
    };
    tiles.forEach(function(a,i){a.addEventListener('click',function(e){e.preventDefault();show(i);lb.showModal();});});
    lb.querySelector('.lb-close').addEventListener('click',function(){lb.close();});
    lb.querySelector('.lb-prev').addEventListener('click',function(){show(cur-1);});
    lb.querySelector('.lb-next').addEventListener('click',function(){show(cur+1);});
    lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('lightbox-stage'))lb.close();});
    lb.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1);});
    lb.addEventListener('close',function(){tiles[cur].focus();});
  }

  // mobile menu
  var burger=d.querySelector('.burger');
  burger.addEventListener('click',function(){
    var open=root.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded',open);
  });
  d.querySelectorAll('.mobile-nav a').forEach(function(a){a.addEventListener('click',function(){root.classList.remove('menu-open');burger.setAttribute('aria-expanded','false');});});

  // reveal on scroll
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px'});
    d.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
    // play videos only while visible
    var vo=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting){v.preload='auto';var p=v.play();if(p&&p.catch)p.catch(function(){});}else{v.pause();}});},{threshold:.25});
    d.querySelectorAll('video[data-autoplay]').forEach(function(v){vo.observe(v);});
    // mobile action bar appears after the hero
    var bar=d.querySelector('.action-bar');
    new IntersectionObserver(function(es){bar.classList.toggle('show',!es[0].isIntersecting);}).observe(d.querySelector('.hero'));
  } else {
    d.querySelectorAll('.reveal').forEach(function(el){el.classList.add('visible');});
  }

  // FAQ: only one answer open at a time (native via details[name]; this covers older browsers)
  var faqs=d.querySelectorAll('.faq details');
  faqs.forEach(function(el){el.addEventListener('toggle',function(){
    if(el.open)faqs.forEach(function(o){if(o!==el&&o.open)o.open=false;});
  });});

  d.querySelectorAll('.js-year').forEach(function(el){el.textContent=new Date().getFullYear();});

  // forms -> send-form.php -> Telegram
  var MSG={
    ok:${JSON.stringify(t('Grazie! Ti ricontatteremo al più presto.', 'Vielen Dank! Wir melden uns so schnell wie möglich.'))},
    phone:${JSON.stringify(t('Inserisci un numero di telefono valido.', 'Bitte geben Sie eine gültige Telefonnummer ein.'))},
    name:${JSON.stringify(t('Inserisci il tuo nome.', 'Bitte geben Sie Ihren Namen ein.'))},
    email:${JSON.stringify(t('Controlla l’indirizzo e-mail.', 'Bitte prüfen Sie die E-Mail-Adresse.'))},
    consent:${JSON.stringify(t('Serve il tuo consenso per inviare la richiesta.', 'Bitte bestätigen Sie die Einwilligung.'))},
    error:${JSON.stringify(t('Invio non riuscito. Chiamaci o scrivici su WhatsApp: ' + PHONE, 'Senden fehlgeschlagen. Rufen Sie uns an oder schreiben Sie per WhatsApp: ' + PHONE))}
  };
  d.querySelectorAll('.js-form').forEach(function(form){
    var status=form.querySelector('.form-status');
    function say(state,text){status.dataset.state=state;status.textContent=text;}
    function bad(name,msg){var f=form.elements[name];if(f){f.setAttribute('aria-invalid','true');f.focus();}say('error',msg);return false;}
    form.addEventListener('input',function(e){e.target.removeAttribute('aria-invalid');});
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var el=form.elements, full=form.dataset.source==='contact';
      var data={source:form.dataset.source,lang:${JSON.stringify(lang)},page:location.pathname,
        phone:el.phone.value.trim(),website:el.website.value,
        name:full?el.name.value.trim():'',email:full?el.email.value.trim():'',
        service:full?el.service.value:'',message:full?el.message.value.trim():''};
      if(full&&data.name.length<2)return bad('name',MSG.name);
      if(data.phone.replace(/\\D/g,'').length<7)return bad('phone',MSG.phone);
      if(full&&data.email&&!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data.email))return bad('email',MSG.email);
      if(full&&!el.consent.checked)return bad('consent',MSG.consent);
      var btn=form.querySelector('[type=submit]');btn.disabled=true;say('','');
      fetch(${JSON.stringify(P + 'send-form.php')},{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
        .then(function(r){return r.json().catch(function(){return {ok:false};});})
        .then(function(res){
          if(res&&res.ok){say('ok',MSG.ok);form.reset();if(window.dataLayer)window.dataLayer.push({event:'generate_lead',form_source:data.source});}
          else say('error',MSG.error);
        })
        .catch(function(){say('error',MSG.error);})
        .then(function(){btn.disabled=false;});
    });
  });
})();
</script>
</body>
</html>
`;
}

// German pages use German section anchors (#kontakt instead of #contatti …)
const DE_IDS = { 'chiavi-in-mano': 'schluesselfertig', servizi: 'leistungen', progetti: 'projekte', perche: 'warum-wir', vantaggi: 'vorteile', 'chi-siamo': 'ueber-uns', recensioni: 'bewertungen', contatti: 'kontakt' };
const germanIds = html => Object.entries(DE_IDS).reduce((h, [a, b]) => h.replaceAll(`id="${a}"`, `id="${b}"`).replaceAll(`href="#${a}"`, `href="#${b}"`), html);

fs.mkdirSync('it', { recursive: true });
fs.rmSync('de', { recursive: true, force: true }); // old location of the German page
fs.writeFileSync('index.html', germanIds(page('de')));
fs.writeFileSync('it/index.html', page('it'));
console.log('Built index.html (DE), it/index.html (IT)');
