import React from 'react';
import styles from './common.module.css';

interface Props {
  players: { name: string; score?: number; ready?: boolean }[];
  onKick?: { (playerName: string): unknown };
  isLeader?: boolean;
}

export const CurrentPlayers = ({ players, onKick, isLeader }: Props) => {
  return (
    <div className={styles.playerSection}>
      {players.map((player) => (
        <div
          key={player.name}
          className={styles.playerAvatar + ' ' + (player.ready ? styles.ready : '')}
        >
          <span>{player.name}</span>
          <div className={styles.score}>
            <div>{player.score || 0}</div>
            {isLeader ? <div onClick={() => onKick?.(player.name)}>kick</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
};
