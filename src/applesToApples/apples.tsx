import React, { useEffect, useState } from 'react';

import { useServerData } from '../utils/useServerData';
import { ApplesGameStart } from './applesGameStart';
import { updateData } from '../utils/updateData';
import deepCopy from '../utils/deepCopy';
import { getGreenCard, getNewHand, getRedCard } from './cards';
import { ApplesSelectCard } from './applesSelectCard';
import { ApplesVoteCard } from './applesVoteCard';
import { ApplesResultsView } from './applesResultsView';
import styles from './apples.module.css';

interface ApplesData {
  id: string;
  version: number;
  players: string[];
  chosenCard: string;
  stage: 'name' | 'carding' | 'voting' | 'results';
  playerChosenCard: { [player: string]: string };
  playerVotedPlayer: { [player: string]: string };
  playerCards: { [player: string]: string[] };
  playerScore: { [player: string]: number };
}

export const Apples = () => {
  const [gameName, setGameName] = useState('');
  const [playerName, setPlayerName] = useState('');

  const data: ApplesData = useServerData(gameName);

  const players = data?.players || [];
  const stage = !gameName || !playerName ? 'name' : players.length < 3 ? 'waiting' : data?.stage;

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

  useEffect(() => {
    if (gameName && playerName && data?.players?.length) {
      if (data.players.indexOf(playerName) === -1 && data?.playerScore?.[playerName])
        setGameName('');
    }
  }, [gameName, playerName, data]);

  useEffect(() => {
    if (!isLeader) return;
    if (stage === 'carding' && selectedCards.length === players.length && players.length >= 3) {
      const setVotingStage = (data: ApplesData) => {
        data = deepCopy(data);
        data.stage = 'voting';
        return data;
      };
      updateData(setVotingStage(data), setVotingStage);
    }
    if (stage === 'voting' && totalVotes === players.length) {
      const setNewRound = (data: ApplesData) => {
        data = deepCopy(data);
        data.stage = 'results';
        return data;
      };
      updateData(setNewRound(data), setNewRound);
    }
  }, [data, stage, players, selectedCards, isLeader, totalVotes]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Apples to Apples</h1>
      {stage === 'waiting' ? 'Waiting for more players' : null}
      {stage === 'name' ? (
        <ApplesGameStart
          onSubmit={(game, player) => {
            const startGame = (data: ApplesData | null) => {
              if (!data) data = {} as ApplesData;
              data = deepCopy(data);
              if (!data.id) data.id = game;
              if (!data.version) data.version = 0;
              if (!data.players) data.players = [];
              if (!data.chosenCard) data.chosenCard = getGreenCard();
              if (!data.stage) data.stage = 'carding';
              if (!data.playerChosenCard) data.playerChosenCard = {};
              if (!data.playerVotedPlayer) data.playerVotedPlayer = {};
              if (!data.playerCards) data.playerCards = {};
              if (!data.playerScore) data.playerScore = {};

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
      {stage === 'carding' ? (
        <ApplesSelectCard
          chosenCard={chosenCard}
          myCards={myCards}
          mySelectedCard={data.playerChosenCard[playerName] || ''}
          onSelect={(card: string) => {
            const selectCard = (data: ApplesData) => {
              data = deepCopy(data);
              data.playerChosenCard[playerName] = card;
              return data;
            };
            updateData(selectCard(data), selectCard);
          }}
        />
      ) : null}

      {stage === 'voting' ? (
        <ApplesVoteCard
          player={playerName}
          chosenCard={chosenCard}
          votingCards={selectedCards}
          mySelectedCard={data.playerVotedPlayer[playerName] || ''}
          onSelect={(player: string) => {
            const votePlayer = (data: ApplesData) => {
              data = deepCopy(data);
              data.playerVotedPlayer[playerName] = player;
              return data;
            };
            updateData(votePlayer(data), votePlayer);
          }}
        />
      ) : null}

      {stage === 'results' ? (
        <ApplesResultsView
          chosenCard={chosenCard}
          votingCards={selectedCards}
          onContinue={
            isLeader
              ? () => {
                  const nextRound = (data: ApplesData) => {
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

                    return data;
                  };
                  updateData(nextRound(data), nextRound);
                }
              : undefined
          }
        />
      ) : null}

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
                    const kick = (data: ApplesData) => {
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
