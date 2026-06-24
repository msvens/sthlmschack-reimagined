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
 * address doesn't resolve, falls back to its city at runtime (via geocodes.json),
 * then to "not on the map".
 *
 * Honors Nominatim's usage policy: <=1 request/second, descriptive User-Agent,
 * sequential. INCREMENTAL — reuses any existing club-geocodes.json and only
 * queries clubs it hasn't ATTEMPTED yet. Both resolved addresses and definitive
 * no-matches are recorded (the latter as a null negative-cache entry), so a club
 * that can't be geocoded isn't re-queried on every run/deploy. Transient
 * HTTP/network failures are NOT cached, so they retry next run.
 *
 * Usage:
 *   pnpm geocode:clubs
 *   GEOCODE_LIMIT=40 pnpm geocode:clubs       # cap NEW lookups (quick test run)
 *   GEOCODE_RETRY_FAILED=1 pnpm geocode:clubs # re-attempt past no-matches
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
const RETRY_FAILED = process.env.GEOCODE_RETRY_FAILED === '1';

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
  // GeoPoint = resolved address; null = NEGATIVE cache (address didn't resolve —
  // recorded so we don't retry it every run; runtime falls back to city).
  clubs: Record<string, GeoPoint | null>;
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

/**
 * Geocode one address. Returns:
 *  - GeoPoint  → resolved
 *  - null      → DEFINITIVE no match (empty result) → safe to negative-cache
 *  - undefined → TRANSIENT failure (HTTP/network) → don't cache; retry next run
 */
async function nominatim(params: Record<string, string>): Promise<GeoPoint | null | undefined> {
  const qs = new URLSearchParams({ format: 'json', limit: '1', email: EMAIL, country: 'Sweden', ...params });
  const url = `${NOMINATIM}?${qs}`;
  // Retry transient network failures (e.g. EHOSTUNREACH) so one blip in a long
  // run doesn't abort it; give up after a few attempts and skip (re-runnable).
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) {
        console.warn(`  ! HTTP ${res.status} for ${JSON.stringify(params)}`);
        return undefined; // transient (e.g. 429/5xx) — don't negative-cache
      }
      const json = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (!json.length) return null; // definitive no match
      return { lat: round(+json[0].lat), lng: round(+json[0].lon) };
    } catch (err) {
      if (attempt === 4) {
        console.warn(`  ! network error (skipping, retry later): ${(err as Error).message}`);
        return undefined; // transient — don't negative-cache
      }
      await sleep(2000 * attempt);
    }
  }
  return undefined;
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

  // A club is "attempted" once it has any recorded entry — a resolved point OR a
  // null negative-cache marker. We skip attempted clubs so failures aren't
  // re-queried on every run. GEOCODE_RETRY_FAILED=1 re-attempts the null ones
  // (e.g. after an address is fixed upstream).
  const isAttempted = (id: number): boolean => {
    const key = String(id);
    if (!(key in out.clubs)) return false;
    if (RETRY_FAILED && out.clubs[key] === null) return false;
    return true;
  };

  const geocodable = active.filter((c) => c.street?.trim() && c.city?.trim() && !isAttempted(c.id));
  const todo = geocodable.slice(0, LIMIT);
  const noStreet = active.filter((c) => !c.street?.trim() || !c.city?.trim()).length;
  console.log(
    `${active.length} active+rating clubs — ${noStreet} lack a usable street (city fallback at runtime).`,
  );
  console.log(
    `${geocodable.length} with address & unattempted` +
      (RETRY_FAILED ? ' (retrying past failures)' : '') +
      (Number.isFinite(LIMIT) ? ` — geocoding ${todo.length} (GEOCODE_LIMIT)` : '') +
      '.',
  );

  let n = 0;
  let resolved = 0;
  let negativeCached = 0;
  let transient = 0;
  for (const club of todo) {
    n++;
    const point = await nominatim({
      street: club.street!.trim(),
      city: club.city!.trim(),
      ...(club.zipcode ? { postalcode: String(club.zipcode) } : {}),
    });
    if (point) {
      out.clubs[String(club.id)] = point;
      resolved++;
      console.log(`  [${n}/${todo.length}] ${club.name} → ${point.lat}, ${point.lng}`);
    } else if (point === null) {
      // Definitive no-match → negative-cache so we don't retry it next run.
      out.clubs[String(club.id)] = null;
      negativeCached++;
      console.log(`  [${n}/${todo.length}] ${club.name} → (no match; cached, falls back to city)`);
    } else {
      // Transient failure → leave unrecorded so it retries next run.
      transient++;
      console.log(`  [${n}/${todo.length}] ${club.name} → (transient error; will retry next run)`);
    }
    if (n % 10 === 0) save(out); // checkpoint
    await sleep(RATE_MS);
  }
  save(out);

  const entries = Object.values(out.clubs);
  const remaining = geocodable.length - todo.length;
  console.log('\nDone.');
  console.log(`  this run: ${resolved} resolved, ${negativeCached} no-match (cached), ${transient} transient (will retry).`);
  console.log(`  totals: ${entries.filter(Boolean).length} address-level, ${entries.filter((e) => e === null).length} city-fallback.`);
  if (remaining > 0) console.log(`  ${remaining} clubs still unattempted — re-run to continue.`);
  console.log(`  → ${OUT_FILE}`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
