// Auto-generated from CHANGELOG.md - DO NOT EDIT DIRECTLY
// Run 'yarn generate:changelog' to regenerate

export interface ChangelogSection {
  type: string;
  items: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string | null;
  sections: ChangelogSection[];
}

export const changelog: ChangelogEntry[] = [
  {
    "version": "Unreleased",
    "date": null,
    "sections": [
      {
        "type": "Added",
        "items": [
          "Contact page for user feedback (Formspree integration pending)",
          "Changelog page with structured version history",
          "Changelog generation script (`yarn generate:changelog`)",
          "Bilingual About page with project background and acknowledgments"
        ]
      },
      {
        "type": "Changed",
        "items": [
          "Rebranded from \"Stockholm Chess\" to \"msvens chess\"",
          "Updated site metadata and descriptions to focus on Sweden-wide coverage",
          "Footer navigation now links to About, Contact, and Changelog",
          "Footer styling: larger text on desktop, increased padding"
        ]
      }
    ]
  },
  {
    "version": "0.4.0",
    "date": "2025-01-20",
    "sections": [
      {
        "type": "Added",
        "items": [
          "Tournament filters for calendar and results pages (category, type, status, district)",
          "Comprehensive game result handling for all point systems",
          "PageTitle component for consistent page headers"
        ]
      },
      {
        "type": "Fixed",
        "items": [
          "Mobile navbar now shows Results and Players icons",
          "Deduplicated tournament search results"
        ]
      },
      {
        "type": "Changed",
        "items": [
          "Improved translation system with common section for shared strings"
        ]
      }
    ]
  },
  {
    "version": "0.3.0",
    "date": "2025-01-15",
    "sections": [
      {
        "type": "Added",
        "items": [
          "Organizations page with clubs and districts browser",
          "Club rating lists with filtering by rating type and member category",
          "Opponents statistics page with progressive loading",
          "Batch API methods for efficient multi-ID fetching",
          "Player rating history with batched requests"
        ]
      },
      {
        "type": "Changed",
        "items": [
          "Unified player page tournament data from games",
          "Optimized imports with centralized @/lib/api exports",
          "Enhanced rating display on tournament result pages"
        ]
      }
    ]
  },
  {
    "version": "0.2.0",
    "date": "2025-01-10",
    "sections": [
      {
        "type": "Added",
        "items": [
          "Team tournament support with expandable match details",
          "Club-based player assignments for team tournaments",
          "W.O. (walkover) handling for forfeited games",
          "Results page with date range and text search",
          "Tournament timestamp column showing last update"
        ]
      },
      {
        "type": "Changed",
        "items": [
          "Centralized API environment configuration",
          "Simplified player search with recent players in localStorage"
        ]
      },
      {
        "type": "Fixed",
        "items": [
          "Team tournament result display improvements"
        ]
      }
    ]
  },
  {
    "version": "0.1.0",
    "date": "2025-01-05",
    "sections": [
      {
        "type": "Added",
        "items": [
          "Initial release of msvens chess (then Stockholm Chess)",
          "Tournament calendar with upcoming events",
          "Tournament results browser",
          "Player search by name or member ID",
          "Player profiles with: (ELO ratings (standard, rapid, blitz)) (LASK ratings) (Tournament history with tabbed navigation) (ELO rating history chart) (Player photos from SSF)",
          "Round-by-round results for individual tournaments",
          "Dark/light theme support",
          "English and Swedish language support",
          "Mobile-responsive design"
        ]
      },
      {
        "type": "Infrastructure",
        "items": [
          "Next.js 15 with App Router",
          "Tailwind CSS for styling",
          "API service layer for SSF tournament data",
          "Jest testing setup"
        ]
      }
    ]
  }
];
