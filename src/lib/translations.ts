import { Language } from '@/context/LanguageContext';

export interface Translations {
  navbar: {
    brand: {
      line1: string;
      line2: string;
    };
    navigation: {
      upcomingEvents: string;
      calendar: string;
      results: string;
    };
    language: {
      english: string;
      swedish: string;
    };
  };
  footer: {
    projectInfo: {
      title: string;
      subtitle: string;
    };
    navigation: {
      events: string;
      calendar: string;
      results: string;
      about: string;
    };
    external: {
      poweredBy: string;
    };
  };
  home: {
    hero: {
      title: string;
      titleHighlight: string;
      subtitle: string;
    };
    cards: {
      upcomingEvents: {
        title: string;
        description: string;
        link: string;
      };
      calendar: {
        title: string;
        description: string;
        link: string;
      };
      results: {
        title: string;
        description: string;
        link: string;
      };
    };
    about: {
      title: string;
      paragraph1: string;
      paragraph2: string;
    };
  };
  pages: {
    events: {
      title: string;
      subtitle: string;
      placeholder: string;
    };
    calendar: {
      title: string;
      subtitle: string;
      placeholder: string;
    };
    results: {
      title: string;
      subtitle: string;
      placeholder: string;
    };
  };
}

const translations: Record<Language, Translations> = {
  en: {
    navbar: {
      brand: {
        line1: 'Stockholm',
        line2: 'Chess',
      },
      navigation: {
        upcomingEvents: 'Upcoming Events',
        calendar: 'Calendar',
        results: 'Results',
      },
      language: {
        english: 'English',
        swedish: 'Svenska',
      },
    },
    footer: {
      projectInfo: {
        title: 'Stockholm Chess Reimagined',
        subtitle: 'Modernizing chess tournament discovery in Stockholm',
      },
      navigation: {
        events: 'Events',
        calendar: 'Calendar',
        results: 'Results',
        about: 'About',
      },
      external: {
        poweredBy: 'Powered by',
      },
    },
    home: {
      hero: {
        title: 'Welcome to',
        titleHighlight: 'Stockholm Chess',
        subtitle: 'Discover upcoming tournaments, view results, and stay connected with the chess community in Stockholm.',
      },
      cards: {
        upcomingEvents: {
          title: 'Upcoming Events',
          description: 'Find the latest tournaments and events happening in Stockholm.',
          link: 'Browse Events',
        },
        calendar: {
          title: 'Tournament Calendar',
          description: 'View the full calendar of chess events and tournaments.',
          link: 'View Calendar',
        },
        results: {
          title: 'Tournament Results',
          description: 'Check the latest results and standings from recent tournaments.',
          link: 'View Results',
        },
      },
      about: {
        title: 'About Stockholm Chess Reimagined',
        paragraph1: 'This modern chess portal complements the existing Stockholm Schackförbund and Svenska Schackförbundet websites, focusing specifically on tournament discovery and management. We\'re building a user-friendly interface that makes it easy for chess players of all levels to find and participate in chess events across Stockholm.',
        paragraph2: 'Whether you\'re a beginner looking for your first tournament or an experienced player tracking results, Stockholm Chess Reimagined provides the tools you need to stay connected with the local chess community.',
      },
    },
    pages: {
      events: {
        title: 'Upcoming Events',
        subtitle: 'Discover the latest chess tournaments and events happening in Stockholm.',
        placeholder: 'Event listings coming soon. This page will display upcoming tournaments with details, dates, and registration information.',
      },
      calendar: {
        title: 'Tournament Calendar',
        subtitle: 'View the full calendar of chess events and tournaments across Stockholm.',
        placeholder: 'Calendar view coming soon. This page will display a comprehensive calendar of all chess events with filtering and search capabilities.',
      },
      results: {
        title: 'Tournament Results',
        subtitle: 'Check the latest results and standings from recent chess tournaments.',
        placeholder: 'Tournament results coming soon. This page will display comprehensive results, standings, and player statistics from completed tournaments.',
      },
    },
  },
  sv: {
    navbar: {
      brand: {
        line1: 'Stockholm',
        line2: 'Schack',
      },
      navigation: {
        upcomingEvents: 'Kommande Evenemang',
        calendar: 'Kalender',
        results: 'Resultat',
      },
      language: {
        english: 'English',
        swedish: 'Svenska',
      },
    },
    footer: {
      projectInfo: {
        title: 'Stockholm Schack Omskapat',
        subtitle: 'Moderniserar schackturneringar i Stockholm',
      },
      navigation: {
        events: 'Evenemang',
        calendar: 'Kalender',
        results: 'Resultat',
        about: 'Om',
      },
      external: {
        poweredBy: 'Drivs av',
      },
    },
    home: {
      hero: {
        title: 'Välkommen till',
        titleHighlight: 'Stockholm Schack',
        subtitle: 'Upptäck kommande turneringar, se resultat och håll dig uppdaterad med schackgemenskapen i Stockholm.',
      },
      cards: {
        upcomingEvents: {
          title: 'Kommande Evenemang',
          description: 'Hitta de senaste turneringarna och evenemangen som händer i Stockholm.',
          link: 'Bläddra Evenemang',
        },
        calendar: {
          title: 'Turneringskalender',
          description: 'Se den fullständiga kalendern för schackevenemang och turneringar.',
          link: 'Visa Kalender',
        },
        results: {
          title: 'Turneringsresultat',
          description: 'Kolla de senaste resultaten och placeringarna från nyligen avslutade turneringar.',
          link: 'Visa Resultat',
        },
      },
      about: {
        title: 'Om Stockholm Schack Omskapat',
        paragraph1: 'Denna moderna schackportal kompletterar de befintliga webbplatserna för Stockholm Schackförbund och Svenska Schackförbundet, med fokus specifikt på turneringsupptäckt och hantering. Vi bygger ett användarvänligt gränssnitt som gör det enkelt för schackspelare på alla nivåer att hitta och delta i schackevenemang över hela Stockholm.',
        paragraph2: 'Oavsett om du är en nybörjare som letar efter din första turnering eller en erfaren spelare som spårar resultat, ger Stockholm Schack Omskapat dig verktygen du behöver för att hålla dig uppdaterad med den lokala schackgemenskapen.',
      },
    },
    pages: {
      events: {
        title: 'Kommande Evenemang',
        subtitle: 'Upptäck de senaste schackturneringarna och evenemangen som händer i Stockholm.',
        placeholder: 'Evenemangslistor kommer snart. Denna sida kommer att visa kommande turneringar med detaljer, datum och registreringsinformation.',
      },
      calendar: {
        title: 'Turneringskalender',
        subtitle: 'Se den fullständiga kalendern för schackevenemang och turneringar över hela Stockholm.',
        placeholder: 'Kalendervy kommer snart. Denna sida kommer att visa en omfattande kalender över alla schackevenemang med filtrering och sökfunktioner.',
      },
      results: {
        title: 'Turneringsresultat',
        subtitle: 'Kolla de senaste resultaten och placeringarna från nyligen avslutade schackturneringar.',
        placeholder: 'Turneringsresultat kommer snart. Denna sida kommer att visa omfattande resultat, placeringar och spelarstatistik från avslutade turneringar.',
      },
    },
  },
};

export function getTranslation(language: Language): Translations {
  return translations[language];
}

export function t(language: Language, key: string): string {
  const keys = key.split('.');
  let value: unknown = translations[language];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      console.warn(`Translation key not found: ${key} for language ${language}`);
      return key; // Fallback to key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}
