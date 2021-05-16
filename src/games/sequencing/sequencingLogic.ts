import deepCopy from '../../utils/deepCopy';
import { distanceWithMoves } from '../../utils/distanceWithMoves';
import { generateSortPermutations } from '../../utils/permutations';
import { sort } from '../../utils/sort';
import { SequencingData } from './sequencingData';
import { getQuestion } from './sequencingQuestions';

export const MAX_ROUNDS = 10;

export const createGame = (playerName: string, gameId: string) => (data: SequencingData | null) => {
  if (!data) data = {} as SequencingData;
  data = deepCopy(data);
  if (!data.gameType) data.gameType = 'sequencing';
  if (data.gameType !== 'sequencing') window.location.href = '/board_games';
  if (!data.id) data.id = gameId;
  if (!data.version) data.version = 0;
  if (!data.players) data.players = [];
  if (!data.chosenQuestion) data.chosenQuestion = '';
  if (!data.stage) data.stage = 'waiting';
  if (!data.playerAnswer) data.playerAnswer = {};
  if (!data.playerOrderGuess) data.playerOrderGuess = {};
  if (!data.playerScore) data.playerScore = {};
  if (!data.roundNumber) data.roundNumber = 0;

  if (data.players.indexOf(playerName) === -1) {
    data.players.push(playerName);
  }
  return data;
};

export const getCorrectOrder = (data: SequencingData) => 
  sort(
    Object.keys(data.playerAnswer).map(player => ({ player, amount: data.playerAnswer[player] }) ),
    'amount',
    'asc'
  );

export const calcScore = (data: SequencingData, player: string) => {
  const orderData:{[amount: number]: string[]} = {};

  getCorrectOrder(data).forEach(v => {
    orderData[v.amount] = orderData[v.amount] || [];
    orderData[v.amount].push(v.player);
  });

  const allCorrectOrders = generateSortPermutations(orderData);

  let maxScore = { points: 0, errors: [] as string[] };

  allCorrectOrders.forEach(correctOrder => {
    const score = {
      ...distanceWithMoves(correctOrder, data.playerOrderGuess[player]),
      points: 0,
    };
    score.points = data.players.length - score.dist;
    if (score.points > maxScore.points) maxScore = score;
  })

  return maxScore;
}


export const startRound = (data: SequencingData) => {
  data = deepCopy(data);

  // add points
  Object.keys(data.playerAnswer).forEach(player => {
    data.playerScore[player] = data.playerScore[player] || 0;
    data.playerScore[player] += calcScore(data, player).points;
  })

  // reset the board
  data.playerAnswer = {};
  data.playerOrderGuess = {};
  data.chosenQuestion = getQuestion();
  data.stage = 'answeringQuestion';

  if (data.roundNumber < MAX_ROUNDS) data.roundNumber++;
  else data.stage = 'results';

  return data;
};

export const submitMyAnswers = (playerName: string, answer: number, sequence: string[]) => (data: SequencingData) => {
  data = deepCopy(data);
  data.playerAnswer[playerName] = answer;
  data.playerOrderGuess[playerName] = sequence;
  return data;
};

export const moveToRoundScores = (data: SequencingData) => {
  data = deepCopy(data);
  data.stage = 'roundResults';
  return data;
};
