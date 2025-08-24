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
Open [http://localhost:3005](http://localhost:3005) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Contributing

This project is currently in active development. Contributions and feedback are welcome, particularly around:

- UI/UX improvements
- Tournament data structure design
- Accessibility enhancements
- Performance optimizations
- Swedish language content and localization

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
