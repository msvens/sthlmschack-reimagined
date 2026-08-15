/**
 * Presentation of a group's side prizes ("Age & Ranking prizes").
 *
 * The federation's encoding and the player matching both live in the SDK —
 * `PrizeCategoryType`, `parsePrizeCategory`, `resolvePrizeMembers`. What stays
 * here is the app's own concerns: which types get a dropdown, in what order,
 * under what heading, and how a category reads as a label.
 *
 * Note `registrationCategories` on the same group is a DIFFERENT thing — entry
 * restrictions such as "Rankingspärr 1750+" — sharing the same DTO shape and
 * distinguished only by `usagetype`. `isPrizeCategory` keeps them apart.
 */
import {
  PrizeCategoryType,
  isPrizeCategory,
  parsePrizeCategory,
  type PrizeCategoryDto,
  type TournamentClassGroupDto,
} from '@/lib/api';
import type { Translations } from '@/lib/translations';

/**
 * Prize types we render a dropdown for, in display order.
 *
 * SMCLASS is excluded deliberately: it only ever appears as a registration
 * restriction, never as a prize. A const tuple rather than `readonly number[]`
 * so {@link PRIZE_TYPE_TITLE_KEY} can be checked for exhaustiveness.
 */
export const SUPPORTED_PRIZE_TYPES = [
  PrizeCategoryType.RATING,
  PrizeCategoryType.AGE,
  PrizeCategoryType.WOMEN,
  PrizeCategoryType.SENIOR,
] as const;

export type SupportedPrizeType = (typeof SUPPORTED_PRIZE_TYPES)[number];

type PrizeTitles = Translations['pages']['tournamentResults']['prizeCategories'];

/**
 * Dropdown heading per supported prize type.
 *
 * Total by construction: adding a type to {@link SUPPORTED_PRIZE_TYPES} without a
 * heading fails to compile, and so does a translation key that doesn't exist.
 * This replaced a ternary whose implicit `else` was the women's heading, so
 * adding a fourth type would have labelled every senior dropdown "Dampriser".
 */
export const PRIZE_TYPE_TITLE_KEY = {
  [PrizeCategoryType.RATING]: 'ratingPrizes',
  [PrizeCategoryType.AGE]: 'agePrizes',
  [PrizeCategoryType.WOMEN]: 'womenPrizes',
  [PrizeCategoryType.SENIOR]: 'seniorPrizes',
} as const satisfies Record<SupportedPrizeType, Exclude<keyof PrizeTitles, 'all'>>;

function isSupportedPrizeType(type: number): type is SupportedPrizeType {
  return (SUPPORTED_PRIZE_TYPES as readonly number[]).includes(type);
}

/**
 * A group's prize categories of one type — prizes only, sorted for display.
 *
 * Returns an empty list for an unsupported type, so callers need no extra guard.
 * The `isPrizeCategory` filter matters: `resolvePrizeMembers` returns nobody for
 * a registration category, so without it a stray one would render a dropdown
 * option that selects an always-empty table.
 */
export function prizeCategoriesOfType(
  group: TournamentClassGroupDto | null | undefined,
  type: number
): PrizeCategoryDto[] {
  if (!isSupportedPrizeType(type)) return [];
  return (group?.prizeCategories ?? [])
    .filter((c) => c.type === type && isPrizeCategory(c))
    .sort((a, b) => a.order - b.order);
}

/** Every supported type this group actually offers, in display order. */
export function availablePrizeTypes(
  group: TournamentClassGroupDto | null | undefined
): SupportedPrizeType[] {
  return SUPPORTED_PRIZE_TYPES.filter((type) => prizeCategoriesOfType(group, type).length > 0);
}

/**
 * Look up a category the app would actually offer.
 *
 * Guards against a selection surviving a group change — this page stays mounted
 * across `groupId` changes, so a stale id must not resolve against the new
 * group's list, nor against a type we don't render.
 */
export function findPrizeCategory(
  group: TournamentClassGroupDto | null | undefined,
  categoryId: number | null
): PrizeCategoryDto | null {
  if (categoryId == null) return null;
  return (
    (group?.prizeCategories ?? []).find(
      (c) => c.id === categoryId && isPrizeCategory(c) && isSupportedPrizeType(c.type)
    ) ?? null
  );
}

/** A band reads as "1575–1718"; null when the bounds are unset or negative. */
function bandText(min: number, max: number): string | null {
  if (min < 0 || max < 0) return null;
  if (min === 0 && max === 0) return null;
  return `${min}–${max}`;
}

/**
 * Display label for a category: "R1 (1575–1718)", or just the name.
 *
 * The band is shown only where it is actually the rule. A women's prize matches
 * every woman and a senior prize is age ≥ 60, so any bounds those carry are
 * decorative — printing them would caption a table with a range it doesn't obey
 * (live: "Dampris 1400–2500" listing an unrated woman, "Veteran 0–50" for a 66
 * year old).
 */
export function prizeCategoryLabel(category: PrizeCategoryDto): string {
  const name = category.name?.trim();
  const rule = parsePrizeCategory(category);
  const band =
    rule.kind === 'rating'
      ? bandText(rule.min, rule.max)
      : rule.kind === 'age'
        ? bandText(rule.minAge, rule.maxAge)
        : null;
  if (!band) return name || '?';
  return name ? `${name} (${band})` : band;
}
