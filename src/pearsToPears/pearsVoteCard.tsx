import React from 'react';
import styles from './pears.module.css';
import { PearsCard } from './pearsCard';

interface PropType {
  player: string;
  chosenCard: string;
  votingCards: { card: string; player: string }[];
  mySelectedCard: string;
  onSelect: (player: string) => unknown;
}

export const PearsVoteCard = ({
  chosenCard,
  votingCards,
  mySelectedCard,
  onSelect,
  player,
}: PropType) => {
  return (
    <div className={styles.mainContainer}>
      <PearsCard color='green' text={chosenCard} />
      <br />
      <br />
      <br />
      <br />
      <h1>Vote for your favorite</h1>
      {votingCards.map((card) => (
        <PearsCard
          color='red'
          selected={mySelectedCard === card.player}
          onClick={() => player !== card.player && onSelect(card.player)}
          key={card.player}
          text={card.card}
          player={card.player}
        />
      ))}
    </div>
  );
};
