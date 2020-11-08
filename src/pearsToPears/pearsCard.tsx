import React from 'react';
import styles from './pears.module.css';

interface PropType {
  text: string;
  color: 'red' | 'green';
  selected?: boolean;
  player?: string;
  onClick?: () => unknown;
}

export const getPearsCardText = (text: string) => {
  const parts = text.split(' - ');
  const main = parts[0];
  parts.shift();
  const flavor = parts.join(' - ');

  return { main, flavor };
};

export const PearsCard = ({ text, color, player, selected, onClick }: PropType) => {
  const { main, flavor } = getPearsCardText(text);
  return (
    <div onClick={onClick} className={styles.cardContainer}>
      <div
        className={
          (color === 'red' ? styles.redCard : styles.greenCard) +
          ' ' +
          (selected ? styles.selected : '')
        }
        key={text}
      >
        <div className={styles.main}>{main}</div>
        <div className={styles.flavor}>{flavor}</div>
      </div>
      <div>{player}</div>
    </div>
  );
};
