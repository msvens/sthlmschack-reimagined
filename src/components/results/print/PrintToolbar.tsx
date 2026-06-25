'use client';

/**
 * On-screen controls for the print page — hidden in the actual print output
 * (`print:hidden`). Back link, Print button, round picker, font-size mode,
 * auto-fit toggle, and repeat-header toggle. Uses the app's own components.
 */
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { Link } from '@/components/Link';
import { Button } from '@/components/Button';
import { Toggle } from '@/components/Toggle';
import { SelectableList, SelectableListItem } from '@/components/SelectableList';
import type { FontMode } from './printStyle';

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
  /** Whether the tournament has more than one group (else the toggle is pointless). */
  multipleGroups: boolean;
  tournamentId: number;
  /** The group this print was opened from (back-link target; absent = whole tournament). */
  groupId?: number;
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
  multipleGroups,
  tournamentId,
  groupId,
}: PrintToolbarProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const print = t.pages.tournamentResults.print;
  const rb = t.pages.tournamentResults.roundByRound;

  const backHref = groupId != null ? `/results/${tournamentId}/${groupId}` : `/results/${tournamentId}`;
  const roundItems: SelectableListItem[] = rounds.map((r) => ({ id: r, label: `${rb.round} ${r}` }));
  const fontItems: SelectableListItem[] = [
    { id: 'small', label: print.small },
    { id: 'medium', label: print.medium },
    { id: 'large', label: print.large },
  ];

  return (
    <div className="print:hidden mb-6 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/40">
      <Link href={backHref} color="gray" underline="hover" className="text-sm">
        {print.backToTournament}
      </Link>
      <span className="text-gray-300 dark:text-gray-600">|</span>

      <Button variant="contained" color="primary" compact onClick={() => window.print()}>
        {print.printSaveAsPdf}
      </Button>

      {rounds.length > 1 && (
        <div className="w-32">
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

      <div className="w-32">
        <SelectableList
          items={fontItems}
          selectedId={fontMode}
          onSelect={(id) => onFontModeChange(id as FontMode)}
          title={print.fontSize}
          showTitle={false}
          variant="dropdown"
          compact
          transparent
        />
      </div>

      <Toggle checked={auto} onChange={onAutoChange} label={print.autoFit} />

      {/* Offer the "all groups" switch only when opened from a group AND the
          tournament actually has more than one group. */}
      {groupId != null && multipleGroups && (
        <Toggle checked={allGroups} onChange={onAllGroupsChange} label={print.allGroups} />
      )}
    </div>
  );
}
