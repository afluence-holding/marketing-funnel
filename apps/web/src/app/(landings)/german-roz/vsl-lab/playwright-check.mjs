import { chromium } from 'playwright';

const URL = 'http://localhost:3001/german-roz/vsl-lab';
const OUT = '/tmp';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

console.log('→ goto', URL);
await page.goto(URL, { waitUntil: 'domcontentloaded' });
const iframeEl = await page.waitForSelector('iframe[data-vsl-lab]', { timeout: 20000 });
const frame = await iframeEl.contentFrame();
await frame.waitForSelector('#vsl-lab-carousel-slot [data-slot-key]', { timeout: 20000 });
console.log('✓ franja inyectada con slots');

// (A) Placement + composición del slot (texto: nombre/edad/reseña + video).
const info = await frame.evaluate(() => {
  const slot = document.getElementById('vsl-lab-carousel-slot');
  const next = slot?.nextElementSibling;
  const txt = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const first = slot?.querySelector('[data-slot-key]');
  return {
    nextIsSymptoms: (next?.textContent || '').includes('Te sientes hinchada'),
    slots: slot?.querySelectorAll('[data-slot-key]').length,
    firstSlotHasVideo: !!first?.querySelector('iframe[src*="youtube"]'),
    firstSlotText: txt(first?.querySelector('div:last-child')),
    videoMutedAutoplay: (first?.querySelector('iframe')?.getAttribute('src') || '').match(/mute=1.*autoplay=1|autoplay=1.*mute=1/) ? true : true && /mute=1/.test(first?.querySelector('iframe')?.getAttribute('src') || '') && /autoplay=1/.test(first?.querySelector('iframe')?.getAttribute('src') || ''),
  };
});
console.log('\n=== SLOT / COMPOSICIÓN ===');
console.log(JSON.stringify(info, null, 2));

// (B) Screenshot de la franja (slots con texto alineado).
await frame.evaluate(() => document.getElementById('vsl-lab-carousel-slot')?.scrollIntoView({ block: 'start' }));
await wait(1500);
await page.screenshot({ path: `${OUT}/vsl-lab-1-carousel.png` });
console.log('📸 vsl-lab-1-carousel.png');

// (C) SELECCIONAR un slot → debe activarse (badge "Con audio").
await frame.evaluate(() => {
  const t = document.querySelector('.vsl-marquee-track');
  if (t) t.style.animationPlayState = 'paused';
  const s = document.querySelector('#vsl-lab-carousel-slot [data-slot-key]');
  s?.scrollIntoView({ block: 'center' });
  s?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
});
await wait(1500);
const activeOn = await frame.getByText('Con audio').count();
await page.screenshot({ path: `${OUT}/vsl-lab-2-active.png` });
console.log(`📸 vsl-lab-2-active.png — slots con audio activo: ${activeOn} (esperado ≥1)`);

// (D) CLICK FUERA del slot (en el heading) → debe pausar+mutear (badge vuelve a "Tocar").
await frame.evaluate(() => {
  document.querySelector('#vsl-lab-carousel-slot h2')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
});
await wait(1000);
const activeAfter = await frame.getByText('Con audio').count();
await page.screenshot({ path: `${OUT}/vsl-lab-3-clickout.png` });
console.log(`📸 vsl-lab-3-clickout.png — con audio tras click-afuera: ${activeAfter} (esperado 0)`);

await browser.close();
console.log('\n✓ listo');
