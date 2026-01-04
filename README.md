# Stockholm Chess Reimagined

A modern, responsive chess tournament portal for Stockholm, Sweden, built with Next.js and Tailwind CSS. This application serves as a contemporary interface for chess tournaments, events, and results, complementing the existing [Stockholm Schackförbund](https://www.stockholmsschack.se/) and [Svenska Schackförbundet](https://schack.se/) websites.

## Overview

Stockholm Chess Reimagined focuses specifically on tournament management and event discovery, providing chess players with an intuitive way to find upcoming tournaments, view results, and stay informed about chess events in Stockholm. The application is designed to work alongside existing chess federation websites rather than replace them entirely.

## Project Goals

### Primary Objectives
1. **Tournament Discovery**: Easy-to-use event calendar and tournament listings
2. **Results Tracking**: Comprehensive tournament results and player statistics
3. **Modern User Experience**: Clean, responsive design optimized for both desktop and mobile
4. **Bilingual Support**: Full Swedish and English language support
5. **Accessibility**: Dark and light theme support with modern UI best practices

### Secondary Objectives
- Admin interface for tournament management
- Integration with existing chess federation systems
- Player profiles and statistics
- Tournament registration workflows
- News and announcements

## Technical Implementation

### Technology Stack
- **Frontend Framework**: Next.js 15+ with React 19
- **Styling**: Tailwind CSS with custom design system
- **Language**: TypeScript for type safety
- **State Management**: React Context and custom hooks
- **Package Manager**: Yarn
- **Build Tool**: Next.js with webpack (Turbopack available as development option)

### Project Structure
```
src/
├── app/           # Next.js app router pages and layouts
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and configurations
├── pages/         # Additional page components
└── context/       # React context providers
```

### Key Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Theme Support**: Dark and light mode with system preference detection
- **Internationalization**: Swedish (sv) and English (en) language support
- **Component Library**: Consistent UI components following design system
- **Performance**: Optimized loading and modern web practices
- **Development Flexibility**: Easy switching between webpack and Turbopack for development

## User Experience

### Target Audience
- **Chess Players**: All skill levels from beginners to masters
- **Tournament Organizers**: Club representatives and event coordinators
- **Spectators**: Family members and chess enthusiasts
- **Administrators**: Federation staff and tournament directors

### Core User Journeys
1. **Finding Tournaments**: Browse calendar, search by location/date, filter by skill level
2. **Viewing Results**: Check tournament standings, player performance, historical data
3. **Event Information**: Detailed tournament descriptions, schedules, and requirements
4. **Registration**: Tournament entry forms and payment processing (future)
5. **News & Updates**: Latest chess news and tournament announcements

## Design Principles

### Visual Identity
- **Modern Aesthetic**: Clean, professional design inspired by contemporary web applications
- **Chess-Inspired Elements**: Subtle chess motifs without overwhelming the interface
- **Accessibility**: High contrast ratios, readable typography, keyboard navigation
- **Consistency**: Unified design language across all components and pages

### Responsive Strategy
- **Mobile-First**: Primary design focus on mobile devices
- **Progressive Enhancement**: Desktop features built on mobile foundation
- **Touch-Friendly**: Optimized for touch interfaces and mobile gestures
- **Performance**: Fast loading times across all device types

### Design System & Color Palette

#### Foundation
This project's design system is originally inspired by [Material UI (MUI)](https://mui.com/), with adaptations for Tailwind CSS and context-specific UX improvements.

#### Color Scheme
Following Tailwind CSS conventions with context-aware adjustments for optimal readability:

**Primary Text** (Body paragraphs, headings, main content):
- Light mode: `text-gray-900` - Maximum contrast for readability
- Dark mode: `dark:text-gray-200` or `dark:text-gray-100` - Bright for maximum readability

**Secondary Text** (Labels, metadata, helper text):
- Light mode: `text-gray-600`
- Dark mode: `dark:text-gray-400`

**Muted/Tertiary** (Timestamps, placeholders, disabled states):
- Light mode: `text-gray-500`
- Dark mode: `dark:text-gray-500`

#### Component-Specific Exceptions

**Table Body Cells**:
- Light mode: `text-gray-900` (primary)
- Dark mode: `dark:text-gray-400` (deliberately using secondary color)
- **Rationale**: In data-dense tables with many rows, bright white text (`dark:text-gray-200`) can cause eye strain. Using a softer `gray-400` improves reading comfort in dark mode while maintaining readability.

**Table Headers**:
- Light mode: `text-gray-900`
- Dark mode: `dark:text-gray-200` (standard primary)

#### Design Rationale
While MUI served as our initial inspiration, we've made intentional UX-driven deviations:
- Tables use softer text in dark mode (`gray-400` instead of `white`) to reduce eye strain
- This is a deliberate exception to the general primary text pattern
- Light mode maintains consistent high contrast across all components

#### Component Styling
All components use Tailwind CSS utility classes with the `dark:` prefix for theme-aware styling. Custom theme colors are defined in `src/app/globals.css` using Tailwind's `@theme` directive.

## Development Roadmap

### Phase 1: Foundation (Current)
- [x] Project setup and structure
- [x] README and project documentation
- [x] Basic navigation and layout
- [x] Theme system implementation
- [x] Language switching functionality
- [x] Responsive design framework
- [x] mphotos-ui design system integration

### Phase 2: Core Features
- [ ] Tournament calendar view
- [ ] Tournament listing pages
- [ ] Results display components
- [ ] Search and filtering
- [ ] Mock data integration

### Phase 3: Enhanced Functionality
- [ ] Admin interface
- [ ] Tournament management
- [ ] Player profiles
- [ ] Advanced search
- [ ] API integration planning

### Phase 4: Production Ready
- [ ] Real data integration
- [ ] Performance optimization
- [ ] Testing and quality assurance
- [ ] Deployment and monitoring

## Performance Optimizations

### Future Improvement: Lazy Loading Player Data in Team Tournaments

**Current Implementation (Option 1):**
When loading team tournament results, the application:
1. Fetches and displays team standings table immediately
2. Fetches ALL player info for ALL games in the background (non-blocking)
3. Player names appear in expanded match views once loaded

This approach provides instant team standings display while player data loads in the background.

**Potential Future Optimization (Option 2):**
Implement lazy loading of player data on match expansion:

**Benefits:**
- **Reduced API load**: Only fetch players for matches the user actually expands
- **Better API citizenship**: Spreads API calls over time instead of burst loading
- **Faster initial load**: Zero player API calls on page load
- **User-driven fetching**: Average user views 2-3 matches = ~60-80 API calls instead of ~420

**Implementation Strategy:**
1. On match expansion, extract player IDs from that specific match's games (~14-28 players)
2. Check which players are already in the playerMap cache
3. Fetch only missing players in parallel
4. Display loading skeleton while fetching
5. Cache all fetched players for subsequent expansions (no re-fetching needed)

**Complexity Estimate:** ~3-4 hours of implementation
- Add loading state per expanded match
- Filter missing player IDs before fetching
- Handle async fetch with loading/error states
- Update playerMap via context when players loaded

**When to Consider:**
- If API rate limiting becomes an issue
- If initial load time feedback from users
- If analytics show most users don't expand all matches

**Note:** Player data caching across expansions is correct behavior - player info doesn't change mid-session, and page refresh handles any updates.

## Getting Started

### Prerequisites
- Node.js 18+ 
- Yarn package manager
- Modern web browser

### Installation
```bash
# Clone the repository
git clone https://github.com/msvens/sthlmschack-reimagined.git
cd sthlmschack-reimagined

# Install dependencies
yarn install

# Start development server
yarn dev
```

### Development Commands
- `yarn dev` - Start development server with webpack
- `yarn dev:turbo` - Start development server with Turbopack (experimental)
- `yarn build` - Build production application
- `yarn start` - Start production server
- `yarn lint` - Run ESLint for code quality

### Quick Start
Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Contributing

This project is currently in active development. Contributions and feedback are welcome, particularly around:

- UI/UX improvements
- Tournament data structure design
- Accessibility enhancements
- Performance optimizations
- Swedish language content and localization

## API Documentation

This project integrates with the Svenska Schackförbundet API:

- **API Specification**: [https://member.schack.se/memdb/v3/api-docs](https://member.schack.se/memdb/v3/api-docs)
- **Swagger UI (Testing)**: [https://member.schack.se/swagger-ui/index.html](https://member.schack.se/swagger-ui/index.html)

### API Architecture

To avoid CORS issues and keep the browser happy, this project uses a **proxy architecture**:

1. **Frontend** calls local proxy URLs (e.g., `/api/chess/v1/...`)
2. **Next.js server** rewrites these requests to remote APIs (see `next.config.ts`)
3. **Browser** never directly calls the external API

This architecture provides:
- ✅ No CORS errors
- ✅ Cleaner client-side code
- ✅ Easy environment switching
- ✅ API URL abstraction

### Environment Configuration

The API configuration is centralized in `src/lib/api/constants.ts`:

**Production Environment:**
- Frontend calls: `/api/chess/v1/:path*`
- Next.js rewrites to: `https://member.schack.se/public/api/v1/:path*`

**Development Environment (Halvarsson Test Server):**
- Frontend calls: `/api/chess-dev/v1/:path*`
- Next.js rewrites to: `https://halvarsson.no-ip.com/webapp/memdb/public/api/v1/:path*`

### Switching Environments

**For Frontend (Services):**
Edit `src/lib/api/constants.ts` and change `CURRENT_API_URL`:
```typescript
// Production (default)
export const CURRENT_API_URL = SSF_PROXY_URL;

// Development
// export const CURRENT_API_URL = SSF_DEV_PROXY_URL;
```

**For Tests (Direct API calls):**
Edit `src/lib/api/constants.ts` and change `CURRENT_TEST_API_URL`:
```typescript
// Production (default)
export const CURRENT_TEST_API_URL = SSF_PROD_API_URL;

// Development
// export const CURRENT_TEST_API_URL = SSF_DEV_API_URL;
```

### Why Two Different Constants?

- **`CURRENT_API_URL`**: Used by frontend services (uses proxy URLs like `/api/chess/v1`)
- **`CURRENT_TEST_API_URL`**: Used by integration tests (uses direct URLs, no Next.js server running)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.


## License

[License information to be determined]

## Acknowledgments

- Inspired by the existing [Stockholm Schackförbund](https://www.stockholmsschack.se/) website
- Built upon the foundation of [Svenska Schackförbundet](https://schack.se/)
- Project structure inspired by [mphotos-ui](https://github.com/msvens/mphotos-ui)
- Built with modern web technologies and best practices

---

*Stockholm Chess Reimagined - Modernizing chess tournament discovery and management in Stockholm*
