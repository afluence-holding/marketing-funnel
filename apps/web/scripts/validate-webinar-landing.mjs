// Validates the German webinar landing by replicating the raw route transform
// (webinar/raw/route.ts) exactly, then asserting branding + ingestion integrity.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(HERE, '..');
const file = path.join(WEB, 'src/app/(landings)/german-roz/webinar/landing.html');
let html = fs.readFileSync(file, 'utf-8');

// Mirror webinar-config.ts + raw/route.ts replacements
const W = {
  dateShort: 'Mié 10 de junio', timeLabel: '8:00 PM Perú', dateIso: '2026-06-10',
  time: '20:00', timezone: 'America/Lima',
};
html = html.replace(/__WHATSAPP_GROUP_URL__/g, 'https://chat.whatsapp.com/test');
html = html.replace(/__CALENDAR_URL__/g, 'https://calendar.google.com/test');
html = html.replace(/__WEBINAR_DATE__/g, `${W.dateShort} · ${W.timeLabel}`);
html = html.replace(/__WEBINAR_DATE_ISO__/g, W.dateIso);
html = html.replace(/__WEBINAR_TIME__/g, W.time);
html = html.replace(/__WEBINAR_TZ__/g, W.timezone);

let fail = 0;
const ok = (label, cond) => { console.log(`  ${cond ? 'PASS' : 'FAIL'} ${label}`); if (!cond) fail++; };

console.log('== Branding (DESINFLÁMATE) ==');
ok('Plus Jakarta Sans font link', /fonts\.googleapis\.com\/css2\?family=Plus\+Jakarta\+Sans/.test(html));
ok('font-family applied', /font-family:'Plus Jakarta Sans'/.test(html));
ok('lockup DESINFLÁMATE!', /class="di-mark">DESINFLÁMATE!/.test(html));
ok('lockup sub con Germán Roz', /class="di-sub">con Germán Roz/.test(html));
ok('orange brand token #FF5722', /--orange:#FF5722/.test(html));
ok('CTA uses orange', /\.btn\{[^}]*background:var\(--orange\)/.test(html));
ok('navy ink token #303841', /--ink:#303841/.test(html));

console.log('\n== Photo (Caro-style intro) ==');
ok('intro-hero block', /class="intro-hero"/.test(html));
ok('intro-photo + german avatar', /class="intro-photo"[\s\S]*?\/german-roz\/german-avatar\.jpg/.test(html));
ok('intro-copy block', /class="intro-copy"/.test(html));

console.log('\n== Ingestion intact (must NOT break) ==');
ok("INGEST_PATH", html.includes("INGEST_PATH = '/api/german-roz/ingest'"));
ok("FORM_SOURCE", html.includes("FORM_SOURCE = 'landing-german-roz-webinar-2026-06-10'"));
ok("channel inbound", /channel:'inbound'/.test(html));
ok('buildIngestPayload()', /function buildIngestPayload\(\)/.test(html));
ok('async finish()', /async function finish\(\)/.test(html));
ok("WA_POOL_KEY", html.includes("WA_POOL_KEY = 'webinar-2026-06-10'"));
ok('field id f-name', /id="f-name"/.test(html));
ok('field id f-mail', /id="f-mail"/.test(html));
ok('field id f-cc', /id="f-cc"/.test(html));
ok('field id f-wa', /id="f-wa"/.test(html));
ok('gateBtn onclick finish', /id="gateBtn"[^>]*onclick="finish\(\)"/.test(html));
ok('start() onclick present', /onclick="start\(\)"/.test(html));
ok('customFields creator german-roz', /creator:'german-roz'/.test(html));
ok('8 quiz QUESTIONS ids', ['etapa','objetivo','energia','hinchazon','antojos','comer','dietas','frustra'].every((id) => html.includes(`id:"${id}"`)));

console.log('\n== Placeholders replaced (no leftover tokens) ==');
ok('no __WEBINAR_ leftovers', !/__WEBINAR_[A-Z]/.test(html));
ok('no __WHATSAPP/__CALENDAR leftovers', !/__WHATSAPP_GROUP_URL__|__CALENDAR_URL__/.test(html));

console.log('\n== HTML tag balance ==');
const count = (re) => (html.match(re) || []).length;
const pairs = [
  ['<section', /<section/g, /<\/section>/g],
  ['<style>', /<style>/g, /<\/style>/g],
  ['<script', /<script/g, /<\/script>/g],
  ['<header', /<header/g, /<\/header>/g],
];
for (const [name, open, close] of pairs) {
  const o = count(open), c = count(close);
  ok(`${name} balanced (${o}/${c})`, o === c);
}
// div balance (excluding self-closing none here)
ok(`<div> balanced`, count(/<div[\s>]/g) === count(/<\/div>/g));

console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
