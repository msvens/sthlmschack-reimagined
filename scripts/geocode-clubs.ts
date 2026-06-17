#!/usr/bin/env npx tsx
/**
 * Street-level geocoder for the club map (organizations page).
 *
 * Reads `public/data/clubs-by-district.json`, takes the active + rating-bearing
 * clubs (the same ~1005 set the club search shows), and geocodes each club's
 * street address via the free OpenStreetMap Nominatim service, writing
 * `public/data/club-geocodes.json` keyed by club id.
 *
 * Clubs are placed at their street address so they spread across a city instead
 * of stacking on one city-centre point. A club with no usable street, or whose
 * address doesn't resolve, is left out here — the map falls back to the club's
 * city at runtime (via geocodes.json), then to "not on the map".
 *
 * Honors Nominatim's usage policy: <=1 request/second, descriptive User-Agent,
 * sequential. INCREMENTAL — reuses any existing club-geocodes.json and only
 * fetches clubs it doesn't already have, so re-running (e.g. after a club-data
 * refresh) is cheap. See `pnpm data:refresh`.
 *
 * Usage:
 *   pnpm geocode:clubs
 *   GEOCODE_LIMIT=40 pnpm geocode:clubs   # cap NEW lookups (quick test run)
 */
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.join(__dirname, '..');
const CLUBS_FILE = path.join(ROOT, 'public', 'data', 'clubs-by-district.json');
const OUT_FILE = path.join(ROOT, 'public', 'data', 'club-geocodes.json');

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const EMAIL = process.env.GEOCODE_EMAIL || 'msvens@gmail.com';
const USER_AGENT = `sthlmschack-reimagined club geocoder (${EMAIL})`;
const RATE_MS = 1100; // >= 1s between requests per Nominatim policy
const LIMIT = process.env.GEOCODE_LIMIT ? Number(process.env.GEOCODE_LIMIT) : Infinity;

interface Membership {
  year: number;
  active: number;
}
interface Club {
  id: number;
  name: string;
  street?: string;
  zipcode?: number;
  city?: string;
  hasRatingPlayers?: number;
  districts?: Membership[];
}
interface GeoPoint {
  lat: number;
  lng: number;
}
interface ClubGeocodeData {
  generatedAt: string;
  clubs: Record<string, GeoPoint>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const round = (n: number) => Math.round(n * 1e4) / 1e4;

/** Same rule as OrganizationsContext.filterClubs({activeOnly, hasRatingPlayersOnly}). */
function isActiveRatingClub(c: Club): boolean {
  if (c.hasRatingPlayers !== 1) return false;
  if (!c.districts || c.districts.length === 0) return false;
  const recent = c.districts.reduce((a, b) => (b.year > a.year ? b : a));
  return recent.active === 1;
}

async function nominatim(params: Record<string, string>): Promise<GeoPoint | null> {
  const qs = new URLSearchParams({ format: 'json', limit: '1', email: EMAIL, country: 'Sweden', ...params });
  const url = `${NOMINATIM}?${qs}`;
  // Retry transient network failures (e.g. EHOSTUNREACH) so one blip in a long
  // run doesn't abort it; give up after a few attempts and skip (re-runnable).
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) {
        console.warn(`  ! HTTP ${res.status} for ${JSON.stringify(params)}`);
        return null;
      }
      const json = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (!json.length) return null;
      return { lat: round(+json[0].lat), lng: round(+json[0].lon) };
    } catch (err) {
      if (attempt === 4) {
        console.warn(`  ! network error (skipping, retry later): ${(err as Error).message}`);
        return null;
      }
      await sleep(2000 * attempt);
    }
  }
  return null;
}

function loadExisting(): ClubGeocodeData {
  if (fs.existsSync(OUT_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(OUT_FILE, 'utf-8')) as ClubGeocodeData;
    } catch {
      console.warn('Existing club-geocodes.json unreadable — starting fresh.');
    }
  }
  return { generatedAt: '', clubs: {} };
}

function save(data: ClubGeocodeData) {
  data.generatedAt = new Date().toISOString();
  fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2));
}

async function main() {
  const districts = JSON.parse(fs.readFileSync(CLUBS_FILE, 'utf-8')) as { clubs: Club[] }[];
  const active = districts.flatMap((d) => d.clubs).filter(isActiveRatingClub);
  const out = loadExisting();

  const geocodable = active.filter((c) => c.street?.trim() && c.city?.trim() && !out.clubs[String(c.id)]);
  const todo = geocodable.slice(0, LIMIT);
  const noStreet = active.filter((c) => !c.street?.trim() || !c.city?.trim()).length;
  console.log(
    `${active.length} active+rating clubs — ${noStreet} lack a usable street (city fallback at runtime).`,
  );
  console.log(
    `${geocodable.length} with address & uncached` +
      (Number.isFinite(LIMIT) ? ` — geocoding ${todo.length} (GEOCODE_LIMIT)` : '') +
      '.',
  );

  let n = 0;
  let failed = 0;
  for (const club of todo) {
    n++;
    const point = await nominatim({
      street: club.street!.trim(),
      city: club.city!.trim(),
      ...(club.zipcode ? { postalcode: String(club.zipcode) } : {}),
    });
    if (point) {
      out.clubs[String(club.id)] = point;
      console.log(`  [${n}/${todo.length}] ${club.name} → ${point.lat}, ${point.lng}`);
    } else {
      failed++;
      console.log(`  [${n}/${todo.length}] ${club.name} → (no match; will fall back to city)`);
    }
    if (n % 10 === 0) save(out); // checkpoint
    await sleep(RATE_MS);
  }
  save(out);

  const remaining = geocodable.length - todo.length;
  console.log('\nDone.');
  console.log(`  clubs geocoded (address-level): ${Object.keys(out.clubs).length}`);
  console.log(`  failed this run (no address match): ${failed}`);
  if (remaining > 0) console.log(`  ${remaining} clubs still uncached — re-run to continue.`);
  console.log(`  → ${OUT_FILE}`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
