import React, { useEffect, useMemo, useState } from 'react';

import { useServerData } from '../utils/useServerData';
import { GameStart } from '../common/gameStart';
import { updateData } from '../utils/updateData';
import deepCopy from '../utils/deepCopy';
import { getGreenCard, getNewHand, getRedCard } from './cards';
import { PearsSelectCard } from './pearsSelectCard';
import { PearsVoteCard } from './pearsVoteCard';
import { PearsResultsView } from './pearsResultsView';
import styles from './pears.module.css';
import { gameUrl } from '../utils/paths';
import { RouteComponentProps } from 'react-router';
import { Header } from '../common/Header';
import { WinnerScoreboard } from '../common/Winner';

const MAX_ROUNDS = 10;
const MAX_RESETS = 1;

interface PearsData {
  gameType: 'pears';
  id: string;
  version: number;
  players: string[];
  chosenCard: string;
  stage: 'name' | 'waiting' | 'carding' | 'voting' | 'results' | 'winnerScoreboard';
  playerChosenCard: { [player: string]: string };
  playerVotedPlayer: { [player: string]: string };
  playerCards: { [player: string]: string[] };
  playerScore: { [player: string]: number };
  playerResetsUsed: { [player: string]: number };
  roundNumber: number;
}

interface PropType extends RouteComponentProps {}

export const Pears = ({ history }: PropType) => {
  const [gameName, setGameName] = useState('');
  const [playerName, setPlayerName] = useState('');

  const data: PearsData = useServerData(gameName);

  const players = useMemo(() => data?.players || [], [data]);
  const stage = !gameName || !playerName ? 'name' : data?.stage;

  const isLeader = players[0] === playerName;
  const chosenCard = data?.chosenCard || '';
  const myCards = data?.playerCards?.[playerName] || [];
  const selectedCards = players
    .map((player) =>
      data?.playerChosenCard?.[player]
        ? {
            player,
            card: data.playerChosenCard[player],
            votes: players.reduce(
              (cnt, p) => cnt + (data?.playerVotedPlayer?.[p] === player ? 1 : 0),
              0,
            ),
          }
        : null,
    )
    .filter(Boolean) as { player: string; card: string; votes: number }[];
  const totalVotes = players.reduce((cnt, p) => cnt + (data?.playerVotedPlayer?.[p] ? 1 : 0), 0);

  // game changed
  useEffect(() => {
    if (data.gameType && data.gameType !== 'pears')
      history.push(gameUrl(data.gameType, gameName, playerName));
  }, [data]);

  // kicking players
  useEffect(() => {
    if (gameName && playerName && data?.players?.length) {
      if (data.players.indexOf(playerName) === -1 && data?.playerScore?.[playerName] !== undefined)
        setGameName('');
    }
  }, [gameName, playerName, data]);

  // move from carding to voting when everyone selects a card
  useEffect(() => {
    if (!isLeader) return;
    if (stage === 'carding' && selectedCards.length === players.length) {
      const setVotingStage = (data: PearsData) => {
        data = deepCopy(data);
        data.stage = 'voting';
        return data;
      };
      updateData(setVotingStage(data), setVotingStage);
    }
    if (stage === 'voting' && totalVotes === players.length) {
      const setNewRound = (data: PearsData) => {
        data = deepCopy(data);
        data.stage = 'results';
        return data;
      };
      updateData(setNewRound(data), setNewRound);
    }
  }, [data, stage, players, selectedCards, isLeader, totalVotes]);

  return (
    <div style={{ textAlign: 'center' }}>
      <Header title='Pears to Pears' infoText={`Round ${data.roundNumber || 0}/${MAX_ROUNDS}`} />
      {stage === 'name' ? (
        <GameStart
          onSubmit={(game, player) => {
            const startGame = (data: PearsData | null) => {
              if (!data) data = {} as PearsData;
              data = deepCopy(data);
              if (!data.gameType) data.gameType = 'pears';
              if (data.gameType !== 'pears') window.location.href = '/board_games';
              if (!data.id) data.id = game;
              if (!data.version) data.version = 0;
              if (!data.players) data.players = [];
              if (!data.chosenCard) data.chosenCard = getGreenCard();
              if (!data.stage) data.stage = 'waiting';
              if (!data.playerChosenCard) data.playerChosenCard = {};
              if (!data.playerVotedPlayer) data.playerVotedPlayer = {};
              if (!data.playerResetsUsed) data.playerResetsUsed = {};
              if (!data.playerCards) data.playerCards = {};
              if (!data.playerScore) data.playerScore = {};
              if (!data.roundNumber) data.roundNumber = 0;

              if (data.players.indexOf(player) === -1) {
                data.players.push(player);
                data.playerCards[player] = getNewHand();
              }

              return data;
            };

            setGameName(game);
            setPlayerName(player);
            updateData(startGame(null), startGame);
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
        <button
          onClick={() => {
            const startGame = (data: PearsData) => {
              if (!data) data = {} as PearsData;
              data = deepCopy(data);
              data.stage = 'carding';
              data.roundNumber++;
              return data;
            };
            updateData(startGame(data), startGame);
          }}
        >
          Start Game
        </button>
      ) : null}
      {stage === 'carding' ? (
        <PearsSelectCard
          chosenCard={chosenCard}
          myCards={myCards}
          mySelectedCard={data.playerChosenCard[playerName] || ''}
          resetsAvailable={MAX_RESETS - (data.playerResetsUsed[playerName] || 0)}
          maxResets={MAX_RESETS}
          onResetHand={() => {
            const resetHand = (data: PearsData) => {
              data = deepCopy(data);
              data.playerCards[playerName] = getNewHand();
              data.playerResetsUsed[playerName] = data.playerResetsUsed[playerName] || 0;
              data.playerResetsUsed[playerName]++;
              return data;
            };
            updateData(resetHand(data), resetHand);
          }}
          onSelect={(card: string) => {
            const selectCard = (data: PearsData) => {
              data = deepCopy(data);
              data.playerChosenCard[playerName] = card;
              return data;
            };
            updateData(selectCard(data), selectCard);
          }}
        />
      ) : null}

      {stage === 'voting' ? (
        <PearsVoteCard
          player={playerName}
          chosenCard={chosenCard}
          votingCards={selectedCards}
          mySelectedCard={data.playerVotedPlayer[playerName] || ''}
          onSelect={(player: string) => {
            const votePlayer = (data: PearsData) => {
              data = deepCopy(data);
              data.playerVotedPlayer[playerName] = player;
              return data;
            };
            updateData(votePlayer(data), votePlayer);
          }}
        />
      ) : null}

      {stage === 'results' ? (
        <PearsResultsView
          chosenCard={chosenCard}
          votingCards={selectedCards}
          onContinue={
            isLeader
              ? () => {
                  const nextRound = (data: PearsData) => {
                    data = deepCopy(data);
                    data.stage = 'carding';
                    data.chosenCard = getGreenCard();

                    data.players.forEach((p) => {
                      // add the vote points
                      const voted = data.playerVotedPlayer[p];
                      data.playerScore[voted] = data.playerScore[voted] || 0;
                      data.playerScore[voted]++;
                      delete data.playerVotedPlayer[p];

                      // remove the card and replace with new one
                      const card = data.playerChosenCard[p];
                      data.playerCards[p] = data.playerCards[p].filter((c) => c !== card);
                      data.playerCards[p].push(getRedCard());
                      delete data.playerChosenCard[p];
                    });

                    if (data.roundNumber < MAX_ROUNDS) data.roundNumber++;
                    else data.stage = 'winnerScoreboard';

                    return data;
                  };
                  updateData(nextRound(data), nextRound);
                }
              : undefined
          }
        />
      ) : null}

      {stage === 'winnerScoreboard' ? <WinnerScoreboard playerScore={data.playerScore} /> : null}

      <div className={styles.playerSection}>
        {players.map((player) => (
          <div
            key={player}
            className={
              styles.playerAvatar +
              ' ' +
              ((stage === 'carding' && data?.playerChosenCard?.[player]) ||
              (stage === 'voting' && data?.playerVotedPlayer?.[player])
                ? styles.ready
                : '')
            }
          >
            <span>{player}</span>
            <div className={styles.score}>
              <div>{data?.playerScore?.[player] || '0'}</div>
              {isLeader ? (
                <div
                  onClick={() => {
                    const kick = (data: PearsData) => {
                      data = deepCopy(data);
                      data.players = data.players.filter((p) => p !== player);
                      delete data.playerVotedPlayer[player];
                      delete data.playerChosenCard[player];
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
