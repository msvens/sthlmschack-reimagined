// API Response Types
// Based on actual API responses from the Swedish Chess Federation

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  message?: string;
}

export interface PlayerInfo {
  id: number;
  firstName: string;
  lastName: string;
  birthdate: string;
  sex: number;
  fideid: number;
  country: string;
  club: string;
  clubId: number;
  elo: {
    rating: number;
    title: string;
    date: string;
    k: number;
    rapidRating: number;
    rapidk: number;
    blitzRating: number;
    blitzK: number;
  };
  lask: number | null;
}

export interface TournamentResult {
  points: number;
  secPoints: number;
  place: number;
  contenderId: number;
  teamNumber: number;
  wonGames: number;
  drawGames: number;
  lostGames: number;
  groupId: number;
  playerInfo: PlayerInfo;
}

export interface Tournament {
  id: number;
  results: TournamentResult[];
}

export interface Game {
  id: number;
  tournamentResultID: number;
  tableNr: number;
  whiteId: number;
  blackId: number;
  result: number; // 1 = white win, 0 = draw, -1 = black win
  pgn: string;
}

export interface RoundResult {
  id: number;
  groupdId: number; // Note: API has typo "groupdId" instead of "groupId"
  roundNr: number;
  board: number;
  homeId: number;
  homeTeamNumber: number; // -1 means "not used/available"
  awayId: number;
  awayTeamNumber: number; // -1 means "not used/available"
  homeResult: number;
  awayResult: number;
  date: string;
  finalized: boolean;
  publisher: number;
  publishDate: number; // Unix timestamp
  publishedNote: string;
  games: Game[];
}

export interface TournamentRoundResults {
  id: number; // Tournament ID
  roundResults: RoundResult[];
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}
