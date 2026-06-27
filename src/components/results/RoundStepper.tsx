'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface RoundStepperProps {
  /** Available round numbers, ascending. */
  rounds: number[];
  /** Currently selected round. */
  value: number;
  /** Called with the newly selected round. */
  onChange: (round: number) => void;
  /** Word shown before the number, e.g. "Round" / "Rond". */
  labelPrefix: string;
  /** Accessibility label for the previous button. */
  prevLabel: string;
  /** Accessibility label for the next button. */
  nextLabel: string;
  className?: string;
}

/**
 * Compact round scrubber: ◀ "Rond N / total" ▶ plus a slider. Drives the shared
 * round state, so moving it also moves the round-by-round pairings below.
 */
export function RoundStepper({
  rounds,
  value,
  onChange,
  labelPrefix,
  prevLabel,
  nextLabel,
  className = '',
}: RoundStepperProps) {
  if (rounds.length === 0) return null;

  const index = rounds.indexOf(value);
  const safeIndex = index === -1 ? rounds.length - 1 : index;
  const canPrev = safeIndex > 0;
  const canNext = safeIndex < rounds.length - 1;

  const step = (delta: number) => {
    const next = rounds[safeIndex + delta];
    if (next !== undefined) onChange(next);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={() => canPrev && step(-1)}
        disabled={!canPrev}
        className={`p-1.5 rounded-lg transition-colors ${
          canPrev
            ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
        }`}
        aria-label={prevLabel}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      <span className="text-sm font-medium text-gray-900 dark:text-gray-200 whitespace-nowrap tabular-nums">
        {labelPrefix} {rounds[safeIndex]} / {rounds[rounds.length - 1]}
      </span>

      <input
        type="range"
        min={0}
        max={rounds.length - 1}
        step={1}
        value={safeIndex}
        onChange={(e) => onChange(rounds[Number(e.target.value)])}
        className="flex-1 min-w-[6rem] max-w-[16rem] accent-blue-600 cursor-pointer"
        aria-label={labelPrefix}
      />

      <button
        type="button"
        onClick={() => canNext && step(1)}
        disabled={!canNext}
        className={`p-1.5 rounded-lg transition-colors ${
          canNext
            ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
        }`}
        aria-label={nextLabel}
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

export default RoundStepper;
