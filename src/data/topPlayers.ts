export interface TopPlayer {
  name: string;
  country: string;
  fideId: number;
  standardRating: number;
  rapidRating: number;
  blitzRating: number;
}

export const topPlayersMen: TopPlayer[] = [
  { name: 'Magnus Carlsen', country: 'NOR', fideId: 1503014, standardRating: 2831, rapidRating: 2823, blitzRating: 2886 },
  { name: 'Fabiano Caruana', country: 'USA', fideId: 2020009, standardRating: 2805, rapidRating: 2750, blitzRating: 2720 },
  { name: 'Hikaru Nakamura', country: 'USA', fideId: 2016192, standardRating: 2794, rapidRating: 2800, blitzRating: 2850 },
  { name: 'Ding Liren', country: 'CHN', fideId: 8603677, standardRating: 2762, rapidRating: 2738, blitzRating: 2788 },
  { name: 'Alireza Firouzja', country: 'FRA', fideId: 12573981, standardRating: 2760, rapidRating: 2750, blitzRating: 2770 },
  { name: 'Ian Nepomniachtchi', country: 'RUS', fideId: 4168119, standardRating: 2758, rapidRating: 2780, blitzRating: 2762 },
  { name: 'Gukesh D', country: 'IND', fideId: 46616543, standardRating: 2783, rapidRating: 2730, blitzRating: 2720 },
  { name: 'Praggnanandhaa R', country: 'IND', fideId: 25059530, standardRating: 2750, rapidRating: 2740, blitzRating: 2710 },
  { name: 'Anish Giri', country: 'NED', fideId: 24116068, standardRating: 2745, rapidRating: 2735, blitzRating: 2760 },
  { name: 'Wesley So', country: 'USA', fideId: 5202213, standardRating: 2742, rapidRating: 2760, blitzRating: 2745 },
];

export const topPlayersWomen: TopPlayer[] = [
  { name: 'Hou Yifan', country: 'CHN', fideId: 8602980, standardRating: 2633, rapidRating: 2580, blitzRating: 2560 },
  { name: 'Ju Wenjun', country: 'CHN', fideId: 8603006, standardRating: 2564, rapidRating: 2520, blitzRating: 2500 },
  { name: 'Humpy Koneru', country: 'IND', fideId: 5008123, standardRating: 2576, rapidRating: 2530, blitzRating: 2488 },
  { name: 'Lei Tingjie', country: 'CHN', fideId: 8616590, standardRating: 2554, rapidRating: 2510, blitzRating: 2475 },
  { name: 'Tan Zhongyi', country: 'CHN', fideId: 8604436, standardRating: 2540, rapidRating: 2505, blitzRating: 2460 },
  { name: 'Aleksandra Goryachkina', country: 'RUS', fideId: 4147103, standardRating: 2557, rapidRating: 2490, blitzRating: 2485 },
  { name: 'Anna Muzychuk', country: 'UKR', fideId: 14111330, standardRating: 2535, rapidRating: 2550, blitzRating: 2520 },
  { name: 'Mariya Muzychuk', country: 'UKR', fideId: 14123444, standardRating: 2520, rapidRating: 2490, blitzRating: 2470 },
  { name: 'Kateryna Lagno', country: 'RUS', fideId: 14109336, standardRating: 2530, rapidRating: 2505, blitzRating: 2495 },
  { name: 'Bibisara Assaubayeva', country: 'KAZ', fideId: 13714210, standardRating: 2520, rapidRating: 2480, blitzRating: 2465 },
];

export const allTopPlayers: TopPlayer[] = [...topPlayersMen, ...topPlayersWomen];
