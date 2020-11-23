import React, { useEffect, useMemo, useState } from 'react';

import { useServerData } from '../../utils/useServerData';
import { GameStart } from '../../common/gameStart';
import { updateData } from '../../utils/updateData';
import deepCopy from '../../utils/deepCopy';
import { getGreenCard, getNewHand, getRedCard } from './cards';
import { PearsSelectCard } from './pearsSelectCard';
import { PearsVoteCard } from './pearsVoteCard';
import { PearsResultsView } from './pearsResultsView';
// import styles from './pears.module.css';
import { RouteComponentProps } from 'react-router';
import { Header } from '../../common/Header';
import { WinnerScoreboard } from '../../common/Winner';
import { CurrentPlayers } from '../../common/CurrentPlayers';
import { GameLobby } from '../../common/GameLobby';
import { useGameSession } from '../../utils/useGameSession';
import { GameList } from '../../GamePicker/GameList';

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

  const { onKick } = useGameSession({ data, gameType: 'onlyOne', playerName, history });

  // move from carding to voting when everyone selects a card
  useEffect(() => {
    if (!isLeader) return;
    if (stage === 'carding' && selectedCards.length === players.length) {
      const setVotingStage = (data: PearsData) => {
        data = deepCopy(data);
        data.stage = 'voting';
        return data;
      };
      updateData(data, setVotingStage);
    }
    if (stage === 'voting' && totalVotes === players.length) {
      const setNewRound = (data: PearsData) => {
        data = deepCopy(data);
        data.stage = 'results';
        return data;
      };
      updateData(data, setNewRound);
    }
  }, [data, stage, players, selectedCards, isLeader, totalVotes]);

  return (
    <div style={{ textAlign: 'center' }}>
      <Header title='Pears to Pears' infoText={`Round ${data?.roundNumber || 0}/${MAX_ROUNDS}`} />
      {stage === 'name' ? (
        <>
          <h1>Host New Game</h1>
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
                }
                data.players.forEach((player) => {
                  if (data && !data.playerCards[player]) data.playerCards[player] = getNewHand();
                });

                return data;
              };

              setGameName(game);
              setPlayerName(player);
              updateData(null, startGame);
            }}
          />
        </>
      ) : null}
      {stage === 'waiting' ? <GameLobby gameCode={gameName} /> : null}
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
            updateData(data, startGame);
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
            updateData(data, resetHand);
          }}
          onSelect={(card: string) => {
            const selectCard = (data: PearsData) => {
              data = deepCopy(data);
              data.playerChosenCard[playerName] = card;
              return data;
            };
            updateData(data, selectCard);
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
            updateData(data, votePlayer);
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
                  updateData(data, nextRound);
                }
              : undefined
          }
        />
      ) : null}

      {stage === 'winnerScoreboard' ? (
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
          ready: !!(
            (stage === 'carding' && data?.playerChosenCard?.[name]) ||
            (stage === 'voting' && data?.playerVotedPlayer?.[name])
          ),
        }))}
        onKick={onKick}
        isLeader={isLeader}
      />
    </div>
  );
};
