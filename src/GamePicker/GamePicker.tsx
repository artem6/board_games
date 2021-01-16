import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import styles from './GamePicker.module.css';

import { GameStart } from '../common/gameStart';
import { getData, primeServer } from '../utils/updateData';
import { gameUrl } from '../utils/paths';
import { Header } from '../common/Header';
import { GameList } from './GameList';
import { Loading } from '../common/Loading';

interface PropType extends RouteComponentProps {}

function GamePicker({ history }: PropType) {
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const startLoading = setTimeout(() => setIsLoading(true), 1000);
    primeServer().then(() => {
      clearTimeout(startLoading);
      setIsLoading(false);
    });
  }, []);
  return (
    <div className={styles.mainContainer}>
      <Header title='Board Games' />
      {isLoading ? <Loading /> : null}
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
