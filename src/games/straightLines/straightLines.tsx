import React, { useEffect, useState } from 'react';
import styles from './straightLines.module.css';
import { RouteComponentProps } from 'react-router';
import { DrawingScreen } from '../../common/DrawingScreen';
import { GameStart } from '../../common/gameStart';
import { Header } from '../../common/Header';
import { gameUrl } from '../../utils/paths';
import { updateData } from '../../utils/updateData';
import { useGameSession } from '../../utils/useGameSession';
import { useServerData } from '../../utils/useServerData';
import { StraightLinesData } from './straightLinesData';
import {
  createGame,
  DRAWINGS_PER_PLAYER,
  guessWord,
  selectWord,
  shareMyDrawing,
  startRound,
} from './straightLinesLogic';
import { GameLobby } from '../../common/GameLobby';
import { WinnerScoreboard } from '../../common/Winner';
import { GameList } from '../../GamePicker/GameList';
import { CurrentPlayers } from '../../common/CurrentPlayers';
import { getThreeWords } from './straightLinesWords';

// const MAX_ROUNDS = 10;

interface PropType extends RouteComponentProps {}

export const StraightLines = ({ history }: PropType) => {
  const [gameName, setGameName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [myWord, setMyWord] = useState<string>('');

  const data: StraightLinesData = useServerData(gameName);

  const players = data?.players || [];
  const isLeader = players[0] === playerName;
  const stage = !gameName || !playerName ? 'name' : data?.stage;

  const { onKick } = useGameSession({ data, gameType: 'straightlines', playerName, history });

  // game changed
  useEffect(() => {
    if (data?.gameType && data?.gameType !== 'straightlines')
      history.push(gameUrl(data.gameType, gameName, playerName));
  }, [data, gameName, history, playerName]);

  // you were kicked
  useEffect(() => {
    if (gameName && playerName && data?.players?.length) {
      if (data.players.indexOf(playerName) === -1 && data?.playerScore?.[playerName] !== undefined)
        setGameName('');
    }
  }, [gameName, playerName, data]);

  return (
    <div style={{ textAlign: 'center' }}>
      <Header
        title='Straight Lines'
        infoText={`Round ${data?.roundNumber || 0}/${
          data?.players?.length * DRAWINGS_PER_PLAYER || 0
        }`}
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
        <button onClick={() => updateData(data, startRound)}>Start Game</button>
      ) : null}

      {stage === 'choosingWord' && playerName === data.currentPlayer ? (
        <div className={styles.genericContainer}>
          <h1>Select a Word to Draw</h1>
          <div>
            {getThreeWords().map((word) => (
              <button
                onClick={() => {
                  updateData(data, selectWord(word));
                }}
                style={{ margin: 20 }}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {stage === 'choosingWord' && playerName !== data.currentPlayer ? (
        <div className={styles.genericContainer}>
          <h1>{data.currentPlayer} is choosing a word</h1>
        </div>
      ) : null}

      {stage === 'drawing' && playerName === data.currentPlayer ? (
        <div>
          <h1>Draw the Word: {data.word}</h1>
          <div>Lines: {data.imageLines}</div>
          <div className={styles.genericContainer}>
            <DrawingScreen
              onChange={(image) => {
                updateData(data, shareMyDrawing(image));
              }}
              data={data.image}
              canDraw
              colorPicker
              brushPicker
              linesOnly
              disableTap
            />
            <br />
            <div>
              {data.playerGuesses.map((guess, idx) => (
                <div key={idx}>
                  {guess.player}: {guess.word}{' '}
                  <span
                    className={styles.approveWord}
                    onClick={() => updateData(data, guessWord(guess.player, data.word))}
                  >
                    ✔️
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {stage === 'drawing' && playerName !== data.currentPlayer ? (
        <div>
          <h1>Guess the Word {data.currentPlayer} is Drawing</h1>
          <div>Lines: {data.imageLines}</div>
          <div className={styles.genericContainer}>
            <DrawingScreen data={data.image} />
            <div>
              Guess:{' '}
              <input
                className={styles.enterWord}
                type={'text'}
                value={myWord}
                onChange={(e) => {
                  setMyWord(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && myWord) {
                    updateData(data, guessWord(playerName, myWord));
                    setMyWord('');
                  }
                }}
              ></input>
              <button
                onClick={() => {
                  updateData(data, guessWord(playerName, myWord));
                  setMyWord('');
                }}
                disabled={!myWord}
              >
                Submit
              </button>
            </div>
            <div>
              {data.playerGuesses.map((guess, idx) => (
                <div key={idx}>
                  {guess.player}: {guess.word}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {stage === 'roundPoints' ? (
        <div>
          <h1>{data.playerGuesses[0].player} Guessed Correctly</h1>
          <div>The word was: {data.word}</div>
          <div>
            {data.currentPlayer} needed {data.imageLines} lines
          </div>
          <br />
          <DrawingScreen data={data.image} />
          <br />
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
          ready: false,
        }))}
        onKick={onKick}
        isLeader={isLeader}
      />
    </div>
  );
};
