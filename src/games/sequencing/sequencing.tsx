import React, { useEffect, useRef, useState } from 'react';

import { useServerData } from '../../utils/useServerData';
import { GameStart } from '../../common/gameStart';
import { updateData } from '../../utils/updateData';

import styles from './sequencing.module.css';
import { gameUrl } from '../../utils/paths';
import { RouteComponentProps } from 'react-router';
import { WinnerScoreboard } from '../../common/Winner';
import { Header } from '../../common/Header';
import { CurrentPlayers } from '../../common/CurrentPlayers';
import { SequencingData } from './sequencingData';
import {
  MAX_ROUNDS,
  createGame,
  startRound,
  moveToRoundScores,
  submitMyAnswers,
  getCorrectOrder,
  calcScore,
} from './sequencingLogic';
import { GameLobby } from '../../common/GameLobby';
import { useGameSession } from '../../utils/useGameSession';
import { GameList } from '../../GamePicker/GameList';

/*

1. answer question and make your sequence guesses
2. see results

*/

interface PropType extends RouteComponentProps {}

export const Sequencing = ({ history }: PropType) => {
  const [gameName, setGameName] = useState('');
  const data: SequencingData = useServerData(gameName);

  const [playerName, setPlayerName] = useState('');
  const [myAnswer, setMyAnswer] = useState('');
  const [myOrder, setMyOrder] = useState(data?.players || []);

  const [draggedIndex, setDraggedIndex] = useState(-1);
  const dragRef = useRef({ index: -1, player: ''})

  const players = data?.players || [];
  const isLeader = players[0] === playerName;
  const stage = !gameName || !playerName ? 'name' : data?.stage;

  const { onKick } = useGameSession({ data, gameType: 'sequencing', playerName, history });

  // game changed
  useEffect(() => {
    if (data.gameType && data.gameType !== 'sequencing')
      history.push(gameUrl(data.gameType, gameName, playerName));
  }, [data, gameName, history, playerName]);

  // you were kicked
  useEffect(() => {
    if (gameName && playerName && data?.players?.length) {
      if (data.players.indexOf(playerName) === -1 && data?.playerScore?.[playerName] !== undefined)
        setGameName('');
    }
  }, [gameName, playerName, data]);

  const playerString = (data?.players || []).join(';~;~;');
  useEffect(() => {
    setMyOrder(playerString.split(';~;~;'));
  }, [playerString])

  // everyone answered the question
  useEffect(() => {
    if (data.stage !== 'answeringQuestion') return;
    if (!isLeader) return;
    const answersNeeded = data.players.length - Object.keys(data.playerAnswer).length;
    if (answersNeeded) return;
    updateData(data, moveToRoundScores);
  }, [isLeader, data]);

  // dragging
  const onDragStart = (player:string) => (evt:any) => {
    evt.dataTransfer.dropEffect = "move";
    dragRef.current.player = player;
  }
  const onDrop = (evt:any) => {
    evt.preventDefault();
    const newIdx = dragRef.current.index;
    const player = dragRef.current.player;
    if (player && newIdx !== -1) {
      const newOrder = [...myOrder];
      let oldIdx = newOrder.indexOf(player);
      if (oldIdx >= newIdx) oldIdx++;
      newOrder.splice(newIdx, 0, player);
      newOrder.splice(oldIdx, 1);
      setMyOrder(newOrder);
    }
    dragRef.current.player = '';
    dragRef.current.index = -1;
    setDraggedIndex(-1);
  }
  const onDragOver = (idx: number) => (evt: any) => {
    evt.preventDefault();
    if (draggedIndex !== idx) {
      setDraggedIndex(idx);
    }
    dragRef.current.index = idx;
  }
  const onDragLeave = () => {
    setDraggedIndex(-1);
    dragRef.current.index = -1;
  }
  const onDragEnd = () => {
    dragRef.current.player = '';
    setDraggedIndex(-1);
    dragRef.current.index = -1;
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <Header title='Sequencing' infoText={`Round ${data.roundNumber || 0}/${MAX_ROUNDS}`} />
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

      {stage === 'waiting' ? <GameLobby gameCode={gameName} gameType={data.gameType} /> : null}

      {stage === 'waiting' && isLeader ? (
        <button onClick={() => updateData(data, startRound)}>Start Game</button>
      ) : null}

      {stage === 'answeringQuestion' ? (
        data.playerAnswer[playerName] !== undefined ? 
        (
          <div className={styles.genericContainer}>Waiting for other players</div>
        ) : (
          <div className={styles.genericContainer}>
            <h1>{data.chosenQuestion}</h1>
            <div>Your Answer:</div>
            <div>
              <input
                className={styles.enterWord}
                type={'number'}
                value={myAnswer}
                onChange={(e) => {
                  setMyAnswer(e.target.value);
                }}
              ></input>
            </div>
            <div>Guess the Sequence:</div>
            <div className={styles.genericContainer}>
              <div>Lowest</div>
              <div
                onDrop={onDrop}
                onDragOver={onDragOver(0)}
                onDragLeave={onDragLeave}
                className={
                  draggedIndex === 0 &&
                  myOrder[0] !== dragRef.current.player
                  ? styles.dropTargetHover : styles.dropTarget}
              />
              {myOrder.map((player, idx) => ([
                <div
                  key={player}
                  className={styles.sequenceChip}
                  onDragStart={onDragStart(player)}
                  onDragEnd={onDragEnd}
                  draggable
                >
                  {idx !== 0 ? (
                    <span style={{padding: 8}} onClick={() => {
                      const newOrder = [...myOrder];
                      newOrder.splice(idx-1, 2, myOrder[idx], myOrder[idx-1]);
                      setMyOrder(newOrder);
                    }}>⬆️</span>
                  ) : <span />}
                  {player}
                  {idx !== myOrder.length - 1 ? (
                    <span style={{padding: 8}} onClick={() => {
                      const newOrder = [...myOrder];
                      newOrder.splice(idx, 2, myOrder[idx+1], myOrder[idx]);
                      setMyOrder(newOrder);
                    }}>⬇️</span>
                  ) : <span />}
                </div>,
                <div
                  key={idx}
                  onDrop={onDrop}
                  onDragOver={onDragOver(idx + 1)}
                  onDragLeave={onDragLeave}
                  className={
                    draggedIndex === (idx + 1) && 
                    player !== dragRef.current.player &&
                    myOrder[idx + 1] !== dragRef.current.player
                    ? styles.dropTargetHover : styles.dropTarget}
                />
              ]))}
              <div>Highest</div>
            </div>
            <div>
              <button
                onClick={() => {
                  updateData(data, submitMyAnswers(playerName, parseInt(myAnswer), myOrder));
                  setMyAnswer('');
                  setMyOrder(data.players)
                }}
                disabled={!myAnswer}
              >
                Submit
              </button>
            </div>
          </div>
        )
      ) : null}


      {stage === 'roundResults' ? (
        <div className={styles.roundResultsContainer}>   
          <h1>{data.chosenQuestion}</h1>
          <div>
            <div><b>Correct Answer</b></div>
            <div>
              {getCorrectOrder(data).map(player => (
                <span className={styles.resultsChip} style={{background: '#6eb96c'}}>{player.player} ({player.amount})</span>
              ))}
            </div>
          </div>
          <br />
          <br />
          <div>
            {Object.keys(data.playerOrderGuess).map(player => {
              return (
                <div>
                  <div>
                    <br />
                    <b>{player}</b>{' '}
                    ({calcScore(data, player)} points)
                  </div>
                  <div>
                    {data.playerOrderGuess[player].map(player => (
                      <span className={styles.resultsChip}>{player}</span>
                    ))}
                  </div>
                </div>
              )
            })}
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
            stage === 'answeringQuestion'
              ? data.playerAnswer[name] !== undefined
              : false,
        }))}
        onKick={onKick}
        isLeader={isLeader}
      />
    </div>
  );
};
