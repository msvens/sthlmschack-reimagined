/**
 * Side prizes ("Age & Ranking prizes") attached to a tournament group.
 *
 * The federation stores these as `TournamentClassGroupDto.prizeCategories`, a list
 * of bands with a `type` saying which dimension the band is in. The `type` values
 * are undocumented; the mapping below was derived from live data across 507
 * tournaments and is documented per-case where it is inferred rather than certain.
 *
 * Note `registrationCategories` on the same group is a DIFFERENT thing — entry
 * restrictions such as "Rankingspärr 1750+" — and is deliberately not read here.
 * The two are distinguishable by `usagetype` (1 = prize, 2 = registration).
 */
import {
  isFemale,
  getPlayerRatingByAlgorithm,
  type PrizeCategoryDto,
  type TournamentClassGroupDto,
  type TournamentEndResultDto,
} from '@/lib/api';

export const PrizeType = {
  /** Age band. `start`/`end` are ages, as `tournamentYear - birthYear`. */
  AGE: 1,
  /** Women's prize. Bounds are usually unset; when set they are a rating band. */
  WOMEN: 2,
  /**
   * Veteran. Bounds are NOT usable — observed as `0-50` in one group and `-1--1`
   * in its sister group of the same tournament. Excluded until schack.se confirm
   * the encoding.
   */
  VETERAN: 3,
  /** Rating band. `start`/`end` are Elo bounds, inclusive. */
  RATING: 4,
} as const;

/**
 * Prize types we can evaluate correctly today, in display order.
 * VETERAN is absent on purpose — see the note on {@link PrizeType.VETERAN}.
 */
export const SUPPORTED_PRIZE_TYPES: readonly number[] = [
  PrizeType.RATING,
  PrizeType.AGE,
  PrizeType.WOMEN,
];

/** A category's bounds are meaningless when unset — `0-0`, or negative. */
function hasUsableBounds(category: PrizeCategoryDto): boolean {
  const { start, end } = category;
  if (start < 0 || end < 0) return false;
  return !(start === 0 && end === 0);
}

function withinBand(value: number | null | undefined, category: PrizeCategoryDto): boolean {
  return value != null && value >= category.start && value <= category.end;
}

/** Birth year from an SSF birthdate string ("2014" or "2014-05-01"). */
function birthYearOf(birthdate: string | undefined): number | null {
  if (!birthdate) return null;
  const year = Number.parseInt(String(birthdate).slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

/**
 * A group's prize categories of one type — supported types only, sorted for display.
 * Returns an empty list for an unsupported type, so callers need no extra guard.
 */
export function prizeCategoriesOfType(
  group: TournamentClassGroupDto | null | undefined,
  type: number
): PrizeCategoryDto[] {
  if (!SUPPORTED_PRIZE_TYPES.includes(type)) return [];
  return (group?.prizeCategories ?? [])
    .filter((c) => c.type === type)
    .sort((a, b) => a.order - b.order);
}

/** Every supported type that this group actually offers, in display order. */
export function availablePrizeTypes(
  group: TournamentClassGroupDto | null | undefined
): number[] {
  return SUPPORTED_PRIZE_TYPES.filter((type) => prizeCategoriesOfType(group, type).length > 0);
}

export interface PrizeEligibilityContext {
  /** Calendar year the tournament is played in — the basis for every age band. */
  tournamentYear: number;
  /** Group ranking algorithm, so ratings match what the standings table displays. */
  rankingAlgorithm: number | null | undefined;
}

/**
 * Contender ids from `rows` eligible for `category`.
 *
 * Ratings come from `getPlayerRatingByAlgorithm` — the same call the standings
 * table uses — so a player's displayed rating and their band membership can never
 * disagree. A player with no rating (or no birthdate, for an age band) is not
 * eligible rather than being silently placed in the lowest band.
 */
export function eligibleForPrize(
  rows: readonly TournamentEndResultDto[],
  category: PrizeCategoryDto,
  { tournamentYear, rankingAlgorithm }: PrizeEligibilityContext
): Set<number> {
  const ids = new Set<number>();
  for (const row of rows) {
    // Skip the synthetic walkover/bye row (-100, birthdate 1970), which would
    // otherwise fall into low age bands.
    if (row.contenderId < 0) continue;
    const player = row.playerInfo;
    if (!player) continue;

    let eligible = false;
    switch (category.type) {
      case PrizeType.RATING:
        eligible = withinBand(
          getPlayerRatingByAlgorithm(player.elo, rankingAlgorithm).rating,
          category
        );
        break;
      case PrizeType.AGE: {
        const birthYear = birthYearOf(player.birthdate);
        eligible = birthYear != null && withinBand(tournamentYear - birthYear, category);
        break;
      }
      case PrizeType.WOMEN:
        // Bounds are usually unset; when present they narrow the prize to a
        // rating band on top of being a woman (live example: "Dampris 1400-2500").
        eligible =
          isFemale(player) &&
          (!hasUsableBounds(category) ||
            withinBand(getPlayerRatingByAlgorithm(player.elo, rankingAlgorithm).rating, category));
        break;
      default:
        eligible = false; // unsupported type — never matches
    }
    if (eligible) ids.add(row.contenderId);
  }
  return ids;
}

/** Display label for a category: "R1 (1575–1718)", or just the name when unbounded. */
export function prizeCategoryLabel(category: PrizeCategoryDto): string {
  const name = category.name?.trim();
  if (!hasUsableBounds(category)) return name || '?';
  const band = `${category.start}–${category.end}`;
  return name ? `${name} (${band})` : band;
}
