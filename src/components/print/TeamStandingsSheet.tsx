'use client';

/** Team standings ("Ställning – Group"): rank · team · match points · board points. */
import { useLanguage } from '@/context/LanguageContext';
import { useOrganizations } from '@/context/OrganizationsContext';
import { getTranslation } from '@/lib/translations';
import { createTeamNameFormatter, type TeamTournamentEndResultDto } from '@/lib/api';
import { PrintSheet } from './PrintSheet';
import type { PrintSheetCommon } from './sheetTypes';

interface TeamStandingsSheetProps extends PrintSheetCommon {
  standings: TeamTournamentEndResultDto[];
}

export function TeamStandingsSheet({ standings, fontPx, sheetHeader, groupSuffix }: TeamStandingsSheetProps) {
  const { language } = useLanguage();
  const { getClubName } = useOrganizations();
  const t = getTranslation(language);
  const print = t.pages.tournamentResults.print;

  const formatTeamName = createTeamNameFormatter(standings, getClubName);
  const data = [...standings].sort((a, b) => a.place - b.place);

  const columnHeader = (
    <tr className="border-b-2 border-black text-left">
      <th className="w-8 py-1 pr-2 text-right">{print.rank}</th>
      <th className="py-1 pr-2">{print.team}</th>
      <th className="w-16 py-1 pr-2 text-right">{print.matchPoints}</th>
      <th className="w-16 py-1 text-right">{print.boardPoints}</th>
    </tr>
  );

  const rows = data.map((r) => (
    <tr key={`${r.contenderId}-${r.teamNumber}`} className="border-b border-gray-300">
      <td className="py-0.5 pr-2 text-right tabular-nums">{r.place}</td>
      <td className="py-0.5 pr-2">{formatTeamName(r.contenderId, r.teamNumber)}</td>
      <td className="py-0.5 pr-2 text-right font-semibold tabular-nums">{r.points}</td>
      <td className="py-0.5 text-right tabular-nums">{r.secPoints?.toFixed(1)}</td>
    </tr>
  ));

  const title = groupSuffix ? `${print.standings} – ${groupSuffix}` : print.standings;

  return (
    <PrintSheet
      sheetHeader={sheetHeader}
      title={title}
      columnHeader={columnHeader}
      rows={rows}
      emptyMessage={print.noStandings}
      fontPx={fontPx}
    />
  );
}
