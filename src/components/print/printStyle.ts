/**
 * Print sizing + pagination for the tournament print sheets.
 *
 * Font size is a printer-chosen MODE (small/medium/large) used as a hint. When
 * "auto" is on, an intelligence cap keeps very large tables from ballooning to
 * many pages (e.g. a 100-player standings won't be printed at 16px across 10
 * pages — it's capped to a smaller size). With auto off, the mode wins outright.
 *
 * The on-screen `.print-page` cards must reflect the printed A4 pages, so we
 * paginate the rows ourselves: `paginateRows` returns the row slices per page,
 * computed from an A4 geometry. Sizes are in CSS px (1px = 1/96in), which maps
 * to physical mm in print, so the same math holds on screen and on paper.
 */

export type FontMode = 'small' | 'medium' | 'large';

/** Preferred font size (px) per mode — the printer's hint. */
const MODE_PX: Record<FontMode, number> = { small: 11, medium: 13, large: 16 };

/**
 * The largest font we'll allow for a given row count when auto is on, so a huge
 * table doesn't balloon to many pages. Tunable.
 */
function autoCapPx(rowCount: number): number {
  if (rowCount <= 30) return 16;
  if (rowCount <= 45) return 14;
  if (rowCount <= 60) return 12;
  if (rowCount <= 90) return 11;
  return 10;
}

/** Effective font size for a sheet, given the mode, the auto switch, and rows. */
export function effectiveFontPx(mode: FontMode, auto: boolean, rowCount: number): number {
  return auto ? Math.min(MODE_PX[mode], autoCapPx(rowCount)) : MODE_PX[mode];
}

// --- A4 geometry (px ≈ 1/96in; matches physical mm when printed) -------------
// A4 content height inside 14mm margins is ~1016px; use a slightly smaller
// value as a safety buffer so a card never overflows its physical page.
const USABLE_PAGE_PX = 1000;
const SECTION_HEADING_PX = 32; // the section h2 ("Rond X – Group") + margin
const SHEET_HEADER_PX = 56; // tournament + class + date block (each sheet's first page)

// Conservative per-row / header-row heights from the font size (incl. padding
// + borders). Erring large → fewer rows/page → safe against overflow.
const rowPx = (fontPx: number) => Math.round(fontPx * 1.7) + 5;
const headerRowPx = (fontPx: number) => rowPx(fontPx) + 6;

export interface PageSlice {
  /** Inclusive start row index. */
  start: number;
  /** Exclusive end row index. */
  end: number;
}

/**
 * Split `rowCount` rows into per-page slices for one sheet. The first page
 * reserves room for the sheet header (tournament + class + date) and the
 * section heading; every page reserves the column header, which always repeats.
 */
export function paginateRows(rowCount: number, fontPx: number): PageSlice[] {
  if (rowCount <= 0) return [{ start: 0, end: 0 }];

  const r = rowPx(fontPx);
  const h = headerRowPx(fontPx);
  const firstReserve = SHEET_HEADER_PX + SECTION_HEADING_PX + h;
  const firstCap = Math.max(1, Math.floor((USABLE_PAGE_PX - firstReserve) / r));
  const contCap = Math.max(1, Math.floor((USABLE_PAGE_PX - h) / r));

  const slices: PageSlice[] = [{ start: 0, end: Math.min(rowCount, firstCap) }];
  for (let i = slices[0].end; i < rowCount; i += contCap) {
    slices.push({ start: i, end: Math.min(rowCount, i + contCap) });
  }
  return slices;
}
