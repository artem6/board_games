// http://localhost:3001/board_games?game=fhtme

import React from 'react';
import { FlipCard } from '../GamePicker/FlipCard';
import { gameDetails } from '../GamePicker/GameList';
import styles from './common.module.css';

interface Props {
  gameCode: string;
  gameType: string;
}

export const GameLobby = ({ gameCode, gameType }: Props) => {
  return (
    <div className={styles.genericContainer}>
      Waiting for more players.
      <br />
      <br />
      {`${window.location.origin}/board_games?game=${gameCode}`}
      <br />
      <br />
      <div className={styles.cardContainer}>
        <FlipCard
          front={gameDetails[gameType].front}
          back={gameDetails[gameType].back}
        />
      </div>
      <div className={styles.cardContainer}>
        <FlipCard
          front={gameDetails[gameType].back}
          back={gameDetails[gameType].front}
        />
      </div>
    </div>
  );
};
