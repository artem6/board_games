export interface OnlyOneData {
  gameType: 'onlyone';
  id: string;
  version: number;
  players: string[];
  stage:
    | 'name'
    | 'waiting'
    | 'givingHint'
    | 'removingDuplicates'
    | 'guessingWord'
    | 'confirmingGuess'
    | 'results';

  chosenPlayer: string;
  chosenWord: string;
  playerGuess: string;
  guessIsCorrect: 'yes' | 'no' | '';

  playerHints: { [player: string]: string };
  duplicateWords: { [word: string]: boolean };

  playerScore: { [player: string]: number };
  roundNumber: number;
}
