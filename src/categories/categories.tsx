import React, { useEffect, useState } from 'react';

import { useServerData } from '../utils/useServerData';
import { GameStart } from '../common/gameStart';
import { updateData } from '../utils/updateData';
import deepCopy from '../utils/deepCopy';

import styles from './categories.module.css';
import { getLetter, getSomeCategories } from './categoriesLogic';
import { Timer } from '../common/Timer';
import { gameUrl } from '../utils/paths';
import { RouteComponentProps } from 'react-router';
import { WinnerScoreboard } from '../common/Winner';
import { Header } from '../common/Header';

const ROUND_DURATION = 60 * 1000;
const CATEGORIES_PER_ROUND = 5;
const MAX_ROUNDS = 10;

const createGame = (playerName: string, gameId: string) => (data: CategoriesData | null) => {
  if (!data) data = {} as CategoriesData;
  data = deepCopy(data);
  if (!data.gameType) data.gameType = 'categories';
  if (data.gameType !== 'categories') window.location.href = '/board_games';
  if (!data.id) data.id = gameId;
  if (!data.version) data.version = 0;
  if (!data.players) data.players = [];
  if (!data.chosenLetter) data.chosenLetter = '';
  if (!data.stage) data.stage = 'waiting';
  if (!data.playerWords) data.playerWords = {};
  if (!data.rejectedWords) data.rejectedWords = {};
  if (!data.playerScore) data.playerScore = {};
  if (!data.roundNumber) data.roundNumber = 0;

  if (data.players.indexOf(playerName) === -1) {
    data.players.push(playerName);
  }
  return data;
};

const startRound = (data: CategoriesData) => {
  data = deepCopy(data);
  // add points
  Object.keys(data.playerWords).forEach((player) => {
    data.playerWords[player]?.forEach((word, idx) => {
      if (data.rejectedWords[idx + word]) return;
      if (!(word || '').replace(/ /g, '')) return;
      data.playerScore[player] = data.playerScore[player] || 0;
      data.playerScore[player] += 1;
    });
  });

  // reset the board
  data.playerWords = {};
  data.rejectedWords = {};
  data.chosenCategories = getSomeCategories(CATEGORIES_PER_ROUND);
  data.chosenLetter = getLetter();
  data.endTime = Date.now() + ROUND_DURATION;
  data.stage = 'playing';
  if (data.roundNumber < MAX_ROUNDS) data.roundNumber++;
  else data.stage = 'results';

  return data;
};
const startVoting = (data: CategoriesData) => {
  data = deepCopy(data);
  data.stage = 'voting';
  return data;
};
const shareMyWords = (playerName: string, words: string[]) => (data: CategoriesData) => {
  data = deepCopy(data);
  data.playerWords[playerName] = words;
  return data;
};

const rejectWord = (idx: number, word: string) => (data: CategoriesData) => {
  data = deepCopy(data);
  data.rejectedWords[idx + word] = !data.rejectedWords[idx + word];
  return data;
};

interface CategoriesData {
  gameType: 'categories';
  id: string;
  version: number;
  players: string[];
  stage: 'name' | 'waiting' | 'playing' | 'voting' | 'results';

  chosenLetter: string;
  chosenCategories: string[];
  endTime: number;

  playerWords: { [player: string]: string[] };
  rejectedWords: { [catWord: string]: boolean };

  playerScore: { [player: string]: number };
  roundNumber: number;
}

interface PropType extends RouteComponentProps {}

export const Categories = ({ history }: PropType) => {
  const [gameName, setGameName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [myWords, setMyWords] = useState<string[]>([]);

  const data: CategoriesData = useServerData(gameName);

  const players = data?.players || [];
  const isLeader = players[0] === playerName;
  const stage = !gameName || !playerName ? 'name' : data?.stage;

  // game changed
  useEffect(() => {
    if (data.gameType && data.gameType !== 'categories')
      history.push(gameUrl(data.gameType, gameName, playerName));
  }, [data]);

  // you were kicked
  useEffect(() => {
    if (gameName && playerName && data?.players?.length) {
      if (data.players.indexOf(playerName) === -1 && data?.playerScore?.[playerName] !== undefined)
        setGameName('');
    }
  }, [gameName, playerName, data]);

  // in case the leader refreshes
  useEffect(() => {
    if (data?.stage === 'playing' && Date.now() > data?.endTime && isLeader) {
      updateData(startVoting(data), startVoting);
    }
  }, [isLeader, data]);

  // share your words
  useEffect(() => {
    if (stage !== 'voting') return;
    if (!myWords.length) return;
    if (!data.playerWords[playerName]?.length) {
      const share = shareMyWords(playerName, myWords);
      updateData(share(data), share);
    }
    setMyWords([]);
  }, [data, myWords, playerName, stage]);

  const startAndEndRound = () => {
    updateData(startRound(data), startRound);
    setTimeout(() => {
      updateData(startVoting(data), startVoting);
    }, ROUND_DURATION);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <Header title='Categories' infoText={`Round ${data.roundNumber || 0}/${MAX_ROUNDS}`} />
      {stage === 'name' ? (
        <GameStart
          onSubmit={(game, player) => {
            setGameName(game);
            setPlayerName(player);
            const create = createGame(player, game);
            updateData(create(null), create);
          }}
        />
      ) : null}

      {stage === 'waiting' ? (
        <div>
          Waiting for more players.
          <br />
          <br />
          <br />
        </div>
      ) : null}
      {stage === 'waiting' && isLeader ? (
        <button onClick={startAndEndRound}>Start Game</button>
      ) : null}

      {stage === 'playing' ? (
        <div>
          <h1>Letter: {data.chosenLetter}</h1>
          {data.chosenCategories.map((c, idx) => (
            <div key={idx}>
              <div>{c}</div>
              <input
                className={styles.enterWord}
                type={'text'}
                // placeholder={data.chosenLetter}
                value={myWords[idx] || ''}
                onChange={(e) => {
                  const words = [...myWords];
                  while (words.length < idx + 1) words.push('');
                  words.splice(idx, 1, e.target.value);
                  setMyWords(words);
                }}
              ></input>
              <br />
              <br />
            </div>
          ))}
          <Timer endTime={data.endTime} />
        </div>
      ) : null}

      {stage === 'voting' ? (
        <div>
          <h1>Letter: {data.chosenLetter}</h1>
          {data.chosenCategories.map((c, idx) => (
            <div key={idx}>
              <div>
                <b>{c}</b>
              </div>
              {Object.keys(data.playerWords).map((player) => {
                const word = data.playerWords[player][idx];
                if (!word) return null;
                const checked = !data.rejectedWords[idx + word];

                return (
                  <div key={player}>
                    {word}
                    <input
                      type='checkbox'
                      checked={checked}
                      onChange={() => {
                        const reject = rejectWord(idx, word);
                        updateData(reject(data), reject);
                      }}
                    />
                  </div>
                );
              })}
              <br />
              <br />
            </div>
          ))}

          {isLeader ? (
            data.roundNumber < MAX_ROUNDS ? (
              <button onClick={startAndEndRound}>Next Round</button>
            ) : (
              <button
                onClick={() => {
                  updateData(startRound(data), startRound);
                }}
              >
                Show Results
              </button>
            )
          ) : null}
        </div>
      ) : null}

      {stage === 'results' ? <WinnerScoreboard playerScore={data.playerScore} /> : null}

      <div className={styles.playerSection}>
        {players.map((player) => (
          <div key={player} className={styles.playerAvatar}>
            <span>{player}</span>
            <div className={styles.score}>
              <div>{data?.playerScore?.[player] || '0'}</div>
              {isLeader ? (
                <div
                  onClick={() => {
                    const kick = (data: CategoriesData) => {
                      data = deepCopy(data);
                      data.players = data.players.filter((p) => p !== player);
                      delete data.playerWords[player];
                      return data;
                    };
                    updateData(kick(data), kick);
                  }}
                >
                  kick
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
