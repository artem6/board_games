import React from 'react';
import { Link } from 'react-router-dom';
import styles from './GamePicker.module.css';

import pears from './icons/pears.png';
import categories from './icons/categories.png';
import onlyone from './icons/onlyone.png';
import artistsf from './icons/artistsf.png';
import straightlines from './icons/straightlines.png';
import sequencing from './icons/sequencing.png';
import { BASE_PATH, gameUrl } from '../utils/paths';
import { getData, updateData } from '../utils/updateData';
import { FlipCard } from './FlipCard';

interface Props {
  playerName?: string;
  gameCode?: string;
}

interface GenericGame {
  id: string;
  version: string;
  players: string[];
}

export const gameDetails:{[game:string]:{ front: JSX.Element, back: JSX.Element }} = {
  pears: {
    front: (
      <div className={styles.card}>
        <img src={pears} alt='Pears to Pears' />
        <div>Pears to Pears</div>
      </div>
    ),
    back: (
      <div className={styles.card}>
        <div>
          <b>Pears to Pears</b>
        </div>
        <br />
        <div>
          Each player gets a hand of five red cards that they must choose the closest or
          funniest match for the green card each round. Everyone votes on the best match.
        </div>
      </div>
    )
  },
  categories: {
    front: (
      <div className={styles.card}>
        <img src={categories} alt='Categories' />
        <div>Categories</div>
      </div>
    ),
    back: (
      <div className={styles.card}>
        <div>
          <b>Categories</b>
        </div>
        <br />
        <div>
          Each round a random letter and five categories are chosen. Each player has 60
          seconds to come up with words that match each category and start with the letter.
          The player with the most matches wins.
        </div>
      </div>
    ),
  },
  onlyone: {
    front: (
      <div className={styles.card}>
        <img src={onlyone} alt='Only One' />
        <div>Only One</div>
      </div>
    ),
    back: (
      <div className={styles.card}>
        <div>
          <b>Only One</b>
        </div>
        <br />
        <div>
          This is a co-op game. Each round there is one guesser and the other players are
          hint givers. Each hint giver must provide a one-word hint so that the guesser can
          figure out the word. If any two players give the same hint, that hint is
          disqualified.
        </div>
      </div>
    ),
  },
  artistsf: {
    front: (
      <div className={styles.card}>
        <img src={artistsf} alt='Fake Artist Goes to SF' />
        <div>Fake Artist Goes to SF</div>
      </div>
    ),
    back: (
      <div className={styles.card}>
        <div>
          <b>Fake Artist Goes to SF</b>
        </div>
        <br />
        <div>
          Each round all but one player knows the word being drawn. Players alternate adding
          one continuous line at a time to a shared drawing. After two lines added per
          player, everyone votes on who is the imposter that doesn't know the word.
        </div>
      </div>
    ),
  },
  straightlines: {
    front: (
      <div className={styles.card}>
        <img src={straightlines} alt='Straight Lines' />
        <div>Straight Lines</div>
      </div>
    ),
    back: (
      <div className={styles.card}>
        <div>
          <b>Straight Lines</b>
        </div>
        <br />
        <div>
          One player draws the word, but can only use straight lines. Other players guess
          what the drawing is. Gain points for using fewer lines.
        </div>
      </div>
    ),
  },
  sequencing: {
    front: (
      <div className={styles.card}>
        <img src={sequencing} alt='Sequencing' />
        <div>Sequencing</div>
      </div>
    ),
    back: (
      <div className={styles.card}>
        <div>
          <b>Sequencing</b>
        </div>
        <br />
        <div>
          Each player answer a question about themselves with a numerical value, then they try to guess the order of all the players. Closest to the correct sequence wins.
        </div>
      </div>
    ),
  },
}

export const GameList = ({ gameCode, playerName }: Props) => {
  const keepPlayers = (gameType: string) => async () => {
    if (!gameCode) return;
    if (!playerName) return;

    const gameData = await getData<GenericGame>(gameCode);
    await updateData(gameData, (data) => ({
      id: data.id,
      version: data.version,
      players: data.players,
      gameType,
    }));

    window.location.href = BASE_PATH + gameUrl(gameType, gameCode, playerName);
  };
  return (
    <>
      <Link to='/pears' onClick={keepPlayers('pears')}>
        <div className={styles.cardContainer}>
          <FlipCard
            front={gameDetails.pears.front}
            back={gameDetails.pears.back}
          />
        </div>
      </Link>

      <Link to='/categories' onClick={keepPlayers('categories')}>
        <div className={styles.cardContainer}>
          <FlipCard
            front={gameDetails.categories.front}
            back={gameDetails.categories.back}
          />
        </div>
      </Link>

      <Link to='/onlyone' onClick={keepPlayers('onlyone')}>
        <div className={styles.cardContainer}>
          <FlipCard
            front={gameDetails.onlyone.front}
            back={gameDetails.onlyone.back}
          />
        </div>
      </Link>

      <Link to='/artistsf' onClick={keepPlayers('artistsf')}>
        <div className={styles.cardContainer}>
          <FlipCard
            front={gameDetails.artistsf.front}
            back={gameDetails.artistsf.back}
          />
        </div>
      </Link>

      <Link to='/straightlines' onClick={keepPlayers('straightlines')}>
        <div className={styles.cardContainer}>
          <FlipCard
            front={gameDetails.straightlines.front}
            back={gameDetails.straightlines.back}
          />
        </div>
      </Link>

      <Link to='/sequencing' onClick={keepPlayers('sequencing')}>
        <div className={styles.cardContainer}>
          <FlipCard
            front={gameDetails.sequencing.front}
            back={gameDetails.sequencing.back}
          />
        </div>
      </Link>
    </>
  );
};
