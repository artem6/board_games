export const gameUrl = (gameType: string, game: string, player: string) =>
  `/${gameType}?game=${game}&player=${player}&start=true`;
