/**
 * Stockholm Junior Grand Prix (JGP) season configuration — hand-maintained data
 * loaded synchronously (see `src/data/changelog.ts` for the same pattern).
 *
 * Group classification (which groups count, which are beginner) is baked in here
 * per tournament; the runtime engine never parses group names. See the notes on
 * `JgpGroupRef` in `./types.ts`.
 *
 * Seasons: `OPEN_2026` (ladder, per age class) and `GIRLS_2026` (percentile, per
 * playing class — girls-only). Both reproduce the official 2026 standings; the
 * girls model matches Ganesh Srinivasson's reference script exactly (per-cell).
 */

import type { JgpSeason } from './types';

/**
 * 2026 open — snapshot of an ongoing season (official standings dated
 * 2026-06-06, 5 tournaments so far). Age dispensations and club exceptions are
 * filled in age group by age group as verification proceeds; the official 2026
 * dispensation document is used afterwards as a cross-check.
 */
const OPEN_2026: JgpSeason = {
  year: 2026,
  division: 'open',
  scoring: 'ladder',
  // The 2026 official standings assign strictly by the ranked table.
  tieScoring: 'ranked',
  ageClasses: [
    { label: '2006-2009', fromYear: 2006, toYear: 2009 },
    { label: '2010-2012', fromYear: 2010, toYear: 2012 },
    { label: '2013', fromYear: 2013, toYear: 2013 },
    { label: '2014', fromYear: 2014, toYear: 2014 },
    { label: '2015', fromYear: 2015, toYear: 2015 },
    { label: '2016', fromYear: 2016, toYear: 2016 },
    { label: '2017', fromYear: 2017, toYear: 2017 },
    { label: '2018 onward', fromYear: 2018, toYear: 9999 },
  ],
  tournaments: [
    {
      label: 'Tyresö JGP 2026',
      shortLabel: 'Tyresö',
      date: '2026-03-07',
      tournamentId: 6544,
      groups: [
        { groupId: 18083, isBeginner: false, label: 'A', fromYear: 2006, toYear: 2009 },
        { groupId: 18079, isBeginner: false, label: 'B', fromYear: 2010, toYear: 2012 },
        { groupId: 18080, isBeginner: false, label: 'C', fromYear: 2013, toYear: 2015 },
        { groupId: 18081, isBeginner: false, label: 'D', fromYear: 2016, toYear: 9999 },
        { groupId: 18082, isBeginner: true, label: 'E' },
      ],
    },
    {
      label: 'Trojanska Hästen JGP 2026 Vår',
      shortLabel: 'Troj. Vår',
      date: '2026-03-14',
      tournamentId: 6540,
      groups: [
        { groupId: 18063, isBeginner: false, label: 'A', fromYear: 2006, toYear: 2009 },
        { groupId: 18064, isBeginner: false, label: 'B', fromYear: 2010, toYear: 2012 },
        { groupId: 18065, isBeginner: false, label: 'C', fromYear: 2013, toYear: 2015 },
        { groupId: 18066, isBeginner: false, label: 'D', fromYear: 2016, toYear: 2019 },
        { groupId: 18067, isBeginner: true, label: 'E' },
        { groupId: 18068, isBeginner: true, label: 'F' },
      ],
    },
    {
      label: 'SIS Chess JGP 2026',
      shortLabel: 'SIS',
      date: '2026-03-28',
      tournamentId: 6534,
      groups: [
        { groupId: 18048, isBeginner: false, label: 'A/B', fromYear: 2006, toYear: 2012 },
        { groupId: 18049, isBeginner: false, label: 'C', fromYear: 2013, toYear: 2015 },
        { groupId: 18050, isBeginner: false, label: 'D', fromYear: 2016, toYear: 2018 },
        { groupId: 18055, isBeginner: true, label: 'E' },
      ],
    },
    {
      label: 'Wasa JGP 2026',
      shortLabel: 'Wasa',
      date: '2026-04-25',
      tournamentId: 6685,
      groups: [
        { groupId: 18319, isBeginner: false, label: 'A', fromYear: 2006, toYear: 2009 },
        { groupId: 18318, isBeginner: false, label: 'B', fromYear: 2010, toYear: 2012 },
        { groupId: 18320, isBeginner: false, label: 'C', fromYear: 2013, toYear: 2015 },
        { groupId: 18321, isBeginner: false, label: 'D', fromYear: 2016, toYear: 2019 },
        { groupId: 18322, isBeginner: true, label: 'E' },
        { groupId: 18323, isBeginner: true, label: 'F' },
      ],
    },
    {
      label: 'SS 4 Springare JGP 2026',
      shortLabel: 'SS4',
      date: '2026-05-23',
      tournamentId: 6826,
      groups: [
        { groupId: 18520, isBeginner: false, label: 'A', fromYear: 2006, toYear: 2009 },
        { groupId: 18521, isBeginner: false, label: 'B', fromYear: 2010, toYear: 2012 },
        { groupId: 18522, isBeginner: false, label: 'C', fromYear: 2013, toYear: 2015 },
        { groupId: 18523, isBeginner: false, label: 'D', fromYear: 2016, toYear: 2018 },
        { groupId: 18524, isBeginner: true, label: 'E' },
        { groupId: 18525, isBeginner: true, label: 'F' },
      ],
    },
    {
      label: 'Junior-DM i Snabbschack 2026',
      shortLabel: 'JDM Snabb',
      date: '2026-05-30',
      tournamentId: 6853,
      // JDM has no beginner groups; class E is a counted youngest age class.
      groups: [
        { groupId: 18591, isBeginner: false, label: 'A', fromYear: 2006, toYear: 2009 },
        { groupId: 18592, isBeginner: false, label: 'B', fromYear: 2010, toYear: 2012 },
        { groupId: 18593, isBeginner: false, label: 'C', fromYear: 2013, toYear: 2014 },
        { groupId: 18594, isBeginner: false, label: 'D', fromYear: 2015, toYear: 2016 },
        { groupId: 18595, isBeginner: false, label: 'E', fromYear: 2017, toYear: 9999 },
      ],
    },
    {
      label: 'Skärgårdens JGP 2026',
      shortLabel: 'Skärgården',
      date: '2026-08-22',
      tournamentId: 6987,
      groups: [
        { groupId: 18928, isBeginner: false, label: 'A/B', fromYear: 2006, toYear: 2012 },
        { groupId: 18929, isBeginner: false, label: 'C', fromYear: 2013, toYear: 2015 },
        { groupId: 18930, isBeginner: false, label: 'D', fromYear: 2016, toYear: 9999 },
        // E is "Allmän, med klocka" (2014-2016) and F "Nybörjare, utan klocka" —
        // both cut across the age classes, so neither counts on the open ladder.
        // Same treatment as Trojanska Hästen's E/F.
        { groupId: 18931, isBeginner: true, label: 'E' },
        { groupId: 18932, isBeginner: true, label: 'F' },
      ],
    },
  ],
  // Filled in during verification, age group by age group (cross-checked
  // afterwards against the official 2026 Spelardispenser document).
  // The full official 2026 "Spelardispenser JGP" list (2026-05-10), verbatim
  // birth year → granted play-class year. Some of these never affect the
  // standings — a grant within the same age bucket (e.g. 2012 → 2011, both in
  // 2010-2012) doesn't move the player, and Pratyush/Victor didn't play any of
  // the snapshot's tournaments — but they're kept so the config mirrors the
  // official document and covers players who may play up later in the season.
  dispensations: [
    { memberId: 546393, name: 'Pratyush Tripathi', birthYear: 2010, playClassYear: 2009 },
    { memberId: 726286, name: 'Igor Markov', birthYear: 2011, playClassYear: 2009 },
    { memberId: 541890, name: 'Melvin Ral Lustig', birthYear: 2011, playClassYear: 2009 },
    { memberId: 577097, name: 'Rishi Viswanath', birthYear: 2011, playClassYear: 2010 },
    { memberId: 609818, name: 'Chale Zheng', birthYear: 2012, playClassYear: 2011 },
    { memberId: 594192, name: 'Dorian Göhlin Skoglund', birthYear: 2012, playClassYear: 2011 },
    { memberId: 570261, name: 'Hugo Hardwick', birthYear: 2012, playClassYear: 2010 },
    { memberId: 590088, name: 'Ram Srinivasson', birthYear: 2012, playClassYear: 2010 },
    { memberId: 516448, name: 'Victor Lilliehöök', birthYear: 2012, playClassYear: 2009 },
    { memberId: 612929, name: 'Bruce Sun Åslund', birthYear: 2014, playClassYear: 2012 },
    { memberId: 642041, name: 'Sebastian Shi', birthYear: 2015, playClassYear: 2011 },
    { memberId: 727750, name: 'Umair Islam', birthYear: 2015, playClassYear: 2012 },
    { memberId: 690069, name: 'Manohar Venkata Ommi', birthYear: 2016, playClassYear: 2015 },
    { memberId: 715536, name: 'Saadhan Kowshik', birthYear: 2016, playClassYear: 2015 },
    { memberId: 664867, name: 'Samuel Najafi', birthYear: 2016, playClassYear: 2015 },
  ],
  clubExceptions: [
    // 2006-2009
    { memberId: 542974, name: 'Henry Bjarnegård', stockholmClub: 'played a Stockholm club' },
    // 2010-2012
    { memberId: 617072, name: 'Alexander Gärshag', stockholmClub: 'played a Stockholm club' },
    { memberId: 622594, name: 'Jonathan Jackmann', stockholmClub: 'played a Stockholm club' },
    // 2013
    { memberId: 689356, name: 'Benjamin Garavito Bengtsson', stockholmClub: 'played a Stockholm club' },
    { memberId: 715650, name: 'Ingibjörg Ylfa Fannarsdóttir', stockholmClub: 'played a Stockholm club' },
    // 2014
    { memberId: 669826, name: 'Ece Yigit', stockholmClub: 'played a Stockholm club' },
  ],
};

/**
 * Girls (Flick) 2026 — percentile-scored, one flat combined ranking. Per
 * tournament the girls are filtered out and grouped by playing `klass` (Ganesh's
 * fixed `extract_klass`: a class letter, or "y" for öppen/allmän, "z" for
 * nybörjar — groups sharing a klass merge, e.g. two beginner groups both "z"),
 * ranked among themselves and scaled to 5–25; beginner klasses (`isBeginner`)
 * use the 8/7/6/5 scale instead. `rounds` scales points (`points/rounds`) for the
 * same-place tie-break. Reproduces the official 2026 Flick standings (Utskrift
 * 2026-07-07) per cell. JDM has no beginner scoring, so its class E is `false`.
 */
const GIRLS_2026: JgpSeason = {
  year: 2026,
  division: 'girls',
  scoring: 'percentile',
  estimated: true,
  tournaments: [
    {
      label: 'Tjejträffen 2026',
      shortLabel: 'Tjejträffen',
      date: '2026-01-10',
      tournamentId: 6336,
      groups: [
        { groupId: 17724, isBeginner: false, klass: 'y', rounds: 7, label: 'Öppen' },
        { groupId: 17725, isBeginner: true, klass: 'z', rounds: 7, label: 'Nybörjar' },
      ],
    },
    {
      label: 'Tyresö JGP 2026',
      shortLabel: 'Tyresö',
      date: '2026-03-07',
      tournamentId: 6544,
      groups: [
        { groupId: 18083, isBeginner: false, klass: 'a', rounds: 7, label: 'A' },
        { groupId: 18079, isBeginner: false, klass: 'b', rounds: 7, label: 'B' },
        { groupId: 18080, isBeginner: false, klass: 'c', rounds: 7, label: 'C' },
        { groupId: 18081, isBeginner: false, klass: 'd', rounds: 7, label: 'D' },
        { groupId: 18082, isBeginner: true, klass: 'z', rounds: 7, label: 'E' },
      ],
    },
    {
      label: 'Trojanska Hästen JGP 2026 Vår',
      shortLabel: 'Troj. Vår',
      date: '2026-03-14',
      tournamentId: 6540,
      groups: [
        { groupId: 18063, isBeginner: false, klass: 'a', rounds: 7, label: 'A' },
        { groupId: 18064, isBeginner: false, klass: 'b', rounds: 7, label: 'B' },
        { groupId: 18065, isBeginner: false, klass: 'c', rounds: 8, label: 'C' },
        { groupId: 18066, isBeginner: false, klass: 'd', rounds: 7, label: 'D' },
        // "Klass E (Allmän)" → öppen/allmän ⇒ klass "y", scored on the percentile scale.
        { groupId: 18067, isBeginner: false, klass: 'y', rounds: 6, label: 'E' },
        { groupId: 18068, isBeginner: true, klass: 'z', rounds: 5, label: 'F' },
      ],
    },
    {
      label: 'SIS Chess JGP 2026',
      shortLabel: 'SIS',
      date: '2026-03-28',
      tournamentId: 6534,
      groups: [
        { groupId: 18048, isBeginner: false, klass: 'ab', rounds: 7, label: 'A/B' },
        { groupId: 18049, isBeginner: false, klass: 'c', rounds: 7, label: 'C' },
        { groupId: 18050, isBeginner: false, klass: 'd', rounds: 6, label: 'D' },
        { groupId: 18055, isBeginner: true, klass: 'e', rounds: 5, label: 'E' },
      ],
    },
    {
      label: 'Wasa JGP 2026',
      shortLabel: 'Wasa',
      date: '2026-04-25',
      tournamentId: 6685,
      groups: [
        { groupId: 18319, isBeginner: false, klass: 'a', rounds: 7, label: 'A' },
        { groupId: 18318, isBeginner: false, klass: 'b', rounds: 7, label: 'B' },
        { groupId: 18320, isBeginner: false, klass: 'c', rounds: 8, label: 'C' },
        { groupId: 18321, isBeginner: false, klass: 'd', rounds: 7, label: 'D' },
        // Two beginner groups, both "z" ⇒ merged into one beginner pool.
        { groupId: 18322, isBeginner: true, klass: 'z', rounds: 5, label: 'E' },
        { groupId: 18323, isBeginner: true, klass: 'z', rounds: 5, label: 'F' },
      ],
    },
    {
      label: 'SS 4 Springare JGP 2026',
      shortLabel: 'SS4',
      date: '2026-05-23',
      tournamentId: 6826,
      groups: [
        { groupId: 18520, isBeginner: false, klass: 'a', rounds: 9, label: 'A' },
        { groupId: 18521, isBeginner: false, klass: 'b', rounds: 7, label: 'B' },
        { groupId: 18522, isBeginner: false, klass: 'c', rounds: 8, label: 'C' },
        { groupId: 18523, isBeginner: false, klass: 'd', rounds: 7, label: 'D' },
        { groupId: 18524, isBeginner: true, klass: 'z', rounds: 5, label: 'E' },
        { groupId: 18525, isBeginner: true, klass: 'z', rounds: 5, label: 'F' },
      ],
    },
    {
      label: 'Junior-DM i Snabbschack 2026',
      shortLabel: 'JDM Snabb',
      date: '2026-05-30',
      tournamentId: 6853,
      groups: [
        { groupId: 18591, isBeginner: false, klass: 'a', rounds: 7, label: 'A' },
        { groupId: 18592, isBeginner: false, klass: 'b', rounds: 7, label: 'B' },
        { groupId: 18593, isBeginner: false, klass: 'c', rounds: 7, label: 'C' },
        { groupId: 18594, isBeginner: false, klass: 'd', rounds: 6, label: 'D' },
        // JDM has no beginner scoring ⇒ class E is a normal percentile klass.
        { groupId: 18595, isBeginner: false, klass: 'e', rounds: 6, label: 'E' },
      ],
    },
    {
      label: 'Skärgårdens JGP 2026',
      shortLabel: 'Skärgården',
      date: '2026-08-22',
      tournamentId: 6987,
      groups: [
        { groupId: 18928, isBeginner: false, klass: 'ab', rounds: 7, label: 'A/B' },
        { groupId: 18929, isBeginner: false, klass: 'c', rounds: 7, label: 'C' },
        { groupId: 18930, isBeginner: false, klass: 'd', rounds: 7, label: 'D' },
        // "Klass E (Allmän, med klocka)" → öppen/allmän ⇒ klass "y".
        { groupId: 18931, isBeginner: false, klass: 'y', rounds: 6, label: 'E' },
        { groupId: 18932, isBeginner: true, klass: 'z', rounds: 5, label: 'F' },
      ],
    },
  ],
  dispensations: [],
  clubExceptions: [],
};

/** All configured JGP seasons. */
export const jgpSeasons: JgpSeason[] = [OPEN_2026, GIRLS_2026];
