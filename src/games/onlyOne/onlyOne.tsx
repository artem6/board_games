import React, { useEffect, useState } from 'react';

import { useServerData } from '../../utils/useServerData';
import { GameStart } from '../../common/gameStart';
import { updateData } from '../../utils/updateData';

import styles from './onlyOne.module.css';
import { gameUrl } from '../../utils/paths';
import { RouteComponentProps } from 'react-router';
import { WinnerScoreboard } from '../../common/Winner';
import { Header } from '../../common/Header';
import { CurrentPlayers } from '../../common/CurrentPlayers';
import { OnlyOneData } from './onlyOneData';
import {
  MAX_ROUNDS,
  createGame,
  startRound,
  shareMyWord,
  moveToGuessingRound,
  markDuplicate,
  guessWord,
  moveToDuplicateRound,
  verifyGuess,
} from './onlyOneLogic';
import { GameLobby } from '../../common/GameLobby';
import { useGameSession } from '../../utils/useGameSession';
import { GameList } from '../../GamePicker/GameList';

/*

1. select guesser
2. other people see word + input one-word hint
3. hint givers see words, and remove duplicates
4. guesser sees unique words, and guesses the word
5. coop game, how many correct out of 12 rounds

*/

interface PropType extends RouteComponentProps {}

export const OnlyOne = ({ history }: PropType) => {
  const [gameName, setGameName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [myWord, setMyWord] = useState<string>('');

  const data: OnlyOneData = useServerData(gameName);

  const players = data?.players || [];
  const isLeader = players[0] === playerName;
  const stage = !gameName || !playerName ? 'name' : data?.stage;

  const { onKick } = useGameSession({ data, gameType: 'onlyOne', playerName, history });

  // game changed
  useEffect(() => {
    if (data.gameType && data.gameType !== 'onlyone')
      history.push(gameUrl(data.gameType, gameName, playerName));
  }, [data, gameName, history, playerName]);

  // you were kicked
  useEffect(() => {
    if (gameName && playerName && data?.players?.length) {
      if (data.players.indexOf(playerName) === -1 && data?.playerScore?.[playerName] !== undefined)
        setGameName('');
    }
  }, [gameName, playerName, data]);

  // everyone submitted hints
  useEffect(() => {
    if (data.stage !== 'givingHint') return;
    if (!isLeader) return;
    const hintsNeeded = data.players.length - Object.keys(data.playerHints).length - 1;
    if (hintsNeeded) return;
    updateData(data, moveToDuplicateRound);
  }, [isLeader, data]);

  return (
    <div style={{ textAlign: 'center' }}>
      <Header title='Only One' infoText={`Round ${data.roundNumber || 0}/${MAX_ROUNDS}`} />
      {stage === 'name' ? (
        <>
          <h1>Host New Game</h1>
          <GameStart
            onSubmit={(game, player) => {
              setGameName(game);
              setPlayerName(player);
              updateData(null, createGame(player, game));
            }}
          />
        </>
      ) : null}

      {stage === 'waiting' ? <GameLobby gameCode={gameName} /> : null}

      {stage === 'waiting' && isLeader ? (
        <button onClick={() => updateData(data, startRound)}>Start Game</button>
      ) : null}

      {stage === 'givingHint' ? (
        data.chosenPlayer === playerName ? (
          <div className={styles.genericContainer}>
            You are guessing the word. Wait for other player to add their hints.
          </div>
        ) : data.playerHints[playerName] ? (
          <div className={styles.genericContainer}>
            <h1>Word: {data.chosenWord}</h1>
            <div>Your hint: {data.playerHints[playerName]}</div>
          </div>
        ) : (
          <div className={styles.genericContainer}>
            <h1>Word: {data.chosenWord}</h1>
            <div>Add your hint:</div>
            <div>
              <input
                className={styles.enterWord}
                type={'text'}
                value={myWord}
                onChange={(e) => {
                  setMyWord(e.target.value);
                }}
              ></input>
            </div>
            <div>
              <button
                onClick={() => {
                  updateData(data, shareMyWord(playerName, myWord));
                  setMyWord('');
                }}
                disabled={!myWord}
              >
                Submit
              </button>
            </div>
          </div>
        )
      ) : null}

      {stage === 'removingDuplicates' ? (
        data.chosenPlayer === playerName ? (
          <div className={styles.genericContainer}>
            You are guessing the word. Wait for other player to add their hints.
          </div>
        ) : (
          <div>
            <h1>Uncheck any Duplicate Hints</h1>
            <h3>Word: {data.chosenWord}</h3>
            <table className={styles.votingTable}>
              <tbody>
                {Object.keys(data.playerHints).map((player) => {
                  const word = data.playerHints[player];
                  const checked = !data.duplicateWords[word];

                  return (
                    <tr key={player}>
                      <td>{player}:</td>
                      <td>{word}</td>
                      <td>
                        {!word ? null : (
                          <input
                            type='checkbox'
                            checked={checked}
                            onChange={() => {
                              updateData(data, markDuplicate(word));
                            }}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button
              onClick={() => {
                updateData(data, moveToGuessingRound);
              }}
            >
              Ready
            </button>
          </div>
        )
      ) : null}

      {stage === 'guessingWord' ? (
        data.chosenPlayer === playerName ? (
          <div>
            <h1>Guess the Word</h1>
            <h3>Hints</h3>
            <div>
              {Object.keys(data.playerHints).map((player) => {
                const word = data.playerHints[player];
                if (data.duplicateWords[word]) return null;
                return (
                  <div key={player}>
                    {word} ({player})
                  </div>
                );
              })}
            </div>
            <h3
              style={{
                margin: '60px 0 0',
              }}
            >
              Your Guess
            </h3>
            <div>
              <input
                className={styles.enterWord}
                type={'text'}
                value={myWord}
                onChange={(e) => setMyWord(e.target.value)}
              ></input>
            </div>
            <div>
              <button
                onClick={() => {
                  updateData(data, guessWord(myWord));
                  setMyWord('');
                }}
                disabled={!myWord}
              >
                Submit
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.genericContainer}>
            <h1>{data.chosenPlayer} is guessing the word.</h1>
            <h3>Word</h3>
            <div>{data.chosenWord}</div>
            <h3>Hints</h3>
            <div>
              {Object.keys(data.playerHints).map((player) => {
                const word = data.playerHints[player];
                if (data.duplicateWords[word]) return null;
                return (
                  <div key={player}>
                    {word} ({player})
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : null}

      {stage === 'confirmingGuess' ? (
        <div className={styles.confirmGuessContainer}>
          <table>
            <tbody>
              <tr>
                <td>Word is:</td>
                <td>
                  <b>{data.chosenWord}</b>
                </td>
              </tr>
              <tr>
                <td>Guess is:</td>
                <td>
                  <b>{data.playerGuess}</b>
                </td>
              </tr>
            </tbody>
          </table>
          <div>
            <button
              className={data.guessIsCorrect === 'yes' ? styles.correct : undefined}
              onClick={() => updateData(data, verifyGuess('yes'))}
            >
              Correct
            </button>
            <button
              className={data.guessIsCorrect === 'no' ? styles.wrong : undefined}
              onClick={() => updateData(data, verifyGuess('no'))}
            >
              Wrong
            </button>
          </div>
          <div>
            {isLeader ? (
              <button onClick={() => updateData(data, startRound)}>
                {data.roundNumber < MAX_ROUNDS ? 'Next Round' : 'Show Results'}
              </button>
            ) : null}
          </div>
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
          ready:
            stage === 'givingHint'
              ? !!(name === data.chosenPlayer || data.playerHints[name])
              : false,
        }))}
        onKick={onKick}
        isLeader={isLeader}
      />
    </div>
  );
};
