# Changelog

All notable changes to msvens chess will be documented in this file.

## [Unreleased]

---

## [1.0.0] - 2026-02-14

### Added
- Team detail page for team tournaments
- LASK games grouped with standard in time control filter

### Changed
- Redesigned landing page with cleaner layout
- Migrated to @msvens/schack-se-sdk and switched to pnpm
- Compact display for empty rating charts and team match rows
- Updated Swedish translations for team average ratings

### Fixed
- Team tournament display and table number rule
- Team number display in team detail matches
- ELO fallback in rapid tournaments
- Opponents tab filter now uses ranking algorithm
- H2H table showing fallback ratings instead of actual ratings

## [0.9.0] - 2026-02-04

### Added
- Head-to-head player comparison view
- Global player cache for instant opponent data across navigations
- Global tournament cache for instant tournament data across navigations
- Historical ELO ratings in head-to-head comparisons
- GitHub Actions CI workflow

### Changed
- Results page live refresh now only re-fetches standings, not tournament metadata
- Player pages load significantly faster on repeat visits (cached data)

### Fixed
- Timezone-related date parsing issues
- Live tournament display issues

---

## [0.8.0] - 2026-02-02

### Added
- Player search now shows dropdown for single match to confirm selection

### Changed
- Tournament results default to the last played round instead of Round 1
- Round dates now use actual game dates with fallback to scheduled dates
- Renamed "Live" toggle to "Auto" for live updates
- Results sidebar now switches to dropdown at large breakpoint (was medium)

### Fixed
- Round 1 date not showing when missing from tournament metadata
- ELO display for upcoming rounds
- Result display for team match boards

---

## [0.7.0] - 2026-01-30

### Added
- Live tournament updates with opt-in auto-refresh (30-second polling)
- Manual refresh button for on-demand data updates
- "Last updated" timestamp on tournament results
- Registration list view for tournaments that haven't started yet
- FIDE titles displayed with player names throughout the app
- Date range picker for ELO history chart
- Custom DatePicker component

### Changed
- ELO chart now limits data points based on screen size for better performance
- Per-round rating types supported (standard/rapid/blitz per round)
- Improved tournament state detection (registration vs ongoing vs finished)
- Live controls hidden for finished tournaments

### Fixed
- ELO display and loading flash issues on tournament pages
- Timezone bug in date formatting

---

## [0.6.0] - 2026-01-27

### Added
- Unit test suite for all pure utility functions (140+ new tests)
- Integration tests for searchPlayer, getPlayerEloHistory, getMemberGames, searchComingTournaments, and searchUpdatedTournaments
- Historical ELO support for team tournaments

### Changed
- Restructured organizations into districts, clubs, and SSF pages
- Improved calendar and player info display
- Replaced `<img>` with Next.js Image component for player photos
- Cleaned up and consolidated test data

### Fixed
- Build warnings (unused variables, React hook dependencies, image optimization)
- Walkover detection in tournament player results

---

## [0.5.0] - 2025-01-22

### Added
- Contact page for user feedback (Formspree integration pending)
- Changelog page with structured version history
- Changelog generation script (`yarn generate:changelog`)
- Bilingual About page with project background and acknowledgments

### Changed
- Rebranded from "Stockholm Chess" to "msvens chess"
- Updated site metadata and descriptions to focus on Sweden-wide coverage
- Footer navigation now links to About, Contact, and Changelog
- Footer styling: larger text on desktop, increased padding

---

## [0.4.0] - 2025-01-20

### Added
- Tournament filters for calendar and results pages (category, type, status, district)
- Comprehensive game result handling for all point systems
- PageTitle component for consistent page headers

### Fixed
- Mobile navbar now shows Results and Players icons
- Deduplicated tournament search results

### Changed
- Improved translation system with common section for shared strings

---

## [0.3.0] - 2025-01-15

### Added
- Organizations page with clubs and districts browser
- Club rating lists with filtering by rating type and member category
- Opponents statistics page with progressive loading
- Batch API methods for efficient multi-ID fetching
- Player rating history with batched requests

### Changed
- Unified player page tournament data from games
- Optimized imports with centralized @/lib/api exports
- Enhanced rating display on tournament result pages

---

## [0.2.0] - 2025-01-10

### Added
- Team tournament support with expandable match details
- Club-based player assignments for team tournaments
- W.O. (walkover) handling for forfeited games
- Results page with date range and text search
- Tournament timestamp column showing last update

### Changed
- Centralized API environment configuration
- Simplified player search with recent players in localStorage

### Fixed
- Team tournament result display improvements

---

## [0.1.0] - 2025-01-05

### Added
- Initial release of msvens chess (then Stockholm Chess)
- Tournament calendar with upcoming events
- Tournament results browser
- Player search by name or member ID
- Player profiles with:
  - ELO ratings (standard, rapid, blitz)
  - LASK ratings
  - Tournament history with tabbed navigation
  - ELO rating history chart
  - Player photos from SSF
- Round-by-round results for individual tournaments
- Dark/light theme support
- English and Swedish language support
- Mobile-responsive design

### Infrastructure
- Next.js 15 with App Router
- Tailwind CSS for styling
- API service layer for SSF tournament data
- Jest testing setup
