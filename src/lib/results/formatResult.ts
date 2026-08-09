/**
 * Rendering of SDK result codes into display strings.
 *
 * The SDK hands back structure (`ParsedResultDisplay`: numeric scores plus a
 * `kind`); the labels and the score formatting are ours, so they can be
 * translated and kept consistent across every view that shows a result.
 *
 * `w.o` is deliberately NOT translated — it is universal chess notation.
 */
import {
  parseResultDisplay,
  resolveIndividualResult,
  type ParsedResultDisplay,
  type TournamentRoundResultDto,
} from '@/lib/api';
import type { Translations } from '@/lib/translations';

/** Universal chess notation for a walkover — intentionally not translated. */
const WALKOVER_SUFFIX = 'w.o';

export interface ResultLabels {
  /** Standalone label for a postponed game (it has no score). */
  postponed: string;
  /** Suffix for an adjudicated result, e.g. "0 - 0 avbruten". */
  adjudicated: string;
  /** Suffix for a half-point tourist bye, e.g. "½ Frirond". */
  bye: string;
  /** Shown when there is no usable result. */
  noResult: string;
}

/** Collect the result labels from a translation bundle. */
export function getResultLabels(t: Translations): ResultLabels {
  const tr = t.pages.tournamentResults;
  return {
    postponed: tr.postponed,
    adjudicated: tr.adjudicated,
    bye: tr.bye,
    noResult: '-',
  };
}

/** Render a point value: half points as ½, everything else as-is. */
export function formatScore(points: number): string {
  return points === 0.5 ? '½' : String(points);
}

/**
 * Render a parsed result. Scores come from the SDK as numbers in the result's
 * own point system, so this works unchanged for Schackfyran (3-2-1) and the
 * 3-1-0 system.
 */
export function formatResult(parsed: ParsedResultDisplay, labels: ResultLabels): string {
  const { home, away, kind } = parsed;

  if (kind === 'postponed') return labels.postponed;
  // 'none' means NOT_SET, an unknown code, or a 0-0 points fallback.
  if (kind === 'none' || home === null || away === null) return labels.noResult;

  // A tourist bye is one-sided: the player is awarded the draw value, there is
  // no opponent score to show.
  if (kind === 'tourist_bye') return `${formatScore(home)} ${labels.bye}`;

  const score = `${formatScore(home)} - ${formatScore(away)}`;
  if (kind === 'walkover') return `${score} ${WALKOVER_SUFFIX}`;
  if (kind === 'adjudicated') return `${score} ${labels.adjudicated}`;
  return score;
}

/** Render a single result code (one game/board). */
export function formatResultCode(resultCode: number, labels: ResultLabels): string {
  return formatResult(parseResultDisplay(resultCode), labels);
}

/**
 * Render an individually-paired round row.
 *
 * Prefers the game's result code and falls back to the row's points when that
 * code is `NOT_SET` or unknown — so a legitimately zero result (a double
 * forfeit, an adjudicated 0-0) is no longer flattened to "-".
 *
 * Do not pass a team match row: use `resolveTeamMatchResult` for those.
 */
export function formatIndividualRowResult(
  row: Pick<TournamentRoundResultDto, 'homeResult' | 'awayResult' | 'games'>,
  labels: ResultLabels
): string {
  return formatResult(resolveIndividualResult(row), labels);
}
