'use client';

/**
 * Lays a single sheet (pairing list or standings) out across one or more A4
 * page cards: the rows are split by `paginateRows` so each `.print-page` holds
 * at most one page, making the on-screen cards match the printed pages. Each
 * sheet is self-contained — its first page carries the sheet header (tournament
 * + class + date) and the section heading; the column header repeats on every
 * page.
 */
import type { ReactNode } from 'react';
import { paginateRows } from './printStyle';

interface PrintSheetProps {
  /** Tournament + class + date block, shown on this sheet's first page. */
  sheetHeader: ReactNode;
  title: string;
  /** The `<tr>` of `<th>` column headers. */
  columnHeader: ReactNode;
  /** One `<tr>` per data row. */
  rows: ReactNode[];
  emptyMessage: string;
  fontPx: number;
}

function SheetHeading({ title }: { title: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-base font-bold">{title}</h2>
    </div>
  );
}

export function PrintSheet({
  sheetHeader,
  title,
  columnHeader,
  rows,
  emptyMessage,
  fontPx,
}: PrintSheetProps) {
  const style = { fontSize: `${fontPx}px` } as const;

  if (rows.length === 0) {
    return (
      <div className="print-page text-black" style={style}>
        {sheetHeader}
        <SheetHeading title={title} />
        <p className="text-sm text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  const slices = paginateRows(rows.length, fontPx);

  return (
    <>
      {slices.map((slice, p) => (
        <div key={p} className="print-page text-black" style={style}>
          {p === 0 && sheetHeader}
          {p === 0 && <SheetHeading title={title} />}
          <table className="w-full border-collapse">
            {/* Column header repeats on every page. */}
            <thead>{columnHeader}</thead>
            <tbody>{rows.slice(slice.start, slice.end)}</tbody>
          </table>
        </div>
      ))}
    </>
  );
}
