#!/usr/bin/env node
/**
 * Lista companies accesibles con WHOP_API_KEY.
 * Usage: node scripts/whop-list-companies.mjs
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');

for (const file of ['.env.local', '.env']) {
  const envPath = path.join(root, file);
  if (!fs.existsSync(envPath)) continue;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const k = m[1].trim();
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

const apiKey = process.env.WHOP_API_KEY?.trim();
if (!apiKey || apiKey === 'whop_xxx') {
  console.error('Configura WHOP_API_KEY en .env.local con tu Company API key real.');
  console.error('Dashboard → Developer → Company API Keys → Create');
  process.exit(1);
}

const response = await fetch('https://api.whop.com/api/v1/companies', {
  headers: { Authorization: `Bearer ${apiKey}` },
});

const body = await response.text();
if (!response.ok) {
  console.error(`Whop API error (${response.status}):`, body);
  process.exit(1);
}

const json = JSON.parse(body);
const companies = json.data ?? [];

if (!companies.length) {
  console.log('No hay companies en la respuesta:', JSON.stringify(json, null, 2));
  process.exit(0);
}

console.log('Companies disponibles:\n');
for (const c of companies) {
  console.log(`  WHOP_COMPANY_ID=${c.id}  # ${c.title ?? c.route ?? ''}`);
}

if (companies.length === 1) {
  console.log(`\n→ Usá: WHOP_COMPANY_ID=${companies[0].id}`);
}
