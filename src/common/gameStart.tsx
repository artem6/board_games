import React, { useEffect, useState } from 'react';
import styles from './common.module.css';

import { getQueryParams, setQueryParams } from '../utils/queryParams';

interface PropType {
  onSubmit: (game: string, player: string) => unknown;
  cta?: string;
}

export const GameStart = ({ onSubmit, cta }: PropType) => {
  const params = getQueryParams();
  const [gameName, setGameName] = useState(params.game || '');
  const [playerName, setPlayerName] = useState(params.player || '');

  useEffect(() => {
    if (params.start && params.game && params.player) {
      onSubmit(params.game, params.player);
    }
  }, [params]);

  return (
    <div>
      <table className={styles.gameStartTable}>
        <tbody>
          <tr>
            <td>Game Code:</td>
            <td>
              <input type='text' value={gameName} onChange={(e) => setGameName(e.target.value)} />
            </td>
          </tr>
          <tr>
            <td>Your Name:</td>
            <td>
              <input
                type='text'
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div>
        <button
          onClick={() => {
            const params = getQueryParams();
            params.game = gameName;
            params.player = playerName;
            setQueryParams(params);
            onSubmit(gameName, playerName);
          }}
        >
          {cta || 'Start'}
        </button>
      </div>
    </div>
  );
};
