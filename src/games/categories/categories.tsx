import React, { useEffect, useState } from 'react';

import { useServerData } from '../../utils/useServerData';
import { GameStart } from '../../common/gameStart';
import { updateData } from '../../utils/updateData';
import deepCopy from '../../utils/deepCopy';

import styles from './categories.module.css';
import { getLetter, getSomeCategories } from './categoriesLogic';
import { Timer } from '../../common/Timer';
import { RouteComponentProps } from 'react-router';
import { WinnerScoreboard } from '../../common/Winner';
import { Header } from '../../common/Header';
import { CurrentPlayers } from '../../common/CurrentPlayers';
import { GameLobby } from '../../common/GameLobby';
import { useGameSession } from '../../utils/useGameSession';
import { GameList } from '../../GamePicker/GameList';

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

  const { onKick } = useGameSession({ data, gameType: 'categories', playerName, history });

  // in case the leader refreshes
  useEffect(() => {
    if (data?.stage === 'playing' && Date.now() > data?.endTime && isLeader) {
      updateData(data, startVoting);
    }
  }, [isLeader, data]);

  // share your words
  useEffect(() => {
    if (stage !== 'voting') return;
    if (!myWords.length) return;
    if (!data.playerWords[playerName]?.length) {
      const share = shareMyWords(playerName, myWords);
      updateData(data, share);
    }
    setMyWords([]);
  }, [data, myWords, playerName, stage]);

  const startAndEndRound = () => {
    updateData(data, startRound);
    setTimeout(() => {
      updateData(data, startVoting);
    }, ROUND_DURATION);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <Header title='Categories' infoText={`Round ${data.roundNumber || 0}/${MAX_ROUNDS}`} />
      {stage === 'name' ? (
        <>
          <h1>Host New Game</h1>
          <GameStart
            onSubmit={(game, player) => {
              setGameName(game);
              setPlayerName(player);
              const create = createGame(player, game);
              updateData(null, create);
            }}
          />
        </>
      ) : null}

      {stage === 'waiting' ? <GameLobby gameCode={gameName} gameType={data.gameType} /> : null}
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
                placeholder={data.chosenLetter + '...'}
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
          <table className={styles.votingTable}>
            <tbody>
              {data.chosenCategories.map((c, idx) => (
                <>
                  <tr key={idx}>
                    <td className={styles.category} colSpan={3}>
                      <b>{c}</b>
                    </td>
                  </tr>
                  {Object.keys(data.playerWords).map((player) => {
                    const word = data.playerWords[player][idx];
                    const checked = !data.rejectedWords[idx + word];

                    return (
                      <tr key={idx + player}>
                        <td>{player}:</td>
                        <td>{word}</td>
                        <td>
                          {!word ? null : (
                            <input
                              type='checkbox'
                              checked={checked}
                              onChange={() => {
                                const reject = rejectWord(idx, word);
                                updateData(data, reject);
                              }}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td>&nbsp;</td>
                  </tr>
                </>
              ))}
            </tbody>
          </table>

          {isLeader ? (
            data.roundNumber < MAX_ROUNDS ? (
              <button onClick={startAndEndRound}>Next Round</button>
            ) : (
              <button
                onClick={() => {
                  updateData(data, startRound);
                }}
              >
                Show Results
              </button>
            )
          ) : null}
        </div>
      ) : null}

      {stage === 'results' ? (
        <>
          <WinnerScoreboard playerScore={data.playerScore} />
          {isLeader ? (
            <>
              <h1>Start a New Game</h1>
              <GameList playerName={playerName} gameCode={gameName} />
            </>
          ) : null}
        </>
      ) : null}

      <CurrentPlayers
        players={players.map((name) => ({
          name,
          score: data?.playerScore?.[name],
        }))}
        onKick={onKick}
        isLeader={isLeader}
      />
    </div>
  );
};
