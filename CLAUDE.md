# Project Context

"msvens chess" — a tournament portal for Swedish chess. Next.js 16 + React 19, Tailwind CSS 4,
TypeScript. Reads the Svenska Schackförbundet API via `@msvens/schack-se-sdk` (pinned to a git tag, not
npm). Club/district data is static JSON in `public/data/`, loaded at startup (synchronous lookups).

# Commands

- **Check** (CI gate — run before committing): `pnpm check`  # typecheck + lint + test + build
- Dev: `pnpm dev` (port 3001) · Test: `pnpm test` · Lint: `pnpm lint` · Typecheck: `pnpm typecheck`
- Release: `pnpm release X.Y.Z` (see Releasing)
- Refresh org data: `pnpm data:clubs` · Geocode club map: `pnpm geocode:clubs`

# Conventions

- **Tailwind JIT**: no dynamic class strings — use explicit class maps for computed classes.
- Use the `PageLayout` component instead of hand-rolled containers.
- All UI text goes through `src/lib/translations.ts` — no inline `language === 'sv' ? … : …`.
- SDK methods return `ApiResponse<T>` (`{ data?, error?, status }`) and never throw — check
  `response.data` / `response.status`.
- Tournament status: derive via the SDK's `getTournamentStatus` — the API `state` field is unreliable.
- Deeper, evolving project notes and decisions accumulate in the auto-memory (`MEMORY.md`).

# Behavior Rules

- Ask before assuming when requirements are ambiguous
- Write minimum code to solve the stated problem — no preemptive abstraction
- Only modify files and functions directly involved in the current task
- Say "I'm not sure" when uncertain rather than confabulating

# Committing (no slash command needed — just ask me to commit)

1. Run `pnpm check` — abort and report if anything fails.
2. Review `git status` / diffs and propose a logical commit grouping (one commit if cohesive, split
   distinct workstreams).
3. Commit only when I explicitly ask. No Claude attribution / `Co-Authored-By`. Push only when I ask.

Never commit `public/data/{clubs-by-district,districts,organizations-all}.json` (gitignored — regenerated
on deploy).

# Releasing (no slash command — `pnpm release`)

1. Make sure `## [Unreleased]` in `CHANGELOG.md` has user-facing entries. If it's empty, draft them from
   `git log <last-tag>..HEAD` — group under `### Added / Changed / Fixed / Removed`, user-facing only
   (skip internal refactors, dep bumps, etc.).
2. Run `pnpm release X.Y.Z`. It validates semver, runs preflight git checks (on `main`, clean, in sync
   with origin, tag free), runs `pnpm check`, promotes `## [Unreleased]` → `## [X.Y.Z] - <date>` (adding
   a fresh `## [Unreleased]`), regenerates `src/data/changelog.ts`, commits, tags `vX.Y.Z`, and **prints
   the push command** (does not push).
3. Review (`git show HEAD`, `git show vX.Y.Z`), then `git push origin main vX.Y.Z`.
