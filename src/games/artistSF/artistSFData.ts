export interface ArtistSFData {
  gameType: 'artistsf';
  id: string;
  version: number;
  players: string[];
  stage:
    | 'name'
    | 'waiting'
    | 'enteringWords'
    | 'addingLines'
    | 'guessingImposter'
    | 'revealImposter'
    | 'results';

  words: {
    player: string;
    word: string;
    category: string;
  }[];
  randomizedPlayers: string[];

  currentPlayer: number;

  imposter: string;
  imposterGuess: { [player: string]: string };

  playerScore: { [player: string]: number };
  roundNumber: number; // index of word + 1

  image: string;
}
