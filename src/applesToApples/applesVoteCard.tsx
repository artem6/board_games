import React from 'react';
import styles from './apples.module.css';

interface PropType {
  chosenCard: string;
  votingCards: { card: string; player: string }[];
  mySelectedCard: string;
  onSelect: (player: string) => unknown;
}

export const ApplesVoteCard = ({ chosenCard, votingCards, mySelectedCard, onSelect }: PropType) => {
  return (
    <div>
      <div className={styles.greenCard}>{chosenCard}</div>
      <br />
      <br />
      <br />
      <br />
      {votingCards.map((card) => (
        <div
          className={styles.redCard}
          style={{ border: mySelectedCard === card.player ? '1px solid red' : undefined }}
          onClick={() => onSelect(card.player)}
          key={card.player}
        >
          {card.card}
          {card.player}
        </div>
      ))}
    </div>
  );
};
