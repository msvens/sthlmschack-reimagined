'use client';

/**
 * Renders the print document as a sequence of A4 page cards. Each group yields a
 * pairing sheet then a standings sheet; each sheet is self-contained — it opens
 * with the tournament header (+ class when the tournament has several) and its
 * section title ("Rond X – Group" / "Ställning – Group"). The group name is only
 * appended when its class has several groups, mirroring the detail page's
 * hasMultipleClasses / hasMultipleGroups. Always light — theme-independent.
 */
import type { ReactNode } from 'react';
import { PairingSheet } from './PairingSheet';
import { StandingsSheet } from './StandingsSheet';
import { TeamPairingSheet } from './TeamPairingSheet';
import { TeamStandingsSheet } from './TeamStandingsSheet';
import { effectiveFontPx, type FontMode } from './printStyle';
import type { PrintData, PrintGroupData } from './printData';
import type { TournamentDto, TournamentRoundResultDto } from '@/lib/api';

interface PrintableTournamentProps {
  data: PrintData;
  round: number;
  fontMode: FontMode;
  auto: boolean;
}

function teamMatchCount(rows: TournamentRoundResultDto[], round: number): number {
  const seen = new Set<string>();
  rows
    .filter((r) => (r.roundNr || 1) === round)
    .forEach((r) => seen.add(`${r.homeId}-${r.homeTeamNumber}-${r.awayId}-${r.awayTeamNumber}`));
  return seen.size;
}

function pairingRowCount(g: PrintGroupData, round: number): number {
  return g.kind === 'team'
    ? teamMatchCount(g.roundResults, round)
    : g.roundResults.filter((r) => (r.roundNr || 1) === round).length;
}

function standingsRowCount(g: PrintGroupData): number {
  return g.kind === 'team' ? g.teamStandings.length : g.standings.length;
}

/** Tournament + class + date/location block shown atop each sheet's first page. */
function sheetHeaderFor(tournament: TournamentDto, g: PrintGroupData): ReactNode {
  const title =
    g.multipleClasses && g.className ? `${tournament.name} – ${g.className}` : tournament.name;
  return (
    <header className="mb-3">
      <h1 className="text-lg font-bold">{title}</h1>
      <div className="text-xs text-gray-700">
        {tournament.start} – {tournament.end}
        {tournament.city ? ` · ${tournament.city}` : ''}
      </div>
    </header>
  );
}

export function PrintableTournament({ data, round, fontMode, auto }: PrintableTournamentProps) {
  const { tournament, groups } = data;
  const sheets: ReactNode[] = [];

  groups.forEach((g) => {
    const header = sheetHeaderFor(tournament, g);
    const groupSuffix = g.multipleGroups ? g.group.name : '';
    const pairingFont = effectiveFontPx(fontMode, auto, pairingRowCount(g, round));
    const standingsFont = effectiveFontPx(fontMode, auto, standingsRowCount(g));

    if (g.kind === 'team') {
      sheets.push(
        <TeamPairingSheet
          key={`tp-${g.group.id}`}
          round={round}
          boardRows={g.roundResults}
          teamStandings={g.teamStandings}
          fontPx={pairingFont}
          sheetHeader={header}
          groupSuffix={groupSuffix}
        />,
        <TeamStandingsSheet
          key={`ts-${g.group.id}`}
          standings={g.teamStandings}
          fontPx={standingsFont}
          sheetHeader={header}
          groupSuffix={groupSuffix}
        />,
      );
    } else {
      sheets.push(
        <PairingSheet
          key={`p-${g.group.id}`}
          round={round}
          pairings={g.roundResults}
          playerMap={g.playerMap}
          rankingAlgorithm={g.group.rankingAlgorithm}
          fontPx={pairingFont}
          sheetHeader={header}
          groupSuffix={groupSuffix}
        />,
        <StandingsSheet
          key={`s-${g.group.id}`}
          standings={g.standings}
          fontPx={standingsFont}
          sheetHeader={header}
          groupSuffix={groupSuffix}
        />,
      );
    }
  });

  return <div className="print-document">{sheets}</div>;
}
