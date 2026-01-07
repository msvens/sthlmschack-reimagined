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
      players: string;
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
      players: string;
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
      players: {
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
  common: {
    eloLabels: {
      standard: string;
      rapid: string;
      blitz: string;
      lask: string;
      ratingHistory: string;
      loadingHistory: string;
      eloChange: string;
      performanceRating: string;
    };
  };
  components: {
    districtFilter: {
      loading: string;
      district: string;
      all: string;
      allDistricts: string;
      showAll: string;
      other: string;
      tournamentsWithoutDistrict: string;
    };
    playerHistory: {
      teamTournamentHistory: string;
      opponentStatistics: string;
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
      tournamentList: {
        tournament: string;
        organizer: string;
        start: string;
        end: string;
        lastUpdated: string;
        loading: string;
        noTournaments: string;
      };
    };
    results: {
      title: string;
      subtitle: string;
      placeholder: string;
      filters: {
        dateRange: {
          title: string;
          startDate: string;
          endDate: string;
          searchButton: string;
          clearButton: string;
        };
        textSearch: {
          title: string;
          placeholder: string;
          searchButton: string;
          clearButton: string;
          betaNotice: string;
        };
      };
      tournamentList: {
        tournament: string;
        organizer: string;
        start: string;
        end: string;
        lastUpdated: string;
        loading: string;
        noTournaments: string;
      };
    };
    players: {
      title: string;
      subtitle: string;
      search: {
        byName: string;
        byMemberId: string;
        searchButton: string;
        clearButton: string;
        noResults: string;
        searchPlaceholder: string;
        memberIdPlaceholder: string;
      };
      recentPlayers: string;
    };
    playerDetail: {
      loading: string;
      error: string;
      notFound: string;
      backButton: string;
      playerInfo: {
        title: string;
        memberId: string;
        firstName: string;
        lastName: string;
        club: string;
      };
      eloRating: {
        title: string;
        standardRating: string;
        rapidRating: string;
        blitzRating: string;
        fideTitle: string;
        date: string;
        kFactor: string;
        noData: string;
      };
      laskRating: {
        title: string;
        rating: string;
        date: string;
        noData: string;
      };
      additionalInfo: {
        title: string;
        fideId: string;
        birthDate: string;
      };
      tournamentHistory: {
        title: string;
        loading: string;
        error: string;
        noTournaments: string;
        place: string;
        points: string;
      };
      tabs: {
        individual: string;
        team: string;
        opponents: string;
      };
      matches: string;
      total: string;
      noMatchesFound: string;
      loadingMatches: string;
      of: string;
    };
    tournamentResults: {
      loading: string;
      error: string;
      notFound: string;
      groups: string;
      finalResults: string;
      finalResultsTable: {
        pos: string;
        name: string;
        club: string;
        ranking: string;
        gp: string;
        won: string;
        draw: string;
        lost: string;
        points: string;
        qp: string;
        noResults: string;
        loadingResults: string;
      };
      teamFinalResultsTable: {
        pos: string;
        team: string;
        sp: string;
        won: string;
        draw: string;
        lost: string;
        pp: string;
        mp: string;
        noResults: string;
        loadingResults: string;
      };
      roundByRound: {
        title: string;
        white: string;
        black: string;
        table: string;
        elo: string;
        result: string;
        noResults: string;
        round: string;
      };
      teamRoundResults: {
        board: string;
        homeTeam: string;
        awayTeam: string;
        elo: string;
        result: string;
      };
      selectGroup: string;
      tournamentStatus: {
        hasNotStarted: string;
        groupStarts: string;
        noResultsAvailable: string;
        groupCancelled: string;
        resultsComing: string;
      };
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
        players: 'Players',
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
        players: 'Players',
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
        players: {
          title: 'Players',
          description: 'Search and explore chess players, their ratings, and tournament history.',
          link: 'Browse Players',
        },
      },
      about: {
        title: 'About Stockholm Chess Reimagined',
        paragraph1: 'This modern chess portal complements the existing Stockholm Schackförbund and Svenska Schackförbundet websites, focusing specifically on tournament discovery and management. We\'re building a user-friendly interface that makes it easy for chess players of all levels to find and participate in chess events across Stockholm.',
        paragraph2: 'Whether you\'re a beginner looking for your first tournament or an experienced player tracking results, Stockholm Chess Reimagined provides the tools you need to stay connected with the local chess community.',
      },
    },
    common: {
      eloLabels: {
        standard: 'ELO',
        rapid: 'Rapid ELO',
        blitz: 'Blitz ELO',
        lask: 'LASK',
        ratingHistory: 'Rating History',
        loadingHistory: 'Loading history...',
        eloChange: 'ELO +/-',
        performanceRating: 'Performance Rating',
      },
    },
    components: {
      districtFilter: {
        loading: 'Loading organizations...',
        district: 'District',
        all: 'All',
        allDistricts: 'All Districts',
        showAll: 'Show all',
        other: 'Other',
        tournamentsWithoutDistrict: 'Tournaments without district',
      },
      playerHistory: {
        teamTournamentHistory: 'Team tournament history coming soon',
        opponentStatistics: 'Opponent statistics coming soon',
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
        tournamentList: {
          tournament: 'Tournament',
          organizer: 'Organizer',
          start: 'Start',
          end: 'End',
          lastUpdated: 'Updated',
          loading: 'Loading tournaments...',
          noTournaments: 'No upcoming tournaments found',
        },
      },
      results: {
        title: 'Tournament Results',
        subtitle: 'Check the latest results and standings from recent chess tournaments.',
        placeholder: 'Tournament results coming soon. This page will display comprehensive results, standings, and player statistics from completed tournaments.',
        filters: {
          dateRange: {
            title: 'Search by Date Range',
            startDate: 'Start Date',
            endDate: 'End Date',
            searchButton: 'Search',
            clearButton: 'Clear',
          },
          textSearch: {
            title: 'Search by Name or Location',
            placeholder: 'Enter tournament name or location...',
            searchButton: 'Search',
            clearButton: 'Clear',
            betaNotice: 'Note: Text search is in testing and may not return exact matches.',
          },
        },
        tournamentList: {
          tournament: 'Tournament',
          organizer: 'Organizer',
          start: 'Start',
          end: 'End',
          lastUpdated: 'Updated',
          loading: 'Loading tournaments...',
          noTournaments: 'No tournaments found',
        },
      },
      players: {
        title: 'Players',
        subtitle: 'Search and explore chess players, their ratings, and tournament history.',
        search: {
          byName: 'Search by Name',
          byMemberId: 'Search by Member ID',
          searchButton: 'Search',
          clearButton: 'Clear',
          noResults: 'No players found. Try a different search term.',
          searchPlaceholder: 'Enter first or last name...',
          memberIdPlaceholder: 'Enter member ID...',
        },
        recentPlayers: 'Recent Players',
      },
      playerDetail: {
        loading: 'Loading player information...',
        error: 'Failed to load player information',
        notFound: 'Player not found',
        backButton: 'Back to Players',
        playerInfo: {
          title: 'Player Information',
          memberId: 'Member ID',
          firstName: 'First Name',
          lastName: 'Last Name',
          club: 'Club',
        },
        eloRating: {
          title: 'ELO Rating',
          standardRating: 'Standard Rating',
          rapidRating: 'Rapid Rating',
          blitzRating: 'Blitz Rating',
          fideTitle: 'Title',
          date: 'Date',
          kFactor: 'K-Factor',
          noData: 'No ELO rating data available',
        },
        laskRating: {
          title: 'LASK Rating',
          rating: 'Rating',
          date: 'Date',
          noData: 'No LASK rating data available',
        },
        additionalInfo: {
          title: 'Additional Information',
          fideId: 'FIDE ID',
          birthDate: 'Birth Date',
        },
        tournamentHistory: {
          title: 'Tournament History',
          loading: 'Loading tournaments...',
          error: 'Failed to load tournament history',
          noTournaments: 'No tournament history found.',
          place: 'Place',
          points: 'Points',
        },
        tabs: {
          individual: 'Individual',
          team: 'Team',
          opponents: 'Opponents',
        },
        matches: 'Matches',
        total: 'Total',
        noMatchesFound: 'No matches found',
        loadingMatches: 'Loading matches...',
        of: 'of',
      },
      tournamentResults: {
        loading: 'Loading tournament results...',
        error: 'Error Loading Tournament',
        notFound: 'Tournament not found',
        groups: 'Groups',
        finalResults: 'Final Results',
        finalResultsTable: {
          pos: 'Pos',
          name: 'Name',
          club: 'Club',
          ranking: 'ELO',
          gp: 'GP',
          won: '+',
          draw: '=',
          lost: '-',
          points: 'Pts',
          qp: 'QP',
          noResults: 'No results available for this group',
          loadingResults: 'Loading results...',
        },
        teamFinalResultsTable: {
          pos: 'Pos',
          team: 'Team',
          sp: 'MP',
          won: '+',
          draw: '=',
          lost: '-',
          pp: 'BP',
          mp: 'Pts',
          noResults: 'No results available for this group',
          loadingResults: 'Loading results...',
        },
        roundByRound: {
          title: 'Rounds',
          white: 'White',
          black: 'Black',
          table: 'Table',
          elo: 'ELO',
          result: 'Result',
          noResults: 'No round results available for this group',
          round: 'Round',
        },
        teamRoundResults: {
          board: 'Board',
          homeTeam: 'Home',
          awayTeam: 'Away',
          elo: 'ELO',
          result: 'Result',
        },
        selectGroup: 'Please select a group to view results',
        tournamentStatus: {
          hasNotStarted: 'Tournament has not started yet',
          groupStarts: 'Group starts:',
          noResultsAvailable: 'No results available',
          groupCancelled: 'This group may have been cancelled',
          resultsComing: 'Results coming soon...',
        },
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
        players: 'Spelare',
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
        players: 'Spelare',
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
        players: {
          title: 'Spelare',
          description: 'Sök och utforska schackspelare, deras rating och turneringshistorik.',
          link: 'Bläddra Spelare',
        },
      },
      about: {
        title: 'Om Stockholm Schack Omskapat',
        paragraph1: 'Denna moderna schackportal kompletterar de befintliga webbplatserna för Stockholm Schackförbund och Svenska Schackförbundet, med fokus specifikt på turneringsupptäckt och hantering. Vi bygger ett användarvänligt gränssnitt som gör det enkelt för schackspelare på alla nivåer att hitta och delta i schackevenemang över hela Stockholm.',
        paragraph2: 'Oavsett om du är en nybörjare som letar efter din första turnering eller en erfaren spelare som spårar resultat, ger Stockholm Schack Omskapat dig verktygen du behöver för att hålla dig uppdaterad med den lokala schackgemenskapen.',
      },
    },
    common: {
      eloLabels: {
        standard: 'ELO',
        rapid: 'Snabb-ELO',
        blitz: 'Blixt-ELO',
        lask: 'LASK',
        ratingHistory: 'Rankingutveckling',
        loadingHistory: 'Laddar historik...',
        eloChange: 'ELO +/-',
        performanceRating: 'ELO prestation',
      },
    },
    components: {
      districtFilter: {
        loading: 'Laddar organisationer...',
        district: 'Distrikt',
        all: 'Alla',
        allDistricts: 'Alla distrikt',
        showAll: 'Visa alla',
        other: 'Övriga',
        tournamentsWithoutDistrict: 'Turneringar utan distrikt',
      },
      playerHistory: {
        teamTournamentHistory: 'Lagturneringshistorik kommer snart',
        opponentStatistics: 'Motståndarstatistik kommer snart',
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
        tournamentList: {
          tournament: 'Turnering',
          organizer: 'Arrangör',
          start: 'Start',
          end: 'Slut',
          lastUpdated: 'Uppdaterad',
          loading: 'Laddar turneringar...',
          noTournaments: 'Inga kommande turneringar hittades',
        },
      },
      results: {
        title: 'Turneringsresultat',
        subtitle: 'Kolla de senaste resultaten och placeringarna från nyligen avslutade schackturneringar.',
        placeholder: 'Turneringsresultat kommer snart. Denna sida kommer att visa omfattande resultat, placeringar och spelarstatistik från avslutade turneringar.',
        filters: {
          dateRange: {
            title: 'Sök efter Datumintervall',
            startDate: 'Startdatum',
            endDate: 'Slutdatum',
            searchButton: 'Sök',
            clearButton: 'Rensa',
          },
          textSearch: {
            title: 'Sök efter Namn eller Plats',
            placeholder: 'Ange turneringsnamn eller plats...',
            searchButton: 'Sök',
            clearButton: 'Rensa',
            betaNotice: 'Obs: Textsökning är under testning och kan ge inexakta resultat.',
          },
        },
        tournamentList: {
          tournament: 'Turnering',
          organizer: 'Arrangör',
          start: 'Start',
          end: 'Slut',
          lastUpdated: 'Uppdaterad',
          loading: 'Laddar turneringar...',
          noTournaments: 'Inga turneringar hittades',
        },
      },
      players: {
        title: 'Spelare',
        subtitle: 'Sök och utforska schackspelare, deras rating och turneringshistorik.',
        search: {
          byName: 'Sök efter Namn',
          byMemberId: 'Sök efter Medlems-ID',
          searchButton: 'Sök',
          clearButton: 'Rensa',
          noResults: 'Inga spelare hittades. Prova en annan sökterm.',
          searchPlaceholder: 'Ange förnamn eller efternamn...',
          memberIdPlaceholder: 'Ange medlems-ID...',
        },
        recentPlayers: 'Senaste Spelare',
      },
      playerDetail: {
        loading: 'Laddar spelarinformation...',
        error: 'Misslyckades att ladda spelarinformation',
        notFound: 'Spelare hittades inte',
        backButton: 'Tillbaka till Spelare',
        playerInfo: {
          title: 'Spelarinformation',
          memberId: 'Medlems-ID',
          firstName: 'Förnamn',
          lastName: 'Efternamn',
          club: 'Klubb',
        },
        eloRating: {
          title: 'ELO Rating',
          standardRating: 'Standard Rating',
          rapidRating: 'Rapid Rating',
          blitzRating: 'Blitz Rating',
          fideTitle: 'Titel',
          date: 'Datum',
          kFactor: 'K-Faktor',
          noData: 'Ingen ELO ratingdata tillgänglig',
        },
        laskRating: {
          title: 'LASK Rating',
          rating: 'Rating',
          date: 'Datum',
          noData: 'Ingen LASK ratingdata tillgänglig',
        },
        additionalInfo: {
          title: 'Ytterligare Information',
          fideId: 'FIDE ID',
          birthDate: 'Födelsedatum',
        },
        tournamentHistory: {
          title: 'Turneringshistorik',
          loading: 'Laddar turneringar...',
          error: 'Misslyckades att ladda turneringshistorik',
          noTournaments: 'Ingen turneringshistorik hittades.',
          place: 'Placering',
          points: 'Poäng',
        },
        tabs: {
          individual: 'Individuell',
          team: 'Lag',
          opponents: 'Motståndare',
        },
        matches: 'Partier',
        total: 'Totalt',
        noMatchesFound: 'Inga partier hittades',
        loadingMatches: 'Laddar partier...',
        of: 'av',
      },
      tournamentResults: {
        loading: 'Laddar turneringsresultat...',
        error: 'Fel vid laddning av turnering',
        notFound: 'Turnering hittades inte',
        groups: 'Grupper',
        finalResults: 'Slutresultat',
        finalResultsTable: {
          pos: 'Plac',
          name: 'Namn',
          club: 'Klubb',
          ranking: 'ELO',
          gp: 'SP',
          won: '+',
          draw: '=',
          lost: '-',
          points: 'P',
          qp: 'KP',
          noResults: 'Inga resultat tillgängliga för denna grupp',
          loadingResults: 'Laddar resultat...',
        },
        teamFinalResultsTable: {
          pos: 'Plac',
          team: 'Lag',
          sp: 'MP',
          won: '+',
          draw: '=',
          lost: '-',
          pp: 'BP',
          mp: 'P',
          noResults: 'Inga resultat tillgängliga för denna grupp',
          loadingResults: 'Laddar resultat...',
        },
        roundByRound: {
          title: 'Ronder',
          white: 'Vit',
          black: 'Svart',
          table: 'Bord',
          elo: 'ELO',
          result: 'Resultat',
          noResults: 'Inga rondresultat tillgängliga för denna grupp',
          round: 'Rond',
        },
        teamRoundResults: {
          board: 'Bräde',
          homeTeam: 'Hemma',
          awayTeam: 'Borta',
          elo: 'ELO',
          result: 'Resultat',
        },
        selectGroup: 'Vänligen välj en grupp för att se resultat',
        tournamentStatus: {
          hasNotStarted: 'Turneringen har inte startat än',
          groupStarts: 'Grupp börjar:',
          noResultsAvailable: 'Inga resultat tillgängliga',
          groupCancelled: 'Denna grupp kan ha ställts in',
          resultsComing: 'Resultat kommer snart...',
        },
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
