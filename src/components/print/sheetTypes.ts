import type { ReactNode } from 'react';

/** Props shared by every print sheet (pairing/standings, individual/team). */
export interface PrintSheetCommon {
  /** Effective font size in px (computed per sheet from mode + auto + row count). */
  fontPx: number;
  /** Tournament + class + date/location block — shown on this sheet's first page. */
  sheetHeader: ReactNode;
  /** Group name to append to the section title (empty when redundant with class/tournament). */
  groupSuffix: string;
}
