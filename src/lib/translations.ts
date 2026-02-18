import { Language } from '@/context/LanguageContext';

export interface Translations {
  navbar: {
    navigation: {
      upcomingEvents: string;
      calendar: string;
      results: string;
      players: string;
      organizations: string;
    };
    language: {
      english: string;
      swedish: string;
    };
    more: string;
    darkMode: string;
    lightMode: string;
  };
  footer: {
    projectInfo: {
      title: string;
      subtitle: string;
    };
    navigation: {
      about: string;
      contact: string;
      changelog: string;
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
      organizations: {
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
      rapidEloChange: string;
      blitzEloChange: string;
      rapidPerformance: string;
      blitzPerformance: string;
    };
    actions: {
      search: string;
      clear: string;
    };
    filters: {
      all: string;
    };
    labels: {
      date: string;
    };
    states: {
      loading: string;
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
    tournamentCategoryFilter: {
      label: string;
      all: string;
      team: string;
      individual: string;
    };
    tournamentTypeFilter: {
      label: string;
      all: string;
      allsvenskan: string;
      individual: string;
      smTree: string;
      schoolSm: string;
      svenskaCupen: string;
      grandPrix: string;
      yes2chess: string;
      schackfyran: string;
    };
    tournamentStateFilter: {
      label: string;
      all: string;
      registration: string;
      started: string;
      finished: string;
    };
  };
  pages: {
    contact: {
      title: string;
      subtitle: string;
      form: {
        email: string;
        emailPlaceholder: string;
        message: string;
        messagePlaceholder: string;
        submit: string;
        sending: string;
        success: string;
        error: string;
      };
    };
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
        birthYear: string;
      };
      tournamentHistory: {
        title: string;
        loading: string;
        error: string;
        noTournaments: string;
        place: string;
        points: string;
        outcome: string;
      };
      tabs: {
        individual: string;
        team: string;
        opponents: string;
      };
      viewFullProfile: string;
      opponentsTab: {
        title: string;
        timeControl: {
          label: string;
          all: string;
          standard: string;
          rapid: string;
          blitz: string;
          unrated: string;
        };
        charts: {
          all: string;
          white: string;
          black: string;
        };
        table: {
          white: string;
          black: string;
          result: string;
          tournament: string;
          retrieving: string;
          unknown: string;
        };
        stats: {
          wins: string;
          draws: string;
          losses: string;
        };
        noOpponents: string;
        ratingNote: string;
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
      ongoingResults: string;
      statusOngoing: string;
      statusFinished: string;
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
      registrationTable: {
        title: string;
        pos: string;
        name: string;
        club: string;
        rating: string;
        noRegistrations: string;
        loadingRegistrations: string;
      };
      liveUpdates: {
        label: string;
        lastUpdated: string;
        refresh: string;
      };
      teamDetailPage: {
        backToStandings: string;
        matchesPlayed: string;
        winDrawLoss: string;
        boardPoints: string;
        matchPoints: string;
        noMatches: string;
        position: string;
        teamAvgRating: string;
        opponentAvgRating: string;
      };
    };
    elo: {
      navigation: {
        basics: string;
        formula: string;
        finePrint: string;
        calculator: string;
      };
      calculator: {
        title: string;
        player1: string;
        player2: string;
        rating: string;
        eloType: string;
        standard: string;
        rapid: string;
        blitz: string;
        result: string;
        player1Wins: string;
        draw: string;
        player2Wins: string;
        kFactor: string;
        auto: string;
        manual: string;
        calculate: string;
        expectedScore: string;
        ratingChange: string;
        newRating: string;
        inputMode: string;
        manualInput: string;
        searchPlayer: string;
        memberId: string;
        topPlayer: string;
        firstName: string;
        lastName: string;
        search: string;
        selectPlayer: string;
        noResults: string;
        searching: string;
        enterRating: string;
        enterMemberId: string;
        lookingUp: string;
        playerNotFound: string;
        selectTopPlayer: string;
        men: string;
        women: string;
        removeCap: string;
        uncapped: string;
        performanceRating: string;
        autoHint: string;
      };
    };
    organizations: {
      title: string;
      subtitle: string;
      districtLabel: string;
      clubLabel: string;
      allDistricts: string;
      allClubs: string;
      selectDistrict: string;
      selectClub: string;
      clubsCount: string;
      street: string;
      zipcode: string;
      city: string;
      email: string;
      website: string;
      schoolClub: string;
      yes: string;
      no: string;
      loading: string;
      ratingList: {
        title: string;
        dateLabel: string;
        ratingTypeLabel: string;
        memberTypeLabel: string;
        standard: string;
        rapid: string;
        blitz: string;
        memberTypes: {
          all: string;
          women: string;
          juniors: string;
          cadets: string;
          minors: string;
          kids: string;
          veterans: string;
          y2cElementary: string;
          y2cGrade5: string;
          y2cGrade6: string;
          y2cMiddleSchool: string;
        };
        tableHeaders: {
          rank: string;
          title: string;
          firstName: string;
          lastName: string;
          rating: string;
        };
        loading: string;
        noPlayers: string;
      };
      ssf: {
        title: string;
        subtitle: string;
        description: string;
      };
      districts: {
        title: string;
        subtitle: string;
        selectDistrict: string;
      };
      clubs: {
        title: string;
        subtitle: string;
        searchPlaceholder: string;
        browseByDistrict: string;
        activeClubs: string;
        district: string;
      };
      navigation: {
        ssfRanking: string;
        districts: string;
        clubs: string;
        searchClubs: string;
      };
      pagination: {
        showing: string;
        of: string;
        players: string;
      };
    };
  };
}

const translations: Record<Language, Translations> = {
  en: {
    navbar: {
      navigation: {
        upcomingEvents: 'Upcoming Events',
        calendar: 'Calendar',
        results: 'Results',
        players: 'Players',
        organizations: 'Clubs & Districts',
      },
      language: {
        english: 'English',
        swedish: 'Svenska',
      },
      more: 'More',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
    },
    footer: {
      projectInfo: {
        title: 'msvens chess',
        subtitle: 'Modernizing chess tournament discovery in Sweden',
      },
      navigation: {
        about: 'About',
        contact: 'Contact',
        changelog: 'Changelog',
      },
      external: {
        poweredBy: 'Powered by',
      },
    },
    home: {
      hero: {
        title: 'Welcome to',
        titleHighlight: 'msvens chess',
        subtitle: 'Discover upcoming tournaments, view results, and stay connected with the chess community in Sweden.',
      },
      cards: {
        upcomingEvents: {
          title: 'Upcoming Events',
          description: 'Find the latest tournaments and events happening in Sweden.',
          link: 'Browse Events',
        },
        calendar: {
          title: 'Tournament Calendar',
          description: 'View the full calendar of chess events and tournaments.',
          link: 'View Calendar',
        },
        results: {
          title: 'Tournament Results',
          description: 'Check the latest results and standings.',
          link: 'View Results',
        },
        players: {
          title: 'Players',
          description: 'Search and explore chess players, their ratings, and tournament history.',
          link: 'Browse Players',
        },
        organizations: {
          title: 'Clubs & Districts',
          description: 'Browse chess clubs and districts in Sweden.',
          link: 'Browse Organizations',
        },
      },
      about: {
        title: 'About msvens chess',
        paragraph1: 'This modern chess portal complements the existing Svenska Schackförbundet website, focusing specifically on tournament discovery and management. We\'re building a user-friendly interface that makes it easy for chess players of all levels to find and participate in chess events across Sweden.',
        paragraph2: 'Whether you\'re a beginner looking for your first tournament or an experienced player tracking results, msvens chess provides the tools you need to stay connected with the chess community.',
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
        rapidEloChange: 'Rapid ELO +/-',
        blitzEloChange: 'Blitz ELO +/-',
        rapidPerformance: 'Rapid Performance',
        blitzPerformance: 'Blitz Performance',
      },
      actions: {
        search: 'Search',
        clear: 'Clear',
      },
      filters: {
        all: 'All',
      },
      labels: {
        date: 'Date',
      },
      states: {
        loading: 'Loading...',
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
      tournamentCategoryFilter: {
        label: 'Category',
        all: 'All',
        team: 'Team',
        individual: 'Individual',
      },
      tournamentTypeFilter: {
        label: 'Type',
        all: 'All',
        allsvenskan: 'Allsvenskan',
        individual: 'Individual',
        smTree: 'SM-Trean',
        schoolSm: 'Skol-SM',
        svenskaCupen: 'Svenska Cupen',
        grandPrix: 'Grand Prix',
        yes2chess: 'Yes2Chess',
        schackfyran: 'Schackfyran',
      },
      tournamentStateFilter: {
        label: 'Status',
        all: 'All',
        registration: 'Registration',
        started: 'In Progress',
        finished: 'Finished',
      },
    },
    pages: {
      contact: {
        title: 'Feedback',
        subtitle: 'Have a suggestion or found a bug? Let us know!',
        form: {
          email: 'Your Email',
          emailPlaceholder: 'name@example.com',
          message: 'Message',
          messagePlaceholder: 'Share your thoughts, suggestions, or report an issue...',
          submit: 'Send Feedback',
          sending: 'Sending...',
          success: 'Thank you for your feedback! We\'ll get back to you if needed.',
          error: 'Something went wrong. Please try again later.',
        },
      },
      events: {
        title: 'Upcoming Events',
        subtitle: 'Discover the latest chess tournaments and events happening in Sweden.',
        placeholder: 'Event listings coming soon. This page will display upcoming tournaments with details, dates, and registration information.',
      },
      calendar: {
        title: 'Tournament Calendar',
        subtitle: 'View the full calendar of chess events and tournaments across Sweden.',
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
        subtitle: 'Check the latest results and standings.',
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
          title: 'ELO',
          standardRating: 'ELO',
          rapidRating: 'Rapid ELO',
          blitzRating: 'Blitz ELO',
          fideTitle: 'Title',
          date: 'Date',
          kFactor: 'K-Factor',
          noData: 'No ELO rating data available',
        },
        laskRating: {
          title: 'LASK',
          rating: 'Rating',
          date: 'Date',
          noData: 'No LASK rating data available',
        },
        additionalInfo: {
          title: 'Additional Information',
          fideId: 'FIDE ID',
          birthDate: 'Birth Date',
          birthYear: 'Birth Year',
        },
        tournamentHistory: {
          title: 'Tournament History',
          loading: 'Loading tournaments...',
          error: 'Failed to load tournament history',
          noTournaments: 'No tournament history found.',
          place: 'Place',
          points: 'Points',
          outcome: 'Outcome',
        },
        tabs: {
          individual: 'Individual',
          team: 'Team',
          opponents: 'Opponents',
        },
        viewFullProfile: 'View Full Profile',
        opponentsTab: {
          title: 'Opponents',
          timeControl: {
            label: 'Game Type',
            all: 'All',
            standard: 'Standard',
            rapid: 'Rapid',
            blitz: 'Blitz',
            unrated: 'Unrated',
          },
          charts: {
            all: 'All',
            white: 'White',
            black: 'Black',
          },
          table: {
            white: 'White',
            black: 'Black',
            result: 'Result',
            tournament: 'Tournament',
            retrieving: 'Retrieving',
            unknown: 'Unknown',
          },
          stats: {
            wins: 'Wins',
            draws: 'Draws',
            losses: 'Losses',
          },
          noOpponents: 'No opponents found',
          ratingNote: 'Latest ratings shown (may differ from game-time ratings)',
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
        ongoingResults: 'Results',
        statusOngoing: 'Ongoing',
        statusFinished: 'Finished',
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
          sp: 'GP',
          won: '+',
          draw: '=',
          lost: '-',
          pp: 'PP',
          mp: 'MP',
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
        registrationTable: {
          title: 'Registered Players',
          pos: '#',
          name: 'Name',
          club: 'Club',
          rating: 'Rating',
          noRegistrations: 'No registered players',
          loadingRegistrations: 'Loading registrations...',
        },
        liveUpdates: {
          label: 'Auto',
          lastUpdated: 'Updated',
          refresh: 'Refresh',
        },
        teamDetailPage: {
          backToStandings: 'Back to standings',
          matchesPlayed: 'MP',
          winDrawLoss: 'W-D-L',
          boardPoints: 'BP',
          matchPoints: 'Pts',
          noMatches: 'No matches played yet',
          position: 'Pos',
          teamAvgRating: 'Team Avg Rating',
          opponentAvgRating: 'Opponents Avg Rating',
        },
      },
      elo: {
        navigation: {
          basics: 'Basics',
          formula: 'The Formula',
          finePrint: 'Fine Print',
          calculator: 'Calculator',
        },
        calculator: {
          title: 'ELO Calculator',
          player1: 'White',
          player2: 'Black',
          rating: 'Rating',
          eloType: 'ELO Type',
          standard: 'Standard',
          rapid: 'Rapid',
          blitz: 'Blitz',
          result: 'Result',
          player1Wins: 'White wins',
          draw: 'Draw',
          player2Wins: 'Black wins',
          kFactor: 'K-Factor',
          auto: 'Auto',
          manual: 'Manual',
          calculate: 'Calculate',
          expectedScore: 'Expected Score',
          ratingChange: 'Rating Change',
          newRating: 'New Rating',
          inputMode: 'Input Mode',
          manualInput: 'Manual',
          searchPlayer: 'Search',
          memberId: 'Member ID',
          topPlayer: 'Top Player',
          firstName: 'First name',
          lastName: 'Last name',
          search: 'Search',
          selectPlayer: 'Select a player',
          noResults: 'No players found',
          searching: 'Searching...',
          enterRating: 'Enter rating',
          enterMemberId: 'Enter member ID',
          lookingUp: 'Looking up...',
          playerNotFound: 'Player not found',
          selectTopPlayer: 'Select a top player',
          men: 'Men',
          women: 'Women',
          removeCap: 'Remove 400-point cap',
          uncapped: 'Uncapped',
          performanceRating: 'Performance',
          autoHint: 'Uses the SSF player\'s K-factor when available, otherwise estimates from rating',
        },
      },
      organizations: {
        title: 'Clubs & Districts',
        subtitle: 'Explore chess clubs and districts in Sweden.',
        districtLabel: 'DISTRICT',
        clubLabel: 'CLUB',
        allDistricts: 'All Districts',
        allClubs: 'All Clubs',
        selectDistrict: 'Select district...',
        selectClub: 'Select club...',
        clubsCount: 'Clubs',
        street: 'Street',
        zipcode: 'Zipcode',
        city: 'City',
        email: 'Email',
        website: 'Website',
        schoolClub: 'School Club',
        yes: 'Yes',
        no: 'No',
        loading: 'Loading...',
        ratingList: {
          title: 'Rating List',
          dateLabel: 'RATING PERIOD',
          ratingTypeLabel: 'ELO TYPE',
          memberTypeLabel: 'MEMBER TYPE',
          standard: 'ELO - Standard',
          rapid: 'ELO - Rapid',
          blitz: 'ELO - Blitz',
          memberTypes: {
            all: 'All',
            women: 'Women',
            juniors: 'Juniors',
            cadets: 'Cadets',
            minors: 'Minors',
            kids: 'Kids',
            veterans: 'Veterans',
            y2cElementary: 'Y2C - Elementary',
            y2cGrade5: 'Y2C - Grade 5',
            y2cGrade6: 'Y2C - Grade 6',
            y2cMiddleSchool: 'Y2C - Middle School',
          },
          tableHeaders: {
            rank: 'NR',
            title: 'TITLE',
            firstName: 'FIRST NAME',
            lastName: 'LAST NAME',
            rating: 'ELO 1/1',
          },
          loading: 'Loading ratings...',
          noPlayers: 'No players found',
        },
        ssf: {
          title: 'SSF National Ranking',
          subtitle: 'Swedish Chess Federation national ranking list.',
          description: 'View the complete ranking of all rated players in Sweden.',
        },
        districts: {
          title: 'Districts',
          subtitle: 'Explore chess districts in Sweden.',
          selectDistrict: 'Select District',
        },
        clubs: {
          title: 'Clubs',
          subtitle: 'Find and explore chess clubs in Sweden.',
          searchPlaceholder: 'Search for a club...',
          browseByDistrict: 'Or browse by district',
          activeClubs: 'active clubs',
          district: 'District',
        },
        navigation: {
          ssfRanking: 'SSF Ranking',
          districts: 'Districts',
          clubs: 'Clubs',
          searchClubs: 'Search Clubs',
        },
        pagination: {
          showing: 'Showing',
          of: 'of',
          players: 'players',
        },
      },
    },
  },
  sv: {
    navbar: {
      navigation: {
        upcomingEvents: 'Kommande Evenemang',
        calendar: 'Kalender',
        results: 'Resultat',
        players: 'Spelare',
        organizations: 'Klubbar & Distrikt',
      },
      language: {
        english: 'English',
        swedish: 'Svenska',
      },
      more: 'Mer',
      darkMode: 'Mörkt Läge',
      lightMode: 'Ljust Läge',
    },
    footer: {
      projectInfo: {
        title: 'msvens schack',
        subtitle: 'Moderniserar schackturneringar i Sverige',
      },
      navigation: {
        about: 'Om',
        contact: 'Kontakt',
        changelog: 'Ändringslogg',
      },
      external: {
        poweredBy: 'Drivs av',
      },
    },
    home: {
      hero: {
        title: 'Välkommen till',
        titleHighlight: 'msvens schack',
        subtitle: 'Upptäck kommande turneringar, se resultat och håll dig uppdaterad med schackgemenskapen i Sverige.',
      },
      cards: {
        upcomingEvents: {
          title: 'Kommande Evenemang',
          description: 'Hitta de senaste turneringarna och evenemangen som händer i Sverige.',
          link: 'Bläddra Evenemang',
        },
        calendar: {
          title: 'Turneringskalender',
          description: 'Se den fullständiga kalendern för schackevenemang och turneringar.',
          link: 'Visa Kalender',
        },
        results: {
          title: 'Turneringsresultat',
          description: 'Kolla de senaste resultaten och placeringarna.',
          link: 'Visa Resultat',
        },
        players: {
          title: 'Spelare',
          description: 'Sök och utforska schackspelare, deras rating och turneringshistorik.',
          link: 'Bläddra Spelare',
        },
        organizations: {
          title: 'Klubbar & Distrikt',
          description: 'Utforska schackklubbar och distrikt i Sverige.',
          link: 'Bläddra Organisationer',
        },
      },
      about: {
        title: 'Om msvens schack',
        paragraph1: 'Denna moderna schackportal kompletterar Svenska Schackförbundets webbplats, med fokus specifikt på turneringsupptäckt och hantering. Vi bygger ett användarvänligt gränssnitt som gör det enkelt för schackspelare på alla nivåer att hitta och delta i schackevenemang över hela Sverige.',
        paragraph2: 'Oavsett om du är en nybörjare som letar efter din första turnering eller en erfaren spelare som spårar resultat, ger msvens schack dig verktygen du behöver för att hålla dig uppdaterad med schackgemenskapen.',
      },
    },
    common: {
      eloLabels: {
        standard: 'ELO',
        rapid: 'Snabb ELO',
        blitz: 'Blixt ELO',
        lask: 'LASK',
        ratingHistory: 'Rankingutveckling',
        loadingHistory: 'Laddar historik...',
        eloChange: 'ELO +/-',
        performanceRating: 'ELO prestation',
        rapidEloChange: 'Snabb ELO +/-',
        blitzEloChange: 'Blixt ELO +/-',
        rapidPerformance: 'Snabb prestation',
        blitzPerformance: 'Blixt prestation',
      },
      actions: {
        search: 'Sök',
        clear: 'Rensa',
      },
      filters: {
        all: 'Alla',
      },
      labels: {
        date: 'Datum',
      },
      states: {
        loading: 'Laddar...',
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
      tournamentCategoryFilter: {
        label: 'Kategori',
        all: 'Alla',
        team: 'Lag',
        individual: 'Individuell',
      },
      tournamentTypeFilter: {
        label: 'Typ',
        all: 'Alla',
        allsvenskan: 'Allsvenskan',
        individual: 'Individuell',
        smTree: 'SM-Trean',
        schoolSm: 'Skol-SM',
        svenskaCupen: 'Svenska Cupen',
        grandPrix: 'Grand Prix',
        yes2chess: 'Yes2Chess',
        schackfyran: 'Schackfyran',
      },
      tournamentStateFilter: {
        label: 'Status',
        all: 'Alla',
        registration: 'Anmälan öppen',
        started: 'Pågående',
        finished: 'Avslutad',
      },
    },
    pages: {
      contact: {
        title: 'Feedback',
        subtitle: 'Har du ett förslag eller hittat en bugg? Hör av dig!',
        form: {
          email: 'Din e-post',
          emailPlaceholder: 'namn@example.com',
          message: 'Meddelande',
          messagePlaceholder: 'Dela dina tankar, förslag eller rapportera ett problem...',
          submit: 'Skicka feedback',
          sending: 'Skickar...',
          success: 'Tack för din feedback! Vi återkommer om det behövs.',
          error: 'Något gick fel. Försök igen senare.',
        },
      },
      events: {
        title: 'Kommande Evenemang',
        subtitle: 'Upptäck de senaste schackturneringarna och evenemangen som händer i Sverige.',
        placeholder: 'Evenemangslistor kommer snart. Denna sida kommer att visa kommande turneringar med detaljer, datum och registreringsinformation.',
      },
      calendar: {
        title: 'Turneringskalender',
        subtitle: 'Se den fullständiga kalendern för schackevenemang och turneringar över hela Sverige.',
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
        subtitle: 'Kolla de senaste resultaten och placeringarna.',
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
          title: 'ELO',
          standardRating: 'ELO',
          rapidRating: 'Snabb ELO',
          blitzRating: 'Blixt ELO',
          fideTitle: 'Titel',
          date: 'Datum',
          kFactor: 'K-Faktor',
          noData: 'Ingen ELO ratingdata tillgänglig',
        },
        laskRating: {
          title: 'LASK',
          rating: 'Rating',
          date: 'Datum',
          noData: 'Ingen LASK ratingdata tillgänglig',
        },
        additionalInfo: {
          title: 'Ytterligare Information',
          fideId: 'FIDE ID',
          birthDate: 'Födelsedatum',
          birthYear: 'Födelseår',
        },
        tournamentHistory: {
          title: 'Turneringshistorik',
          loading: 'Laddar turneringar...',
          error: 'Misslyckades att ladda turneringshistorik',
          noTournaments: 'Ingen turneringshistorik hittades.',
          place: 'Placering',
          points: 'Poäng',
          outcome: 'Utfall',
        },
        tabs: {
          individual: 'Individuell',
          team: 'Lag',
          opponents: 'Motståndare',
        },
        viewFullProfile: 'Visa Full Profil',
        opponentsTab: {
          title: 'Motståndare',
          timeControl: {
            label: 'Speltyp',
            all: 'Alla',
            standard: 'Normal',
            rapid: 'Snabbschack',
            blitz: 'Blixtschack',
            unrated: 'Oratade',
          },
          charts: {
            all: 'Alla',
            white: 'Vit',
            black: 'Svart',
          },
          table: {
            white: 'Vit',
            black: 'Svart',
            result: 'Resultat',
            tournament: 'Turnering',
            retrieving: 'Hämtar',
            unknown: 'Okänd',
          },
          stats: {
            wins: 'Vinster',
            draws: 'Remier',
            losses: 'Förluster',
          },
          noOpponents: 'Inga motståndare funna',
          ratingNote: 'Senaste rating visas (kan skilja sig från rating vid partitillfället)',
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
        ongoingResults: 'Resultat',
        statusOngoing: 'Pågående',
        statusFinished: 'Avslutad',
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
          sp: 'SP',
          won: '+',
          draw: '=',
          lost: '-',
          pp: 'PP',
          mp: 'MP',
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
        registrationTable: {
          title: 'Anmälda spelare',
          pos: '#',
          name: 'Namn',
          club: 'Klubb',
          rating: 'Rating',
          noRegistrations: 'Inga anmälda spelare',
          loadingRegistrations: 'Laddar anmälningar...',
        },
        liveUpdates: {
          label: 'Auto',
          lastUpdated: 'Uppdaterad',
          refresh: 'Uppdatera',
        },
        teamDetailPage: {
          backToStandings: 'Tillbaka till ställning',
          matchesPlayed: 'MP',
          winDrawLoss: 'V-R-F',
          boardPoints: 'BP',
          matchPoints: 'P',
          noMatches: 'Inga matcher spelade ännu',
          position: 'Plac',
          teamAvgRating: 'Lagets medelranking',
          opponentAvgRating: 'Motståndarnas medelranking',
        },
      },
      elo: {
        navigation: {
          basics: 'Grunder',
          formula: 'Formeln',
          finePrint: 'Detaljerna',
          calculator: 'Kalkylator',
        },
        calculator: {
          title: 'ELO-kalkylator',
          player1: 'Vit',
          player2: 'Svart',
          rating: 'Rating',
          eloType: 'ELO-typ',
          standard: 'Standard',
          rapid: 'Snabb',
          blitz: 'Blixt',
          result: 'Resultat',
          player1Wins: 'Vit vinner',
          draw: 'Remi',
          player2Wins: 'Svart vinner',
          kFactor: 'K-faktor',
          auto: 'Auto',
          manual: 'Manuell',
          calculate: 'Beräkna',
          expectedScore: 'Förväntat resultat',
          ratingChange: 'Ratingändring',
          newRating: 'Ny rating',
          inputMode: 'Inmatningsläge',
          manualInput: 'Manuell',
          searchPlayer: 'Sök',
          memberId: 'Medlems-ID',
          topPlayer: 'Toppspelare',
          firstName: 'Förnamn',
          lastName: 'Efternamn',
          search: 'Sök',
          selectPlayer: 'Välj en spelare',
          noResults: 'Inga spelare hittades',
          searching: 'Söker...',
          enterRating: 'Ange rating',
          enterMemberId: 'Ange medlems-ID',
          lookingUp: 'Söker...',
          playerNotFound: 'Spelare hittades inte',
          selectTopPlayer: 'Välj en toppspelare',
          men: 'Herrar',
          women: 'Damer',
          removeCap: 'Ta bort 400-poängsgräns',
          uncapped: 'Utan gräns',
          performanceRating: 'Prestation',
          autoHint: 'Använder SSF-spelarens K-faktor om tillgänglig, annars uppskattas den utifrån rating',
        },
      },
      organizations: {
        title: 'Klubbar & Distrikt',
        subtitle: 'Utforska schackklubbar och distrikt i Sverige.',
        districtLabel: 'DISTRIKT',
        clubLabel: 'KLUBB',
        allDistricts: 'Alla distrikt',
        allClubs: 'Alla klubbar',
        selectDistrict: 'Välj distrikt...',
        selectClub: 'Välj klubb...',
        clubsCount: 'Klubbar',
        street: 'Gata',
        zipcode: 'Postnummer',
        city: 'Stad',
        email: 'E-post',
        website: 'Webbplats',
        schoolClub: 'Skolklubb',
        yes: 'Ja',
        no: 'Nej',
        loading: 'Laddar...',
        ratingList: {
          title: 'Rankinglista',
          dateLabel: 'RANKINGPERIOD',
          ratingTypeLabel: 'ELO-TYP',
          memberTypeLabel: 'MEDLEMSTYP',
          standard: 'ELO - Långparti',
          rapid: 'ELO - Snabb',
          blitz: 'ELO - Blixt',
          memberTypes: {
            all: 'Alla',
            women: 'Damer',
            juniors: 'Juniorer',
            cadets: 'Kadetter',
            minors: 'Miniorer',
            kids: 'Knattar',
            veterans: 'Veteraner',
            y2cElementary: 'Y2C - Lågstadiet',
            y2cGrade5: 'Y2C - Femman',
            y2cGrade6: 'Y2C - Sexan',
            y2cMiddleSchool: 'Y2C - Högstadiet',
          },
          tableHeaders: {
            rank: 'NR',
            title: 'TITEL',
            firstName: 'FÖRNAMN',
            lastName: 'EFTERNAMN',
            rating: 'ELO 1/1',
          },
          loading: 'Laddar rating...',
          noPlayers: 'Inga spelare hittades',
        },
        ssf: {
          title: 'SSF Nationell Ranking',
          subtitle: 'Svenska Schackförbundets nationella rankinglista.',
          description: 'Se den kompletta rankingen av alla rankade spelare i Sverige.',
        },
        districts: {
          title: 'Distrikt',
          subtitle: 'Utforska schackdistrikt i Sverige.',
          selectDistrict: 'Välj distrikt',
        },
        clubs: {
          title: 'Klubbar',
          subtitle: 'Hitta och utforska schackklubbar i Sverige.',
          searchPlaceholder: 'Sök efter en klubb...',
          browseByDistrict: 'Eller bläddra efter distrikt',
          activeClubs: 'aktiva klubbar',
          district: 'Distrikt',
        },
        navigation: {
          ssfRanking: 'SSF Ranking',
          districts: 'Distrikt',
          clubs: 'Klubbar',
          searchClubs: 'Sök klubbar',
        },
        pagination: {
          showing: 'Visar',
          of: 'av',
          players: 'spelare',
        },
      },
    },
  },
};

export function getTranslation(language: Language): Translations {
  return translations[language];
}
