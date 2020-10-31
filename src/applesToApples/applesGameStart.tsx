import React, { useState } from 'react';

import { getQueryParams, setQueryParams } from '../utils/queryParams';

interface PropType {
  onSubmit: (game: string, player: string) => unknown;
}

export const ApplesGameStart = ({ onSubmit }: PropType) => {
  const params = getQueryParams();
  const [gameName, setGameName] = useState(params.game || '');
  const [playerName, setPlayerName] = useState(params.player || '');

  return (
    <div>
      <div>
        Game Code:
        <input type='text' value={gameName} onChange={(e) => setGameName(e.target.value)} />
      </div>

      <div>
        Your Name:
        <input type='text' value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
      </div>
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
          Start
        </button>
      </div>
    </div>
  );
};
