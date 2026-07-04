'use client';

import { Table, type TableColumn } from '@/components/Table';
import { Link } from '@/components/Link';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import type { JgpAgeClassTable, JgpStandingRow } from '@/lib/junior/jgpEngine';
import type { JgpTournamentRef } from '@/data/jgp/types';

interface Props {
  table: JgpAgeClassTable;
  /** Season tournaments, in column order — headers link to each. */
  tournaments: JgpTournamentRef[];
}

/** Integers plain, halves as .5, missing/null blank. */
function fmt(v: number | null): string {
  if (v == null) return '';
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

/**
 * One age-class standings table, rendered through the shared Table: numbered
 * column headers link to each tournament, player names to their profile, the
 * Total column is pinned right, and thicker dividers fall after ranks 10
 * (A-final) and 20 (B-final).
 */
export function JgpStandingsTable({ table, tournaments }: Props) {
  const { language } = useLanguage();
  const t = getTranslation(language);

  const columns: TableColumn<JgpStandingRow>[] = [
    {
      id: 'pos',
      header: t.pages.junior.table.pos,
      accessor: (r) => r.place,
      align: 'left',
      cellClassName: 'tabular-nums',
    },
    {
      id: 'name',
      header: t.pages.junior.table.name,
      accessor: (r) => <Link href={`/players/${r.memberId}`}>{r.name}</Link>,
      align: 'left',
      noWrap: true,
    },
    {
      id: 'club',
      header: t.pages.junior.table.club,
      accessor: (r) => r.clubName,
      align: 'left',
    },
    ...tournaments.map(
      (tourn, i): TableColumn<JgpStandingRow> => ({
        id: `t${tourn.tournamentId}`,
        header: (
          <Link href={`/results/${tourn.tournamentId}`} title={tourn.label}>
            {i + 1}
          </Link>
        ),
        accessor: (r) => fmt(r.perTournament[i]),
        align: 'right',
        headerClassName: 'tabular-nums',
        cellClassName: 'tabular-nums',
      }),
    ),
    {
      id: 'total',
      header: t.pages.junior.table.total,
      accessor: (r) => fmt(r.total),
      align: 'right',
      sticky: 'right',
      headerClassName: 'tabular-nums',
      cellClassName: 'tabular-nums font-medium text-gray-900 dark:text-gray-200',
    },
  ];

  return (
    <Table
      data={table.rows}
      columns={columns}
      getRowKey={(r) => r.memberId}
      rowDivider={(_r, i) => i === 9 || i === 19}
      density="compact"
    />
  );
}
