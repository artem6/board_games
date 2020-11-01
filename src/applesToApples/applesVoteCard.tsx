import React from 'react';
import styles from './apples.module.css';
import { ApplesCard } from './applesCard';

interface PropType {
  player: string;
  chosenCard: string;
  votingCards: { card: string; player: string }[];
  mySelectedCard: string;
  onSelect: (player: string) => unknown;
}

export const ApplesVoteCard = ({
  chosenCard,
  votingCards,
  mySelectedCard,
  onSelect,
  player,
}: PropType) => {
  return (
    <div className={styles.mainContainer}>
      <ApplesCard color='green' text={chosenCard} />
      <br />
      <br />
      <br />
      <br />
      <h1>Vote for your favorite</h1>
      {votingCards.map((card) => (
        <ApplesCard
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
