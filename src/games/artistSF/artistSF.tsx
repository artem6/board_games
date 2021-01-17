import React, { useEffect, useState } from 'react';
import styles from './artistSF.module.css';
import { RouteComponentProps } from 'react-router';
import { DrawingScreen } from '../../common/DrawingScreen';
import { GameStart } from '../../common/gameStart';
import { Header } from '../../common/Header';
import { gameUrl } from '../../utils/paths';
import { updateData } from '../../utils/updateData';
import { useGameSession } from '../../utils/useGameSession';
import { useServerData } from '../../utils/useServerData';
import { ArtistSFData } from './artistSFData';
import {
  createGame,
  guessImposter,
  revealImposter,
  shareMyDrawing,
  shareMyWord,
  startGame,
  startRound,
} from './artistSFLogic';
import { GameLobby } from '../../common/GameLobby';
import { WinnerScoreboard } from '../../common/Winner';
import { GameList } from '../../GamePicker/GameList';
import { CurrentPlayers } from '../../common/CurrentPlayers';

// const MAX_ROUNDS = 10;

interface PropType extends RouteComponentProps {}

export const ArtistSF = ({ history }: PropType) => {
  const [gameName, setGameName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [myWord, setMyWord] = useState<string>('');
  const [myCategory, setMyCategory] = useState<string>('');

  const data: ArtistSFData = useServerData(gameName);

  const players = data?.players || [];
  const isLeader = players[0] === playerName;
  const stage = !gameName || !playerName ? 'name' : data?.stage;
  const currentPlayer = data?.randomizedPlayers?.[data.currentPlayer % data.players?.length];
  const currentWord = data?.words?.[data?.roundNumber - 1]?.word;

  const { onKick } = useGameSession({ data, gameType: 'artistsf', playerName, history });

  // game changed
  useEffect(() => {
    if (data.gameType && data.gameType !== 'artistsf')
      history.push(gameUrl(data.gameType, gameName, playerName));
  }, [data, gameName, history, playerName]);

  // you were kicked
  useEffect(() => {
    if (gameName && playerName && data?.players?.length) {
      if (data.players.indexOf(playerName) === -1 && data?.playerScore?.[playerName] !== undefined)
        setGameName('');
    }
  }, [gameName, playerName, data]);

  // everyone submitted words
  useEffect(() => {
    if (data.stage !== 'enteringWords') return;
    if (!isLeader) return;
    const wordsNeeded = data.players.length - data.words.length;
    if (wordsNeeded) return;
    updateData(data, startRound);
  }, [isLeader, data]);

  // everyone submitted an imposter
  useEffect(() => {
    if (data.stage !== 'guessingImposter') return;
    if (!isLeader) return;
    const wordsNeeded = data.players.length - Object.keys(data.imposterGuess).length;
    if (wordsNeeded) return;
    updateData(data, revealImposter);
  }, [isLeader, data]);

  return (
    <div style={{ textAlign: 'center' }}>
      <Header
        title='Fake Artist Goes To SF'
        infoText={`Round ${data?.roundNumber || 0}/${data?.players?.length || 0}`}
      />
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
        <button onClick={() => updateData(data, startGame)}>Start Game</button>
      ) : null}

      {stage === 'enteringWords' && !data.words.find((w) => w.player === playerName) ? (
        <div className={styles.genericContainer}>
          <h1>Enter a Word and Category</h1>
          <div>
            Each round one players word will be shared with all but one player. All players will see
            the category.
          </div>
          <div>Word:</div>
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
          <div>Category:</div>
          <div>
            <input
              className={styles.enterWord}
              type={'text'}
              value={myCategory}
              onChange={(e) => {
                setMyCategory(e.target.value);
              }}
            ></input>
          </div>
          <div>
            <button
              onClick={() => {
                updateData(data, shareMyWord(playerName, myWord, myCategory));
                setMyWord('');
                setMyCategory('');
              }}
              disabled={!myWord || !myCategory}
            >
              Submit
            </button>
          </div>
        </div>
      ) : stage === 'enteringWords' ? (
        <div className={styles.genericContainer}>
          <h1>Waiting for Other Players</h1>
        </div>
      ) : null}

      {stage === 'addingLines' ? (
        <div>
          <h1>{currentPlayer === playerName ? `Draw the Word` : `${currentPlayer} is Drawing`}</h1>
          <br />
          {playerName === data.imposter ? (
            <div>You are the imposter.</div>
          ) : (
            <div>
              Word: <b>{currentWord}</b>
            </div>
          )}
          <div>Category: {data.words[data.roundNumber - 1].category}</div>
          {currentPlayer === playerName ? (
            <div className={styles.genericContainer}>
              <DrawingScreen
                onChange={(image) => {
                  updateData(data, shareMyDrawing(image));
                }}
                data={data.image}
                canDraw
                colorPicker
                brushPicker
                disableTap
              />
            </div>
          ) : (
            <div className={styles.genericContainer}>
              <DrawingScreen data={data.image} />
            </div>
          )}
        </div>
      ) : null}

      {stage === 'guessingImposter' ? (
        <div>
          <h1>
            {playerName === data.imposter
              ? 'You are the imposter. Pick any name.'
              : 'Who do you think is the imposter?'}
          </h1>
          <DrawingScreen data={data.image} />
          {data.randomizedPlayers.map((imposter) => (
            <button
              key={imposter}
              style={{
                background: data.imposterGuess[playerName] === imposter ? '#6eb96c' : undefined,
                margin: 20,
              }}
              onClick={() => {
                updateData(data, guessImposter(playerName, imposter));
              }}
            >
              {imposter}
            </button>
          ))}
        </div>
      ) : null}

      {stage === 'revealImposter' ? (
        <div className={styles.confirmGuessContainer}>
          <div>
            The imposter is <b>{data.imposter}</b>
          </div>
          <div>
            The word was <b>{data.words[data.roundNumber - 1].word}</b>
          </div>
          <table>
            <tbody>
              {data.randomizedPlayers.map((player) => (
                <tr key={player}>
                  <td>{player}'s Guess:</td>
                  <td>
                    <b>{player === data.imposter ? 'imposter' : data.imposterGuess[player]}</b>
                    {(() => {
                      let points = 0;
                      if (player === data.imposter) {
                        data.players.forEach((p) => {
                          if (p !== player && data.imposterGuess[p] !== data.imposter) points++;
                        });
                      } else {
                        if (data.imposterGuess[player] === data.imposter) points = 1;
                      }

                      if (points) return ` (+${points})`;
                      return null;
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            {isLeader ? (
              <button onClick={() => updateData(data, startRound)}>Next Round</button>
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
            stage === 'enteringWords'
              ? !!data.words.find((w) => w.player === name)
              : stage === 'guessingImposter'
              ? !!data.imposterGuess[name]
              : false,
        }))}
        onKick={onKick}
        isLeader={isLeader}
      />
    </div>
  );
};
