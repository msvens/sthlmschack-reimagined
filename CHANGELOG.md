# Changelog

All notable changes to msvens chess will be documented in this file.

## [Unreleased]

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
