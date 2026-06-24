#!/usr/bin/env npx tsx
/**
 * Builds public/data/geocodes.json for the calendar map view from the GeoNames
 * Sweden gazetteer (free, CC BY 4.0). Run ONCE — Swedish geography doesn't
 * change, so there's nothing to refresh on a schedule.
 *
 * The committed table covers every Swedish municipality/admin area + every city
 * that has a chess club (from clubs-by-district.json). Tournaments are placed by
 * their own `city` against this table (see geocodeLoader.ts), so a tournament in
 * "Järfälla" lands on Järfälla, not Stockholm. Municipalities are included so a
 * tournament city with no club still resolves.
 *
 * Also prints a data-quality report: club `city` values that match no Swedish
 * place (placeholders like "x"/"abc", misspellings, street addresses stuffed
 * into the city field, foreign towns).
 *
 * Usage: pnpm geocode:build
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';

const ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'public', 'data', 'geocodes.json');
const CLUBS_FILE = path.join(ROOT, 'public', 'data', 'clubs-by-district.json');
const GEONAMES_URL = 'https://download.geonames.org/export/dump/SE.zip';

const norm = (s?: string) => (s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
const round = (n: number) => Math.round(n * 1e4) / 1e4;
// Prefer a real city centre over a generic locality when names collide.
const PRIORITY: Record<string, number> = { PPLC: 6, PPLA: 5, PPLA2: 4, PPLA3: 3, PPLX: 2, PPL: 1 };

interface GeoEntry {
  lat: number;
  lng: number;
  prio: number;
}

async function downloadGeonames(): Promise<string> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'geonames-'));
  const zip = path.join(dir, 'SE.zip');
  console.log(`Downloading ${GEONAMES_URL} …`);
  const res = await fetch(GEONAMES_URL, {
    headers: { 'User-Agent': 'sthlmschack-reimagined geocode build (msvens@gmail.com)' },
  });
  if (!res.ok) throw new Error(`GeoNames HTTP ${res.status}`);
  fs.writeFileSync(zip, Buffer.from(await res.arrayBuffer()));
  execSync(`unzip -o "${zip}" -d "${dir}"`, { stdio: 'ignore' });
  return path.join(dir, 'SE.txt');
}

/** Index populated places (P) + admin areas (A) by every name they're known by. */
function buildIndex(txtPath: string) {
  const all = new Map<string, GeoEntry>(); // any place, best by priority
  const admin = new Map<string, GeoEntry>(); // admin/municipality names only
  for (const line of fs.readFileSync(txtPath, 'utf-8').split('\n')) {
    const c = line.split('\t');
    const cls = c[6];
    if (cls !== 'P' && cls !== 'A') continue;
    const lat = round(+c[4]);
    const lng = round(+c[5]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) continue;
    const code = c[7]; // feature code (col 7; col 8 is the country code)
    const prio = PRIORITY[code] ?? 0;
    // For no-club coverage we only need counties + municipalities (ADM1/ADM2);
    // ADM3/ADM4 parishes are thousands of rows and just bloat the table.
    const isMunicipality = cls === 'A' && (code === 'ADM1' || code === 'ADM2');
    const names = new Set([norm(c[1]), norm(c[2]), ...(c[3] ? c[3].split(',').map(norm) : [])]);
    for (const k of names) {
      if (!k) continue;
      const prev = all.get(k);
      if (!prev || prio > prev.prio) all.set(k, { lat, lng, prio });
      if (isMunicipality && !admin.has(k)) admin.set(k, { lat, lng, prio });
    }
  }
  return { all, admin };
}

async function main() {
  if (!fs.existsSync(CLUBS_FILE)) {
    console.error(`\n  ✖ Missing ${path.relative(ROOT, CLUBS_FILE)} — run \`pnpm data:clubs\` first.\n`);
    process.exit(1);
  }
  const txtPath = await downloadGeonames();
  const { all, admin } = buildIndex(txtPath);

  const cities: Record<string, { lat: number; lng: number }> = {};
  // 1. Every municipality / admin area, so a tournament city with no club still maps.
  for (const [k, e] of admin) cities[k] = { lat: e.lat, lng: e.lng };

  // 2. Every chess-club city that matches a Swedish place (city-centre coords win).
  const districts = JSON.parse(fs.readFileSync(CLUBS_FILE, 'utf-8')) as { clubs: { city?: string }[] }[];
  const clubCities = new Map<string, { display: string; count: number }>();
  for (const club of districts.flatMap((d) => d.clubs)) {
    if (club.city && club.city.trim()) {
      const k = norm(club.city);
      const e = clubCities.get(k) ?? { display: club.city.trim(), count: 0 };
      e.count++;
      clubCities.set(k, e);
    }
  }
  let matched = 0;
  const unmatched: { display: string; count: number }[] = [];
  for (const [k, e] of clubCities) {
    const hit = all.get(k);
    if (hit) {
      cities[k] = { lat: hit.lat, lng: hit.lng };
      matched++;
    } else {
      unmatched.push(e);
    }
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), cities }, null, 2));

  // --- Data-quality report ---
  unmatched.sort((a, b) => b.count - a.count);
  const isJunk = (s: string) =>
    s.length <= 3 || !/[a-zåäöéü]/i.test(s) || ['island', 'norge', 'finland', 'danmark', 'norway'].includes(norm(s));
  const junk = unmatched.filter((e) => isJunk(e.display));
  const real = unmatched.filter((e) => !isJunk(e.display));

  console.log(`\nWrote ${Object.keys(cities).length} places → ${OUT_FILE}`);
  console.log(`Club cities matched: ${matched}/${clubCities.size} (${((100 * matched) / clubCities.size).toFixed(1)}%)`);
  console.log(`\nData-quality report — ${unmatched.length} club cities matched no Swedish place:`);
  console.log(
    `  • ${junk.length} placeholder/foreign (${junk.reduce((s, e) => s + e.count, 0)} clubs): ` +
      junk
        .slice(0, 10)
        .map((e) => `"${e.display}"×${e.count}`)
        .join(', '),
  );
  console.log(`  • ${real.length} real-looking (misspellings / addresses-in-city-field / neighborhoods):`);
  for (const e of real.slice(0, 25)) console.log(`      ${String(e.count).padStart(3)}× "${e.display}"`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
