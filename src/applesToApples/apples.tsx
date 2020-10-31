import React, { useEffect, useState } from 'react';

import { useServerData } from '../utils/useServerData';
import { config } from '../config';
import { getQueryParams } from '../utils/queryParams';
import { ApplesGameStart } from './applesGameStart';
import { updateData } from '../utils/updateData';
import deepCopy from '../utils/deepCopy';
import { getGreenCard, getNewHand, getRedCard } from './cards';
import { ApplesSelectCard } from './applesSelectCard';
import { ApplesVoteCard } from './applesVoteCard';

interface ApplesData {
  id: string;
  version: number;
  players: string[];
  chosenCard: string;
  stage: 'name' | 'carding' | 'voting';
  playerChosenCard: { [player: string]: string };
  playerVotedPlayer: { [player: string]: string };
  playerCards: { [player: string]: string[] };
  playerScore: { [player: string]: number };
}

export const Apples = () => {
  const params = getQueryParams();
  const [gameName, setGameName] = useState(params.game || '');
  const [playerName, setPlayerName] = useState(params.player || '');

  const data: ApplesData = useServerData(gameName);

  const stage = !gameName || !playerName ? 'name' : data.stage;

  const players = data?.players || [];
  const isLeader = players[0] === playerName;
  const chosenCard = data?.chosenCard || '';
  const myCards = data?.playerCards?.[playerName] || [];
  const selectedCards = players
    .map((p) =>
      data?.playerChosenCard?.[p] ? { player: p, card: data.playerChosenCard[p] } : null,
    )
    .filter(Boolean) as { player: string; card: string }[];
  const totalVotes = players.reduce((cnt, p) => cnt + (data?.playerVotedPlayer?.[p] ? 1 : 0), 0);

  useEffect(() => {
    if (!isLeader) return;
    if (stage === 'carding' && selectedCards.length === players.length) {
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
      updateData(setNewRound(data), setNewRound);
    }
  }, [data, stage, players, selectedCards, isLeader, totalVotes]);

  return (
    <div>
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

      <div>{JSON.stringify(data?.playerScore)}</div>
    </div>
  );
};
