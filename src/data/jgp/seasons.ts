/**
 * Stockholm Junior Grand Prix (JGP) season configuration — hand-maintained data
 * loaded synchronously (see `src/data/changelog.ts` for the same pattern).
 *
 * Group classification (which groups count, which are beginner) is baked in here
 * per tournament; the runtime engine never parses group names. See the notes on
 * `JgpGroupRef` in `./types.ts`.
 *
 * Age dispensations and club exceptions are verified and filled in age group by
 * age group against the official standings. Currently completed for 2025 open:
 *   - 2005-2009  ✅ (56/56 totals reproduced)
 *   - 2010-2011  ✅ (83/84; the one diff is a participation point missing from
 *                 the official sheet for Dilip Sunderraj Bjerre in Wasa)
 *   - 2012       ✅ (75/75 official players; one engine-extra, Elliot Sorber,
 *                 is an SSF duplicate registration of Elliot Aperia — same kid,
 *                 two member ids — which the official correctly deduped)
 *   - 2013       ✅ (all official players reproduced; remaining engine-vs-PDF
 *                 diffs are non-bugs: Hafsa Aytug is a valid player the official
 *                 omitted (we include her, per rules), Oscar Ervius==Oscar Fridh
 *                 is a surname mismatch. Surfaced the younger-class rule.)
 *   - 2014       ✅ (63/63 official players; Shreyas Sunil Kaklij==Shreyas Kaklij
 *                 is a dropped-middle-name mismatch, correctly scored Σ9)
 *   - 2015       ✅ (62/62 official players; two surname mismatches
 *                 (Riddhayan Deb, Alankrith) correctly scored Σ1/Σ0)
 *   - 2016       ✅ (55/55 official players; Adrian Hajimadhi==Adrian Hajimahdi
 *                 is a transposed-letter typo. Generalised the wrong-class void
 *                 to be sticky (Rowin Joshi's double-registration up-class).)
 *   - 2017-      ✅ (36/36 official players. Refined the play-up penalty: it
 *                 only applies when a younger class was actually available — the
 *                 youngest class a tournament offers is legitimate for the
 *                 youngest players, e.g. a 2017 in a "2015-2016" youngest class.)
 *
 * NOTE: the girls (Flick) series is intentionally not modelled yet.
 */

import type { JgpSeason } from './types';

/** Standard 2025 open birth-year age classes (from the official standings). */
const AGE_CLASSES_2025 = [
  { label: '2005-2009', fromYear: 2005, toYear: 2009 },
  { label: '2010-2011', fromYear: 2010, toYear: 2011 },
  { label: '2012', fromYear: 2012, toYear: 2012 },
  { label: '2013', fromYear: 2013, toYear: 2013 },
  { label: '2014', fromYear: 2014, toYear: 2014 },
  { label: '2015', fromYear: 2015, toYear: 2015 },
  { label: '2016', fromYear: 2016, toYear: 2016 },
  { label: '2017 onward', fromYear: 2017, toYear: 9999 },
];

const OPEN_2025: JgpSeason = {
  year: 2025,
  division: 'open',
  scoring: 'ladder',
  // The 2025 official standings averaged tied players regardless of group.
  tieScoring: 'averaged',
  // Dispensations/club-exceptions were deduced from the published PDFs.
  estimated: true,
  finalsTournamentId: 6254, // "JGP Finaler 2025"
  ageClasses: AGE_CLASSES_2025,
  tournaments: [
    {
      label: 'Trojanska Hästen JGP 2025 Vår',
      shortLabel: 'Troj. Vår',
      date: '2025-03-08',
      tournamentId: 5429,
      groups: [
        { groupId: 15716, isBeginner: false, label: 'A', fromYear: 2005, toYear: 2008 },
        { groupId: 15717, isBeginner: false, label: 'B', fromYear: 2009, toYear: 2011 },
        { groupId: 15718, isBeginner: false, label: 'C', fromYear: 2012, toYear: 2014 },
        { groupId: 15719, isBeginner: false, label: 'D', fromYear: 2015, toYear: 2018 },
        { groupId: 15720, isBeginner: true, label: 'E' },
        { groupId: 15721, isBeginner: true, label: 'F' },
      ],
    },
    {
      label: 'Tyresö JGP 2025',
      shortLabel: 'Tyresö',
      date: '2025-03-29',
      tournamentId: 5475,
      groups: [
        { groupId: 15785, isBeginner: false, label: 'AB', fromYear: 2005, toYear: 2011 },
        { groupId: 15786, isBeginner: false, label: 'C', fromYear: 2012, toYear: 2014 },
        { groupId: 15787, isBeginner: false, label: 'D', fromYear: 2015, toYear: 9999 },
        { groupId: 15788, isBeginner: true, label: 'E' },
      ],
    },
    {
      label: 'SIS Chess JGP',
      shortLabel: 'SIS',
      date: '2025-04-12',
      tournamentId: 5430,
      groups: [
        { groupId: 15723, isBeginner: false, label: 'A/B', fromYear: 2005, toYear: 2012 },
        { groupId: 15724, isBeginner: false, label: 'C', fromYear: 2012, toYear: 2014 },
        { groupId: 15725, isBeginner: false, label: 'D', fromYear: 2015, toYear: 2016 },
        { groupId: 15726, isBeginner: true, label: 'E' },
        { groupId: 15727, isBeginner: true, label: 'F' },
      ],
    },
    {
      label: 'Wasa JGP 2025',
      shortLabel: 'Wasa',
      date: '2025-04-26',
      tournamentId: 5495,
      // group 15814 ("ANVÄNDS EJ") is a dummy and intentionally omitted.
      groups: [
        { groupId: 15815, isBeginner: false, label: 'A/B', fromYear: 2005, toYear: 2011 },
        { groupId: 15816, isBeginner: false, label: 'C', fromYear: 2012, toYear: 2014 },
        { groupId: 15817, isBeginner: false, label: 'D', fromYear: 2015, toYear: 2018 },
        { groupId: 15818, isBeginner: true, label: 'E' },
        { groupId: 15819, isBeginner: true, label: 'F' },
      ],
    },
    {
      label: 'Junior-DM i Snabbschack 2025',
      shortLabel: 'JDM Snabb',
      date: '2025-05-17',
      tournamentId: 5628,
      // JDM has no beginner groups; class E is a counted youngest age class.
      groups: [
        { groupId: 16004, isBeginner: false, label: 'A', fromYear: 2005, toYear: 2009 },
        { groupId: 16005, isBeginner: false, label: 'B', fromYear: 2010, toYear: 2011 },
        { groupId: 16006, isBeginner: false, label: 'C', fromYear: 2012, toYear: 2013 },
        { groupId: 16007, isBeginner: false, label: 'D', fromYear: 2014, toYear: 2015 },
        { groupId: 16008, isBeginner: false, label: 'E', fromYear: 2016, toYear: 9999 },
      ],
    },
    {
      label: 'SS 4 Springare JGP 2025',
      shortLabel: 'SS4',
      date: '2025-05-24',
      tournamentId: 5650,
      // "grupp A-D" carry no year labels; ranges authored from the class structure.
      groups: [
        { groupId: 16044, isBeginner: false, label: 'A', fromYear: 2005, toYear: 2009 },
        { groupId: 16045, isBeginner: false, label: 'B', fromYear: 2009, toYear: 2011 },
        { groupId: 16046, isBeginner: false, label: 'C', fromYear: 2012, toYear: 2014 },
        { groupId: 16047, isBeginner: false, label: 'D', fromYear: 2015, toYear: 2018 },
        { groupId: 16048, isBeginner: true, label: 'E' },
        { groupId: 16049, isBeginner: true, label: 'F' },
      ],
    },
    {
      label: 'Skärgårdens JGP 2025',
      shortLabel: 'Skärgården',
      date: '2025-08-23',
      tournamentId: 5769,
      groups: [
        { groupId: 16419, isBeginner: false, label: 'AB', fromYear: 2005, toYear: 2012 },
        { groupId: 16420, isBeginner: false, label: 'C', fromYear: 2013, toYear: 2015 },
        { groupId: 16421, isBeginner: false, label: 'D', fromYear: 2016, toYear: 9999 },
        { groupId: 16422, isBeginner: true, label: 'E' },
        { groupId: 16423, isBeginner: true, label: 'F' },
      ],
    },
    {
      label: 'JDM Sthlm i Blixt 2025',
      shortLabel: 'JDM Blixt',
      date: '2025-09-07',
      tournamentId: 5912,
      // JDM has no beginner groups; class E is a counted youngest age class.
      groups: [
        { groupId: 16788, isBeginner: false, label: 'A', fromYear: 2005, toYear: 2009 },
        { groupId: 16789, isBeginner: false, label: 'B', fromYear: 2010, toYear: 2012 },
        { groupId: 16790, isBeginner: false, label: 'C', fromYear: 2013, toYear: 2014 },
        { groupId: 16791, isBeginner: false, label: 'D', fromYear: 2015, toYear: 2016 },
        { groupId: 16792, isBeginner: false, label: 'E', fromYear: 2017, toYear: 9999 },
      ],
    },
    {
      label: 'Kristallens JGP 2025',
      shortLabel: 'Kristallen',
      date: '2025-09-13',
      tournamentId: 5863,
      groups: [
        { groupId: 16680, isBeginner: false, label: 'A', fromYear: 2005, toYear: 2009 },
        { groupId: 16681, isBeginner: false, label: 'B', fromYear: 2010, toYear: 2012 },
        { groupId: 16682, isBeginner: false, label: 'C', fromYear: 2013, toYear: 2015 },
        { groupId: 16683, isBeginner: false, label: 'D', fromYear: 2016, toYear: 9999 },
        { groupId: 16684, isBeginner: true, label: 'E' },
      ],
    },
    {
      label: 'Trojanska Hästen JGP 2025 Höst',
      shortLabel: 'Troj. Höst',
      date: '2025-10-18',
      tournamentId: 5999,
      groups: [
        { groupId: 16916, isBeginner: false, label: 'A', fromYear: 2005, toYear: 2009 },
        { groupId: 16917, isBeginner: false, label: 'B', fromYear: 2010, toYear: 2012 },
        { groupId: 16918, isBeginner: false, label: 'C', fromYear: 2013, toYear: 2015 },
        { groupId: 16919, isBeginner: false, label: 'D', fromYear: 2016, toYear: 2018 },
        { groupId: 16920, isBeginner: true, label: 'E' },
        { groupId: 16921, isBeginner: true, label: 'F' },
      ],
    },
    {
      label: 'Farsta SK JGP 2025',
      shortLabel: 'Farsta',
      date: '2025-11-08',
      tournamentId: 6006,
      groups: [
        { groupId: 16928, isBeginner: false, label: 'A', fromYear: 2005, toYear: 2009 },
        { groupId: 16929, isBeginner: false, label: 'B', fromYear: 2010, toYear: 2012 },
        { groupId: 16930, isBeginner: false, label: 'C', fromYear: 2013, toYear: 2015 },
        { groupId: 16931, isBeginner: false, label: 'D', fromYear: 2016, toYear: 9999 },
        { groupId: 16932, isBeginner: true, label: 'E' },
        { groupId: 16933, isBeginner: true, label: 'F' },
      ],
    },
  ],
  // Verified against the official standings, age group by age group.
  dispensations: [
    // 2005-2009: younger players granted an older age class.
    { memberId: 546393, name: 'Pratyush Tripathi', birthYear: 2010, playClassYear: 2009 },
    { memberId: 516448, name: 'Victor Lilliehöök', birthYear: 2012, playClassYear: 2009 },
    { memberId: 541890, name: 'Melvin Ral Lustig', birthYear: 2011, playClassYear: 2009 },
    // 2010-2011: younger players granted the 2010-2011 age class.
    { memberId: 642041, name: 'Sebastian Shi', birthYear: 2015, playClassYear: 2011 },
    { memberId: 590088, name: 'Ram Srinivasson', birthYear: 2012, playClassYear: 2011 },
    { memberId: 594192, name: 'Dorian Göhlin Skoglund', birthYear: 2012, playClassYear: 2011 },
    { memberId: 609818, name: 'Chale Zheng', birthYear: 2012, playClassYear: 2011 },
    { memberId: 570261, name: 'Hugo Hardwick', birthYear: 2012, playClassYear: 2011 },
    // 2014: younger player granted the 2014 age class.
    { memberId: 727750, name: 'Umair Islam', birthYear: 2015, playClassYear: 2014 },
  ],
  clubExceptions: [
    // 2005-2009: secondary Stockholm membership (SSF main club is elsewhere).
    { memberId: 544058, name: 'Karl-Oskar Rehnberg', stockholmClub: 'Stockholm SS' },
    // 2013: secondary Stockholm membership.
    { memberId: 689356, name: 'Benjamin Garavito Bengtsson', stockholmClub: 'Trojanska Hästen' },
    { memberId: 715650, name: 'Ingibjörg Ylfa Fannarsdóttir', stockholmClub: 'Trojanska Hästen' },
    // 2014: secondary Stockholm membership.
    { memberId: 669826, name: 'Ece Yigit', stockholmClub: 'Farsta SK' },
  ],
};

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
 * Girls (Flick) 2026 — a single combined percentile-scored ranking. Includes the
 * girls-only Tjejträffen plus each JGP event; every playing class counts (girls
 * play in the mixed open classes), and beginner classes score on the E&F scale.
 * Age ranges are omitted: the percentile scoring is per playing class and never
 * re-buckets by age, so only the group id and its beginner flag matter.
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
        { groupId: 17724, isBeginner: false, label: 'Öppen' },
        { groupId: 17725, isBeginner: true, label: 'Nybörjar' },
      ],
    },
    {
      label: 'Tyresö JGP 2026',
      shortLabel: 'Tyresö',
      date: '2026-03-07',
      tournamentId: 6544,
      groups: [
        { groupId: 18083, isBeginner: false, label: 'A' },
        { groupId: 18079, isBeginner: false, label: 'B' },
        { groupId: 18080, isBeginner: false, label: 'C' },
        { groupId: 18081, isBeginner: false, label: 'D' },
        { groupId: 18082, isBeginner: true, label: 'E' },
      ],
    },
    {
      label: 'Trojanska Hästen JGP 2026 Vår',
      shortLabel: 'Troj. Vår',
      date: '2026-03-14',
      tournamentId: 6540,
      groups: [
        { groupId: 18063, isBeginner: false, label: 'A' },
        { groupId: 18064, isBeginner: false, label: 'B' },
        { groupId: 18065, isBeginner: false, label: 'C' },
        { groupId: 18066, isBeginner: false, label: 'D' },
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
        { groupId: 18048, isBeginner: false, label: 'A/B' },
        { groupId: 18049, isBeginner: false, label: 'C' },
        { groupId: 18050, isBeginner: false, label: 'D' },
        { groupId: 18055, isBeginner: true, label: 'E' },
      ],
    },
    {
      label: 'Wasa JGP 2026',
      shortLabel: 'Wasa',
      date: '2026-04-25',
      tournamentId: 6685,
      groups: [
        { groupId: 18319, isBeginner: false, label: 'A' },
        { groupId: 18318, isBeginner: false, label: 'B' },
        { groupId: 18320, isBeginner: false, label: 'C' },
        { groupId: 18321, isBeginner: false, label: 'D' },
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
        { groupId: 18520, isBeginner: false, label: 'A' },
        { groupId: 18521, isBeginner: false, label: 'B' },
        { groupId: 18522, isBeginner: false, label: 'C' },
        { groupId: 18523, isBeginner: false, label: 'D' },
        { groupId: 18524, isBeginner: true, label: 'E' },
        { groupId: 18525, isBeginner: true, label: 'F' },
      ],
    },
    {
      label: 'Junior-DM i Snabbschack 2026',
      shortLabel: 'JDM Snabb',
      date: '2026-05-30',
      tournamentId: 6853,
      groups: [
        { groupId: 18591, isBeginner: false, label: 'A' },
        { groupId: 18592, isBeginner: false, label: 'B' },
        { groupId: 18593, isBeginner: false, label: 'C' },
        { groupId: 18594, isBeginner: false, label: 'D' },
        { groupId: 18595, isBeginner: false, label: 'E' },
      ],
    },
  ],
  dispensations: [],
  clubExceptions: [],
};

/** All configured JGP seasons. */
export const jgpSeasons: JgpSeason[] = [OPEN_2025, OPEN_2026, GIRLS_2026];
