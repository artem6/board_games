import React from 'react';
import styles from './pears.module.css';
import { PearsCard } from './pearsCard';

interface PropType {
  chosenCard: string;
  myCards: string[];
  mySelectedCard: string;
  onSelect: (card: string) => unknown;

  resetsAvailable: number;
  maxResets: number;
  onResetHand: () => unknown;
}

export const PearsSelectCard = ({
  chosenCard,
  myCards,
  mySelectedCard,
  onSelect,
  resetsAvailable,
  maxResets,
  onResetHand,
}: PropType) => {
  return (
    <div className={styles.mainContainer}>
      <PearsCard color='green' text={chosenCard} />
      <br />
      <br />
      <br />
      <br />
      <h1>Select a card from your hand</h1>
      {myCards.map((card) => (
        <PearsCard
          color='red'
          selected={mySelectedCard === card}
          onClick={() => onSelect(card)}
          key={card}
          text={card}
        />
      ))}
      {resetsAvailable > 0 ? (
        <PearsCard
          color='blue'
          selected={false}
          onClick={() => onResetHand()}
          text={`Draw New Cards - draws left ${resetsAvailable}/${maxResets}`}
        />
      ) : null}
    </div>
  );
};
