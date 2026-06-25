'use client';

/**
 * On-screen controls for the print page — hidden in the actual print output
 * (`print:hidden`). Laid out as two rows: row 1 is WHAT to print (back, class,
 * group, round, all-groups); row 2 is HOW to print + the action (font size,
 * auto-fit, Print/Save-as-PDF). Uses the app's own components.
 */
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { Link } from '@/components/Link';
import { Button } from '@/components/Button';
import { Toggle } from '@/components/Toggle';
import { SelectableList, SelectableListItem } from '@/components/SelectableList';
import type { FontMode } from './printStyle';

/** Font modes shown as increasing "A"s — self-explanatory, compact, no label needed. */
const FONT_SIZES: { mode: FontMode; px: string }[] = [
  { mode: 'small', px: '11px' },
  { mode: 'medium', px: '14px' },
  { mode: 'large', px: '17px' },
];

interface PrintToolbarProps {
  rounds: number[];
  selectedRound: number;
  onRoundChange: (round: number) => void;
  fontMode: FontMode;
  onFontModeChange: (mode: FontMode) => void;
  auto: boolean;
  onAutoChange: (value: boolean) => void;
  allGroups: boolean;
  onAllGroupsChange: (value: boolean) => void;
  classOptions: { id: number; label: string; firstGroupId: number }[];
  currentClassId: number | null;
  groupOptions: { id: number; label: string }[];
  groupId: number;
  tournamentId: number;
}

export function PrintToolbar({
  rounds,
  selectedRound,
  onRoundChange,
  fontMode,
  onFontModeChange,
  auto,
  onAutoChange,
  allGroups,
  onAllGroupsChange,
  classOptions,
  currentClassId,
  groupOptions,
  groupId,
  tournamentId,
}: PrintToolbarProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const t = getTranslation(language);
  const print = t.pages.tournamentResults.print;
  const rb = t.pages.tournamentResults.roundByRound;

  // More than one group anywhere in the tournament → "all groups" is meaningful.
  const multipleGroups = classOptions.length > 1 || groupOptions.length > 1;

  const roundItems: SelectableListItem[] = rounds.map((r) => ({ id: r, label: `${rb.round} ${r}` }));

  const selectClass = (id: string | number) => {
    const cls = classOptions.find((c) => c.id === Number(id));
    if (cls) router.push(`/print/${tournamentId}/${cls.firstGroupId}`);
  };

  return (
    <div className="print:hidden mb-6 space-y-2.5 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/40">
      {/* Row 1 — what to print */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Link href={`/results/${tournamentId}/${groupId}`} color="gray" underline="hover" className="text-sm">
          {print.back}
        </Link>
        <span className="text-gray-300 dark:text-gray-600">|</span>

        {!allGroups && classOptions.length > 1 && (
          <div className="w-fit min-w-[9rem] max-w-[16rem]">
            <SelectableList
              items={classOptions.map((c) => ({ id: c.id, label: c.label }))}
              selectedId={currentClassId}
              onSelect={selectClass}
              variant="dropdown"
              compact
              transparent
            />
          </div>
        )}

        {!allGroups && groupOptions.length > 1 && (
          <div className="w-fit min-w-[9rem] max-w-[16rem]">
            <SelectableList
              items={groupOptions}
              selectedId={groupId}
              onSelect={(id) => router.push(`/print/${tournamentId}/${id}`)}
              variant="dropdown"
              compact
              transparent
            />
          </div>
        )}

        {rounds.length > 1 && (
          <div className="w-28">
            <SelectableList
              items={roundItems}
              selectedId={selectedRound}
              onSelect={(id) => onRoundChange(Number(id))}
              variant="dropdown"
              compact
              transparent
            />
          </div>
        )}

        {multipleGroups && (
          <Toggle checked={allGroups} onChange={onAllGroupsChange} label={print.allGroups} />
        )}
      </div>

      {/* Row 2 — how to print + action */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-gray-200 pt-2.5 dark:border-gray-700">
        <span className="hidden text-sm text-gray-600 sm:inline dark:text-gray-400">{print.fontSize}:</span>
        <div
          className="inline-flex overflow-hidden rounded-md border border-gray-300 dark:border-gray-600"
          role="group"
          aria-label={print.fontSize}
        >
          {FONT_SIZES.map(({ mode, px }, i) => (
            <button
              key={mode}
              type="button"
              onClick={() => onFontModeChange(mode)}
              title={print[mode]}
              aria-pressed={fontMode === mode}
              className={`flex h-7 w-8 items-center justify-center leading-none ${
                i > 0 ? 'border-l border-gray-300 dark:border-gray-600' : ''
              } ${
                fontMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span style={{ fontSize: px }}>A</span>
            </button>
          ))}
        </div>
        <Toggle checked={auto} onChange={onAutoChange} label={print.autoFit} />

        <Button
          variant="contained"
          color="primary"
          compact
          className="ml-auto"
          onClick={() => window.print()}
          title={print.printSaveAsPdf}
        >
          {print.printAction}
        </Button>
      </div>
    </div>
  );
}
