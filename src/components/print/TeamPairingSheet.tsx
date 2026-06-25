'use client';

/** Team pairing sheet ("Rond X – Group"): the round's matches (home vs away + score). */
import { useLanguage } from '@/context/LanguageContext';
import { useOrganizations } from '@/context/OrganizationsContext';
import { getTranslation } from '@/lib/translations';
import {
  createTeamNameFormatter,
  type TournamentRoundResultDto,
  type TeamTournamentEndResultDto,
} from '@/lib/api';
import { PrintSheet } from './PrintSheet';
import type { PrintSheetCommon } from './sheetTypes';

interface TeamPairingSheetProps extends PrintSheetCommon {
  round: number;
  boardRows: TournamentRoundResultDto[];
  teamStandings: TeamTournamentEndResultDto[];
}

interface TeamMatch {
  homeId: number;
  homeTeamNumber: number;
  awayId: number;
  awayTeamNumber: number;
  homeScore: number;
  awayScore: number;
}

export function TeamPairingSheet({
  round,
  boardRows,
  teamStandings,
  fontPx,
  sheetHeader,
  groupSuffix,
}: TeamPairingSheetProps) {
  const { language } = useLanguage();
  const { getClubName } = useOrganizations();
  const t = getTranslation(language);
  const print = t.pages.tournamentResults.print;
  const rb = t.pages.tournamentResults.roundByRound;

  const formatTeamName = createTeamNameFormatter(teamStandings, getClubName);

  const matches: TeamMatch[] = [];
  boardRows
    .filter((r) => (r.roundNr || 1) === round)
    .forEach((r) => {
      const key = `${r.homeId}-${r.homeTeamNumber}-${r.awayId}-${r.awayTeamNumber}`;
      let m = matches.find(
        (x) => `${x.homeId}-${x.homeTeamNumber}-${x.awayId}-${x.awayTeamNumber}` === key,
      );
      if (!m) {
        m = {
          homeId: r.homeId,
          homeTeamNumber: r.homeTeamNumber,
          awayId: r.awayId,
          awayTeamNumber: r.awayTeamNumber,
          homeScore: 0,
          awayScore: 0,
        };
        matches.push(m);
      }
      m.homeScore += r.homeResult || 0;
      m.awayScore += r.awayResult || 0;
    });

  const score = (m: TeamMatch) =>
    m.homeScore === 0 && m.awayScore === 0 ? '' : `${m.homeScore} – ${m.awayScore}`;

  const columnHeader = (
    <tr className="border-b-2 border-black text-left">
      <th className="w-8 py-1 pr-2 text-right">{rb.table}</th>
      <th className="py-1 pr-2">{print.home}</th>
      <th className="py-1 pr-2">{print.away}</th>
      <th className="w-16 py-1 text-center">{rb.result}</th>
    </tr>
  );

  const rows = matches.map((m, i) => (
    <tr
      key={`${m.homeId}-${m.homeTeamNumber}-${m.awayId}-${m.awayTeamNumber}`}
      className="border-b border-gray-300"
    >
      <td className="py-0.5 pr-2 text-right tabular-nums">{i + 1}</td>
      <td className="py-0.5 pr-2">{formatTeamName(m.homeId, m.homeTeamNumber)}</td>
      <td className="py-0.5 pr-2">{formatTeamName(m.awayId, m.awayTeamNumber)}</td>
      <td className="py-0.5 text-center tabular-nums">{score(m)}</td>
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
