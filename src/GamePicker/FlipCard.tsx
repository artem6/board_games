import React from 'react';
import styles from './GamePicker.module.css';

interface Props {
  front: any;
  back: any;
}

export const FlipCard = ({ front, back }: Props) => {
  return (
    <div className={styles.flipCard}>
      <div className={styles.flipCardInner}>
        <div className={styles.flipCardFront}>{front}</div>
        <div className={styles.flipCardBack}>{back}</div>
      </div>
    </div>
  );
};
