import React, { useEffect, useState } from 'react';

import { useServerData } from '../utils/useServerData';
import { GameStart } from '../common/gameStart';
import { updateData } from '../utils/updateData';
import deepCopy from '../utils/deepCopy';

import styles from './categories.module.css';
import { getLetter, getSomeCategories } from './logic';
import { Timer } from '../common/Timer';

const ROUND_DURATION = 60 * 1000;

const createGame = (playerName: string, gameId: string) => (data: CategoriesData | null) => {
  if (!data) data = {} as CategoriesData;
  data = deepCopy(data);
  if (!data.id) data.id = gameId;
  if (!data.version) data.version = 0;
  if (!data.players) data.players = [];
  if (!data.chosenLetter) data.chosenLetter = '';
  if (!data.stage) data.stage = 'waiting';
  if (!data.playerWords) data.playerWords = {};
  if (!data.rejectedWords) data.rejectedWords = {};
  if (!data.playerScore) data.playerScore = {};

  if (data.players.indexOf(playerName) === -1) {
    data.players.push(playerName);
  }
  return data;
};

const startGame = (data: CategoriesData) => {
  data = deepCopy(data);
  // add points
  Object.keys(data.playerWords).forEach((player) => {
    data.playerWords[player]?.forEach((word, idx) => {
      if (data.rejectedWords[idx + word]) return;
      data.playerScore[player] = data.playerScore[player] || 0;
      data.playerScore[player] += 1;
    });
  });

  // reset the board
  data.playerWords = {};
  data.rejectedWords = {};
  data.chosenCategories = getSomeCategories();
  data.chosenLetter = getLetter();
  data.endTime = Date.now() + ROUND_DURATION;
  data.stage = 'playing';
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
}

export const Categories = () => {
  const [gameName, setGameName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [myWords, setMyWords] = useState<string[]>([]);

  const data: CategoriesData = useServerData(gameName);

  const players = data?.players || [];
  const isLeader = players[0] === playerName;
  const stage = !gameName || !playerName ? 'name' : data?.stage;

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

  const startRound = () => {
    updateData(startGame(data), startGame);
    setTimeout(() => {
      updateData(startVoting(data), startVoting);
    }, ROUND_DURATION);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Categories Game</h1>
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
      {stage === 'waiting' ? 'Waiting for more players' : null}
      {stage === 'waiting' && isLeader ? <button onClick={startRound}>Start Game</button> : null}

      {stage === 'playing' ? (
        <div>
          <h1>Letter: {data.chosenLetter}</h1>
          {data.chosenCategories.map((c, idx) => (
            <div key={idx}>
              <div>{c}</div>
              <input
                className={styles.enterWord}
                type={'text'}
                placeholder={data.chosenLetter}
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

          <button onClick={startRound}>Next Round</button>
        </div>
      ) : null}

      {stage === 'results' ? <div>results</div> : null}

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
