import puppeteer from 'puppeteer';
const [url, out] = process.argv.slice(2);
const b = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await p.goto(url, { waitUntil: 'networkidle2' });
await p.evaluate(async () => {
  document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
  await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
  document.querySelectorAll('.reveal').forEach(el => { el.classList.add('visible'); el.style.transition = 'none'; });
  const errs = []; return errs;
});
await new Promise(r => setTimeout(r, 500));
const w = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
console.log('scrollWidth/clientWidth', w);
await p.addStyleTag({ content: '.action-bar{display:none!important}' });
const H = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0, i = 0; y < H; y += 2800, i++)
  await p.screenshot({ path: out.replace('.png', `-${i}.png`), clip: { x: 0, y, width: 390, height: Math.min(2800, H - y) }, captureBeyondViewport: true });
console.log('height', H);
await b.close();
