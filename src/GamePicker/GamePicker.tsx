import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import styles from './GamePicker.module.css';

import { GameStart } from '../common/gameStart';
import { getData, primeServer } from '../utils/updateData';
import { gameUrl } from '../utils/paths';
import { Header } from '../common/Header';
import { GameList } from './GameList';

interface PropType extends RouteComponentProps {}

function GamePicker({ history }: PropType) {
  useEffect(() => {
    primeServer();
  }, []);
  return (
    <div className={styles.mainContainer}>
      <Header title='Board Games' />
      <h1>Join a Game</h1>
      <div className={styles.card} style={{ maxWidth: 400, margin: '16px auto' }}>
        <GameStart
          join
          onSubmit={async (game, player) => {
            const gameData = await getData<{ gameType: string }>(game);
            if (gameData.gameType) history.push(gameUrl(gameData.gameType, game, player));
          }}
        />
      </div>
      <h1>Host a Game</h1>
      <GameList />
    </div>
  );
}

export default GamePicker;
