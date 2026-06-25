'use client';

/**
 * Pairing sheet ("Rond X – Group") for a group + round: board, White (+Elo),
 * Black (+Elo), result. Builds the column header + row list and hands layout +
 * A4 pagination to PrintSheet. Result is blank before a round is played.
 */
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import {
  getOpponentKind,
  getResultDisplayString,
  formatPlayerName,
  getPlayerRatingByAlgorithm,
  formatRatingWithType,
  type TournamentRoundResultDto,
  type PlayerInfoDto,
} from '@/lib/api';
import { PrintSheet } from './PrintSheet';
import type { PrintSheetCommon } from './sheetTypes';

interface PairingSheetProps extends PrintSheetCommon {
  round: number;
  pairings: TournamentRoundResultDto[];
  playerMap: Map<number, PlayerInfoDto>;
  rankingAlgorithm: number | null;
}

export function PairingSheet({
  round,
  pairings,
  playerMap,
  rankingAlgorithm,
  fontPx,
  sheetHeader,
  groupSuffix,
}: PairingSheetProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const print = t.pages.tournamentResults.print;
  const rb = t.pages.tournamentResults.roundByRound;

  const data = pairings
    .filter((p) => (p.roundNr || 1) === round)
    .sort((a, b) => (a.board || 0) - (b.board || 0));

  const playerName = (id: number): string => {
    const kind = getOpponentKind(id);
    if (kind === 'walkover') return 'W.O';
    if (kind === 'bye') return t.pages.tournamentResults.bye;
    const p = playerMap.get(id);
    return p ? formatPlayerName(p.firstName, p.lastName, p.elo?.title) : `${rb.white} ${id}`;
  };
  const playerElo = (id: number): string => {
    const p = playerMap.get(id);
    if (!p) return '';
    const { rating, ratingType } = getPlayerRatingByAlgorithm(p.elo, rankingAlgorithm);
    return formatRatingWithType(rating, ratingType, language);
  };
  const resultStr = (p: TournamentRoundResultDto): string => {
    if (p.homeResult === 0 && p.awayResult === 0) return '';
    const code = p.games?.[0]?.result;
    return code !== undefined ? getResultDisplayString(code) : `${p.homeResult} - ${p.awayResult}`;
  };

  const columnHeader = (
    <tr className="border-b-2 border-black text-left">
      <th className="w-8 py-1 pr-2 text-right">{rb.table}</th>
      <th className="py-1 pr-2">{rb.white}</th>
      <th className="w-14 py-1 pr-2 text-right">{rb.elo}</th>
      <th className="py-1 pr-2">{rb.black}</th>
      <th className="w-14 py-1 pr-2 text-right">{rb.elo}</th>
      <th className="w-16 py-1 text-center">{rb.result}</th>
    </tr>
  );

  const rows = data.map((p) => (
    <tr key={p.id} className="border-b border-gray-300">
      <td className="py-0.5 pr-2 text-right tabular-nums">{p.board || '-'}</td>
      <td className="py-0.5 pr-2">{playerName(p.homeId)}</td>
      <td className="py-0.5 pr-2 text-right tabular-nums">{playerElo(p.homeId)}</td>
      <td className="py-0.5 pr-2">{playerName(p.awayId)}</td>
      <td className="py-0.5 pr-2 text-right tabular-nums">{playerElo(p.awayId)}</td>
      <td className="py-0.5 text-center tabular-nums">{resultStr(p)}</td>
    </tr>
  ));

  const title = groupSuffix ? `${rb.round} ${round} – ${groupSuffix}` : `${rb.round} ${round}`;

  return (
    <PrintSheet
      sheetHeader={sheetHeader}
      title={title}
      columnHeader={columnHeader}
      rows={rows}
      emptyMessage={print.noPairings}
      fontPx={fontPx}
    />
  );
}
