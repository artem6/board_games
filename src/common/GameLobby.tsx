// http://localhost:3001/board_games?game=fhtme

import React from 'react';
import styles from './common.module.css';

interface Props {
  gameCode: string;
}

export const GameLobby = ({ gameCode }: Props) => {
  return (
    <div className={styles.genericContainer}>
      Waiting for more players.
      <br />
      <br />
      {`${window.location.origin}/board_games?game=${gameCode}`}
      <br />
      <br />
    </div>
  );
};
