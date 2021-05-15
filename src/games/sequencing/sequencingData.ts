export interface SequencingData {
  gameType: 'sequencing';
  id: string;
  version: number;
  players: string[];
  stage:
    | 'name'
    | 'waiting'
    | 'answeringQuestion'
    | 'roundResults'
    | 'results';

  chosenQuestion: string;
  playerAnswer: { [player: string]: number };
  playerOrderGuess: { [player: string]: string[] };

  playerScore: { [player: string]: number };
  roundNumber: number;
}
