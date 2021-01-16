export interface StraightLinesData {
  gameType: 'straightlines';
  id: string;
  version: number;
  players: string[];
  stage: 'name' | 'waiting' | 'choosingWord' | 'drawing' | 'roundPoints' | 'results';

  word: string;
  currentPlayer: string;
  image: string;
  imageLines: number;
  playerGuesses: { player: string; word: string }[];

  playerScore: { [player: string]: number };
  roundNumber: number;
}
