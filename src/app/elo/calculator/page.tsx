'use client';

import { useState, useRef } from 'react';
import { PageTitle } from '@/components/PageTitle';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { Toggle } from '@/components/Toggle';
import { DropdownMenu, DropdownMenuItem } from '@/components/DropdownMenu';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslation } from '@/lib/translations';
import {
  calculateExpectedScore,
  calculateRatingChange,
  calculatePerformanceRating,
  getKFactorForRating,
  PlayerService,
  formatPlayerName,
  PlayerInfoDto,
  MemberFIDERatingDTO,
} from '@/lib/api';
import { topPlayersMen, topPlayersWomen, TopPlayer } from '@/data/topPlayers';

/** Expected score without the 400-point cap */
function calculateExpectedScoreUncapped(playerRating: number, opponentRating: number): number {
  const diff = opponentRating - playerRating;
  return 1 / (1 + Math.pow(10, diff / 400));
}

/** Rating change without the 400-point cap */
function calculateRatingChangeUncapped(
  playerRating: number,
  opponentRating: number,
  actualScore: number,
  kFactor: number
): number {
  const expected = calculateExpectedScoreUncapped(playerRating, opponentRating);
  return kFactor * (actualScore - expected);
}

type EloType = 'standard' | 'rapid' | 'blitz';
type GameResult = 'win' | 'draw' | 'loss';
type InputMode = 'manual' | 'search' | 'memberId' | 'topPlayer';

interface PlayerState {
  rating: string;
  inputMode: InputMode;
  firstName: string;
  lastName: string;
  memberIdInput: string;
  selectedPlayerName: string;
  /** K-factor from player profile (null = use auto-calculation) */
  profileKFactor: number | null;
}

const initialPlayerState: PlayerState = {
  rating: '',
  inputMode: 'manual',
  firstName: '',
  lastName: '',
  memberIdInput: '',
  selectedPlayerName: '',
  profileKFactor: null,
};

function getRatingFromPlayer(player: PlayerInfoDto, eloType: EloType): number {
  switch (eloType) {
    case 'standard': return player.elo?.rating ?? 0;
    case 'rapid': return player.elo?.rapidRating ?? 0;
    case 'blitz': return player.elo?.blitzRating ?? 0;
  }
}

function getKFactorFromPlayer(elo: MemberFIDERatingDTO | null | undefined, eloType: EloType): number | null {
  if (!elo) return null;
  switch (eloType) {
    case 'standard': return elo.k || null;
    case 'rapid': return elo.rapidk || null;
    case 'blitz': return elo.blitzK || null;
  }
}

function getRatingFromTopPlayer(player: TopPlayer, eloType: EloType): number {
  switch (eloType) {
    case 'standard': return player.standardRating;
    case 'rapid': return player.rapidRating;
    case 'blitz': return player.blitzRating;
  }
}

function PlayerInput({
  label,
  state,
  onChange,
  eloType,
}: {
  label: string;
  state: PlayerState;
  onChange: (state: PlayerState) => void;
  eloType: EloType;
}) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const calc = t.pages.elo.calculator;

  const [searchResults, setSearchResults] = useState<PlayerInfoDto[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const searchButtonRef = useRef<HTMLDivElement>(null);
  const playerService = new PlayerService();

  const inputModes: { value: InputMode; label: string }[] = [
    { value: 'manual', label: calc.manualInput },
    { value: 'search', label: calc.searchPlayer },
    { value: 'memberId', label: calc.memberId },
    { value: 'topPlayer', label: calc.topPlayer },
  ];

  const handleSearch = async () => {
    if (!state.firstName.trim() && !state.lastName.trim()) return;
    setIsSearching(true);
    setLookupError('');
    setShowDropdown(false);

    try {
      const response = await playerService.searchPlayer(
        state.firstName.trim(),
        state.lastName.trim()
      );
      if (response.status === 200 && response.data && response.data.length > 0) {
        setSearchResults(response.data);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setLookupError(calc.noResults);
      }
    } catch {
      setLookupError(calc.noResults);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSelect = (item: DropdownMenuItem) => {
    const player = searchResults.find((p) => p.id === item.id);
    if (player) {
      const rating = getRatingFromPlayer(player, eloType);
      const kFactor = getKFactorFromPlayer(player.elo, eloType);
      onChange({
        ...state,
        rating: rating > 0 ? String(rating) : '',
        selectedPlayerName: formatPlayerName(player.firstName, player.lastName, player.elo?.title),
        profileKFactor: kFactor,
      });
    }
    setShowDropdown(false);
  };

  const handleMemberIdLookup = async () => {
    const memberId = parseInt(state.memberIdInput.trim());
    if (isNaN(memberId)) return;
    setIsSearching(true);
    setLookupError('');

    try {
      const response = await playerService.getPlayerInfo(memberId);
      if (response.status === 200 && response.data) {
        const player = response.data;
        const rating = getRatingFromPlayer(player, eloType);
        const kFactor = getKFactorFromPlayer(player.elo, eloType);
        onChange({
          ...state,
          rating: rating > 0 ? String(rating) : '',
          selectedPlayerName: formatPlayerName(player.firstName, player.lastName, player.elo?.title),
          profileKFactor: kFactor,
        });
      } else {
        setLookupError(calc.playerNotFound);
      }
    } catch {
      setLookupError(calc.playerNotFound);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTopPlayerSelect = (player: TopPlayer) => {
    const rating = getRatingFromTopPlayer(player, eloType);
    onChange({
      ...state,
      rating: String(rating),
      selectedPlayerName: player.name,
      profileKFactor: null,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (state.inputMode === 'search') handleSearch();
      else if (state.inputMode === 'memberId') handleMemberIdLookup();
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <h3 className="font-semibold text-gray-900 dark:text-gray-200">{label}</h3>

      {state.selectedPlayerName && (
        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          {state.selectedPlayerName}
        </p>
      )}

      {/* Input mode tabs */}
      <div className="flex flex-wrap gap-1">
        {inputModes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => {
              onChange({ ...state, inputMode: mode.value, selectedPlayerName: '', profileKFactor: null });
              setShowDropdown(false);
              setLookupError('');
            }}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              state.inputMode === mode.value
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 font-medium'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Manual input */}
      {state.inputMode === 'manual' && (
        <TextField
          label={calc.rating}
          value={state.rating}
          onChange={(e) => onChange({ ...state, rating: e.target.value, profileKFactor: null })}
          type="number"
          placeholder={calc.enterRating}
          compact
          fullWidth
        />
      )}

      {/* Search by name */}
      {state.inputMode === 'search' && (
        <div className="space-y-2" onKeyDown={handleKeyDown}>
          <div className="flex gap-2">
            <TextField
              label={calc.firstName}
              value={state.firstName}
              onChange={(e) => onChange({ ...state, firstName: e.target.value })}
              compact
              fullWidth
            />
            <TextField
              label={calc.lastName}
              value={state.lastName}
              onChange={(e) => onChange({ ...state, lastName: e.target.value })}
              compact
              fullWidth
            />
          </div>
          <div ref={searchButtonRef} className="relative">
            <Button
              onClick={handleSearch}
              disabled={isSearching || (!state.firstName.trim() && !state.lastName.trim())}
              variant="outlined"
              compact
            >
              {isSearching ? calc.searching : calc.search}
            </Button>
            <DropdownMenu
              items={searchResults.map((p) => ({
                id: p.id,
                primary: formatPlayerName(p.firstName, p.lastName, p.elo?.title),
                secondary: p.club || undefined,
              }))}
              isVisible={showDropdown}
              onItemClick={handleSearchSelect}
              onClose={() => setShowDropdown(false)}
              anchorElement={searchButtonRef.current}
            />
          </div>
          {state.rating && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {calc.rating}: {state.rating}
              {state.profileKFactor != null && ` (K=${state.profileKFactor})`}
            </p>
          )}
        </div>
      )}

      {/* Member ID lookup */}
      {state.inputMode === 'memberId' && (
        <div className="space-y-2" onKeyDown={handleKeyDown}>
          <TextField
            label={calc.memberId}
            value={state.memberIdInput}
            onChange={(e) => onChange({ ...state, memberIdInput: e.target.value })}
            placeholder={calc.enterMemberId}
            type="number"
            compact
            fullWidth
          />
          <Button
            onClick={handleMemberIdLookup}
            disabled={isSearching || !state.memberIdInput.trim()}
            variant="outlined"
            compact
          >
            {isSearching ? calc.lookingUp : calc.search}
          </Button>
          {state.rating && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {calc.rating}: {state.rating}
              {state.profileKFactor != null && ` (K=${state.profileKFactor})`}
            </p>
          )}
        </div>
      )}

      {/* Top player select */}
      {state.inputMode === 'topPlayer' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{calc.men}</label>
            <select
              value={topPlayersMen.find((p) => p.name === state.selectedPlayerName)?.fideId ?? ''}
              onChange={(e) => {
                const player = topPlayersMen.find((p) => p.fideId === Number(e.target.value));
                if (player) handleTopPlayerSelect(player);
              }}
              className="w-full px-3 py-1.5 text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-200 focus:outline-none focus:border-blue-500 hover:border-gray-900 dark:hover:border-white"
            >
              <option value="">{calc.selectTopPlayer}</option>
              {topPlayersMen.map((p) => (
                <option key={p.fideId} value={p.fideId}>
                  {p.name} ({p.country})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{calc.women}</label>
            <select
              value={topPlayersWomen.find((p) => p.name === state.selectedPlayerName)?.fideId ?? ''}
              onChange={(e) => {
                const player = topPlayersWomen.find((p) => p.fideId === Number(e.target.value));
                if (player) handleTopPlayerSelect(player);
              }}
              className="w-full px-3 py-1.5 text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-200 focus:outline-none focus:border-blue-500 hover:border-gray-900 dark:hover:border-white"
            >
              <option value="">{calc.selectTopPlayer}</option>
              {topPlayersWomen.map((p) => (
                <option key={p.fideId} value={p.fideId}>
                  {p.name} ({p.country})
                </option>
              ))}
            </select>
          </div>
          {state.rating && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {calc.rating}: {state.rating}
            </p>
          )}
        </div>
      )}

      {lookupError && (
        <p className="text-xs text-red-500 dark:text-red-400">{lookupError}</p>
      )}
    </div>
  );
}

export default function EloCalculatorPage() {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const calc = t.pages.elo.calculator;

  const [player1, setPlayer1] = useState<PlayerState>({ ...initialPlayerState });
  const [player2, setPlayer2] = useState<PlayerState>({ ...initialPlayerState });
  const [eloType, setEloType] = useState<EloType>('standard');
  const [result, setResult] = useState<GameResult>('win');
  const [kFactorMode, setKFactorMode] = useState<'auto' | 'manual'>('auto');
  const [manualK1, setManualK1] = useState('20');
  const [manualK2, setManualK2] = useState('20');
  const [removeCap, setRemoveCap] = useState(false);

  const rating1 = parseInt(player1.rating) || 0;
  const rating2 = parseInt(player2.rating) || 0;
  const hasValidRatings = rating1 > 0 && rating2 > 0;

  const actualScore1 = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
  const actualScore2 = 1 - actualScore1;

  // K-factor: manual override > profile K-factor > auto-calculated
  const getK = (playerState: PlayerState, rating: number): number => {
    if (kFactorMode === 'manual') return parseInt(manualK1) || 20;
    if (playerState.profileKFactor != null) return playerState.profileKFactor;
    return getKFactorForRating(eloType, rating);
  };
  const k1 = kFactorMode === 'manual' ? (parseInt(manualK1) || 20) : getK(player1, rating1);
  const k2 = kFactorMode === 'manual' ? (parseInt(manualK2) || 20) : getK(player2, rating2);

  const expectedFn = removeCap ? calculateExpectedScoreUncapped : calculateExpectedScore;
  const changeFn = removeCap ? calculateRatingChangeUncapped : calculateRatingChange;

  const expected1 = hasValidRatings ? expectedFn(rating1, rating2) : 0;
  const expected2 = hasValidRatings ? expectedFn(rating2, rating1) : 0;
  const change1 = hasValidRatings ? changeFn(rating1, rating2, actualScore1, k1) : 0;
  const change2 = hasValidRatings ? changeFn(rating2, rating1, actualScore2, k2) : 0;

  const perf1 = hasValidRatings ? calculatePerformanceRating([rating2], actualScore1) : 0;
  const perf2 = hasValidRatings ? calculatePerformanceRating([rating1], actualScore2) : 0;

  const eloTypes: { value: EloType; label: string }[] = [
    { value: 'standard', label: calc.standard },
    { value: 'rapid', label: calc.rapid },
    { value: 'blitz', label: calc.blitz },
  ];

  const results: { value: GameResult; label: string }[] = [
    { value: 'win', label: calc.player1Wins },
    { value: 'draw', label: calc.draw },
    { value: 'loss', label: calc.player2Wins },
  ];

  return (
    <>
      <PageTitle title={calc.title} />

      {/* Player inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <PlayerInput
          label={calc.player1}
          state={player1}
          onChange={setPlayer1}
          eloType={eloType}
        />
        <PlayerInput
          label={calc.player2}
          state={player2}
          onChange={setPlayer2}
          eloType={eloType}
        />
      </div>

      {/* Settings */}
      <div className="space-y-2 mb-6">
        {/* Elo Type */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">{calc.eloType}:</span>
          <div className="flex gap-1">
            {eloTypes.map((et) => (
              <button
                key={et.value}
                onClick={() => setEloType(et.value)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  eloType === et.value
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {et.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">{calc.result}:</span>
          <div className="flex gap-1">
            {results.map((r) => (
              <button
                key={r.value}
                onClick={() => setResult(r.value)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  result === r.value
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* K-factor */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">{calc.kFactor}:</span>
          <div className="flex gap-1 items-center">
            <button
              onClick={() => setKFactorMode('auto')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                kFactorMode === 'auto'
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {calc.auto}
            </button>
            <button
              onClick={() => setKFactorMode('manual')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                kFactorMode === 'manual'
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {calc.manual}
            </button>
            {kFactorMode === 'manual' && (
              <div className="flex gap-2 ml-2">
                <TextField
                  label="K1"
                  value={manualK1}
                  onChange={(e) => setManualK1(e.target.value)}
                  type="number"
                  compact
                />
                <TextField
                  label="K2"
                  value={manualK2}
                  onChange={(e) => setManualK2(e.target.value)}
                  type="number"
                  compact
                />
              </div>
            )}
          </div>
        </div>

        {/* Auto hint */}
        {kFactorMode === 'auto' && (
          <div className="flex items-center gap-2">
            <span className="w-16 flex-shrink-0" />
            <p className="text-xs text-gray-500 dark:text-gray-400">{calc.autoHint}</p>
          </div>
        )}

        {/* Remove 400-point cap */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">&nbsp;</span>
          <Toggle
            checked={removeCap}
            onChange={setRemoveCap}
            label={calc.removeCap}
          />
        </div>
      </div>

      {/* Results */}
      {hasValidRatings && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          {removeCap && Math.abs(rating1 - rating2) > 400 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
              {calc.uncapped} &mdash; rating difference {Math.abs(rating1 - rating2)} (normally capped at 400)
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Player 1 results */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-200">
                {player1.selectedPlayerName || calc.player1}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({rating1})
                </span>
              </h4>
              <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <p>
                  <span className="text-gray-500 dark:text-gray-400">{calc.expectedScore}:</span>{' '}
                  {(expected1 * 100).toFixed(1)}%
                </p>
                <p>
                  <span className="text-gray-500 dark:text-gray-400">{calc.ratingChange}:</span>{' '}
                  <span className={change1 >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {change1 >= 0 ? '+' : ''}{change1.toFixed(1)}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500 dark:text-gray-400">{calc.newRating}:</span>{' '}
                  {Math.round(rating1 + change1)}
                </p>
                <p>
                  <span className="text-gray-500 dark:text-gray-400">{calc.performanceRating}:</span>{' '}
                  {Math.round(perf1)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  K = {k1}{player1.profileKFactor != null && kFactorMode === 'auto' ? ' (profile)' : ''}
                </p>
              </div>
            </div>

            {/* Player 2 results */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-200">
                {player2.selectedPlayerName || calc.player2}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({rating2})
                </span>
              </h4>
              <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <p>
                  <span className="text-gray-500 dark:text-gray-400">{calc.expectedScore}:</span>{' '}
                  {(expected2 * 100).toFixed(1)}%
                </p>
                <p>
                  <span className="text-gray-500 dark:text-gray-400">{calc.ratingChange}:</span>{' '}
                  <span className={change2 >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {change2 >= 0 ? '+' : ''}{change2.toFixed(1)}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500 dark:text-gray-400">{calc.newRating}:</span>{' '}
                  {Math.round(rating2 + change2)}
                </p>
                <p>
                  <span className="text-gray-500 dark:text-gray-400">{calc.performanceRating}:</span>{' '}
                  {Math.round(perf2)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  K = {k2}{player2.profileKFactor != null && kFactorMode === 'auto' ? ' (profile)' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
