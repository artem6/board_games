import deepCopy from '../../utils/deepCopy';
import { randomInt } from '../../utils/random';
import { wordMatch } from '../../utils/wordMatch';
import { OnlyOneData } from './onlyOneData';
import { getWord } from './onlyOneWords';

export const MAX_ROUNDS = 10;

export const createGame = (playerName: string, gameId: string) => (data: OnlyOneData | null) => {
  if (!data) data = {} as OnlyOneData;
  data = deepCopy(data);
  if (!data.gameType) data.gameType = 'onlyone';
  if (data.gameType !== 'onlyone') window.location.href = '/board_games';
  if (!data.id) data.id = gameId;
  if (!data.version) data.version = 0;
  if (!data.players) data.players = [];
  if (!data.chosenWord) data.chosenWord = '';
  if (!data.chosenPlayer) data.chosenPlayer = '';
  if (!data.stage) data.stage = 'waiting';
  if (!data.playerHints) data.playerHints = {};
  if (!data.duplicateWords) data.duplicateWords = {};
  if (!data.playerScore) data.playerScore = {};
  if (!data.roundNumber) data.roundNumber = 0;
  if (!data.guessIsCorrect) data.guessIsCorrect = '';
  if (!data.playerGuess) data.playerGuess = '';

  if (data.players.indexOf(playerName) === -1) {
    data.players.push(playerName);
  }
  return data;
};

export const startRound = (data: OnlyOneData) => {
  data = deepCopy(data);

  // add points
  if (data.guessIsCorrect === 'yes')
    data.players.forEach((player) => {
      data.playerScore[player] = data.playerScore[player] || 0;
      data.playerScore[player] += 1;
    });

  // reset the board
  data.playerHints = {};
  data.duplicateWords = {};
  data.chosenWord = getWord();
  data.stage = 'givingHint';
  if (!data.chosenPlayer) data.chosenPlayer = data.players[randomInt(data.players.length)];
  else data.chosenPlayer = data.players[data.players.indexOf(data.chosenPlayer) + 1];
  if (!data.chosenPlayer) data.chosenPlayer = data.players[0];
  data.guessIsCorrect = '';
  data.playerGuess = '';

  if (data.roundNumber < MAX_ROUNDS) data.roundNumber++;
  else data.stage = 'results';

  return data;
};

export const shareMyWord = (playerName: string, word: string) => (data: OnlyOneData) => {
  data = deepCopy(data);
  data.playerHints[playerName] = word;
  return data;
};

export const moveToDuplicateRound = (data: OnlyOneData) => {
  data = deepCopy(data);
  const words = Object.keys(data.playerHints).map((player) => data.playerHints[player]);
  words.push(data.chosenWord);
  data.duplicateWords = {};
  words.forEach((word1, i) => {
    words.forEach((word2, j) => {
      if (i === j) return;
      if (wordMatch(word1, word2)) {
        data.duplicateWords[word1] = true;
        data.duplicateWords[word2] = true;
      }
    });
  });
  data.stage = 'removingDuplicates';
  return data;
};

export const markDuplicate = (word: string) => (data: OnlyOneData) => {
  data = deepCopy(data);
  data.duplicateWords[word] = !data.duplicateWords[word];
  return data;
};

export const moveToGuessingRound = (data: OnlyOneData) => {
  data = deepCopy(data);
  data.stage = 'guessingWord';
  return data;
};

export const guessWord = (word: string) => (data: OnlyOneData) => {
  data = deepCopy(data);
  data.playerGuess = word;
  const match = wordMatch(word, data.chosenWord);
  data.guessIsCorrect = match === true ? 'yes' : match === false ? 'no' : '';
  data.stage = 'confirmingGuess';
  return data;
};

export const verifyGuess = (correct: 'yes' | 'no') => (data: OnlyOneData) => {
  data = deepCopy(data);
  data.guessIsCorrect = correct;
  return data;
};
