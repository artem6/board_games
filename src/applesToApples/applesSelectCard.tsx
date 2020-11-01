import React from 'react';
import styles from './apples.module.css';
import { ApplesCard } from './applesCard';

interface PropType {
  chosenCard: string;
  myCards: string[];
  mySelectedCard: string;
  onSelect: (card: string) => unknown;
}

export const ApplesSelectCard = ({ chosenCard, myCards, mySelectedCard, onSelect }: PropType) => {
  return (
    <div className={styles.mainContainer}>
      <ApplesCard color='green' text={chosenCard} />
      <br />
      <br />
      <br />
      <br />
      <h1>Select a card from your hand</h1>
      {myCards.map((card) => (
        <ApplesCard
          color='red'
          selected={mySelectedCard === card}
          onClick={() => onSelect(card)}
          key={card}
          text={card}
        />
      ))}
    </div>
  );
};
