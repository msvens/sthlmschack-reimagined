'use client';

/** Standings sheet ("Ställning – Group"): rank · name · points · tiebreak. */
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { formatPlayerName, type TournamentEndResultDto } from '@/lib/api';
import { PrintSheet } from './PrintSheet';
import type { PrintSheetCommon } from './sheetTypes';

interface StandingsSheetProps extends PrintSheetCommon {
  standings: TournamentEndResultDto[];
}

export function StandingsSheet({ standings, fontPx, sheetHeader, groupSuffix }: StandingsSheetProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const print = t.pages.tournamentResults.print;

  const data = [...standings].sort((a, b) => a.place - b.place);

  const columnHeader = (
    <tr className="border-b-2 border-black text-left">
      <th className="w-8 py-1 pr-2 text-right">{print.rank}</th>
      <th className="py-1 pr-2">{print.name}</th>
      <th className="w-16 py-1 pr-2 text-right">{print.points}</th>
      <th className="w-16 py-1 text-right">{print.tiebreak}</th>
    </tr>
  );

  const rows = data.map((r) => (
    <tr key={r.contenderId} className="border-b border-gray-300">
      <td className="py-0.5 pr-2 text-right tabular-nums">{r.place}</td>
      <td className="py-0.5 pr-2">
        {r.playerInfo
          ? formatPlayerName(r.playerInfo.firstName, r.playerInfo.lastName, r.playerInfo.elo?.title)
          : `${print.name} ${r.contenderId}`}
      </td>
      <td className="py-0.5 pr-2 text-right font-semibold tabular-nums">{r.points}</td>
      <td className="py-0.5 text-right tabular-nums">{r.secPoints.toFixed(1)}</td>
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
