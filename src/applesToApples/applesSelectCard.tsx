import React from 'react';
import styles from './apples.module.css';

interface PropType {
  chosenCard: string;
  myCards: string[];
  mySelectedCard: string;
  onSelect: (card: string) => unknown;
}

export const ApplesSelectCard = ({ chosenCard, myCards, mySelectedCard, onSelect }: PropType) => {
  return (
    <div>
      <div className={styles.greenCard}>{chosenCard}</div>
      <br />
      <br />
      <br />
      <br />
      {myCards.map((card) => (
        <div
          className={styles.redCard}
          style={{ border: mySelectedCard === card ? '1px solid red' : undefined }}
          onClick={() => onSelect(card)}
          key={card}
        >
          {card}
        </div>
      ))}
    </div>
  );
};
