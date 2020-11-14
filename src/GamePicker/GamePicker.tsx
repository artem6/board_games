import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import styles from './GamePicker.module.css';

import pears from './icons/pears.png';
import categories from './icons/categories.png';
import { GameStart } from '../common/gameStart';
import { getData } from '../utils/updateData';
import { gameUrl } from '../utils/paths';
import { Header } from '../common/Header';

interface PropType extends RouteComponentProps {}

function GamePicker(props: PropType) {
  return (
    <div className={styles.mainContainer}>
      <Header title='Board Games' />
      <h1>Join a Game</h1>
      <div className={styles.card} style={{ maxWidth: 400 }}>
        <GameStart
          cta='Join'
          onSubmit={async (game, player) => {
            const gameData = await getData<{ gameType: string }>(game);
            if (gameData.gameType) props.history.push(gameUrl(gameData.gameType, game, player));
          }}
        />
      </div>
      <h1>Host a Game</h1>

      <Link to='/pears'>
        <div className={styles.card}>
          <img src={pears} />
          <div>Pears to Pears</div>
        </div>
      </Link>

      <Link to='/categories'>
        <div className={styles.card}>
          <img src={categories} />
          <div>Categories</div>
        </div>
      </Link>
    </div>
  );
}

export default GamePicker;
