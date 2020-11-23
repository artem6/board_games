import React, { useEffect, useState } from 'react';
import styles from './common.module.css';

import { getQueryParams, setQueryParams } from '../utils/queryParams';
import { getGameCode } from '../utils/random';
import { storageService } from '../utils/storageService';

interface PropType {
  onSubmit: (game: string, player: string) => unknown;
  join?: boolean;
}

export const GameStart = ({ onSubmit, join }: PropType) => {
  const params = getQueryParams();
  const [gameName, setGameName] = useState(params.game || (join ? '' : getGameCode()) || '');
  const [playerName, setPlayerName] = useState(params.player || storageService.get('player') || '');

  useEffect(() => {
    if (params.start && params.game && params.player) {
      storageService.set('player', params.player);
      onSubmit(params.game, params.player);
    }
  }, [params, onSubmit]);

  return (
    <div>
      <table className={styles.gameStartTable}>
        <tbody>
          <tr>
            <td>Game Code:</td>
            <td>
              <input
                type='text'
                value={gameName}
                onChange={(e) => setGameName(e.target.value.toLowerCase())}
              />
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
            storageService.set('player', playerName);
            onSubmit(gameName, playerName);
          }}
        >
          {join ? 'Join' : 'Create Game'}
        </button>
      </div>
    </div>
  );
};
