export const BASE_PATH = '/board_games';

export const gameUrl = (gameType: string, game: string, player: string) =>
  `/${gameType}?game=${game}&player=${player}&start=true`;

export const homeUrl = (game = '') => `/?game=${game}`;
