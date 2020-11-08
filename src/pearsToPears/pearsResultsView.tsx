import React from 'react';
import styles from './pears.module.css';
import { PearsCard, getPearsCardText } from './pearsCard';

interface PropType {
  chosenCard: string;
  votingCards: { card: string; player: string; votes: number }[];
  onContinue?: () => unknown;
}

export const PearsResultsView = ({ chosenCard, votingCards, onContinue }: PropType) => {
  const sorted = [...votingCards];
  sorted.sort((a, b) => b.votes - a.votes);
  return (
    <div className={styles.mainContainer}>
      <PearsCard color='green' text={chosenCard} />
      <br />
      <br />
      <br />
      <br />
      <h1>Results</h1>
      <table className={styles.resultsTable}>
        {sorted.map((card) => (
          <tr>
            <td className={styles.left}>
              <span className={styles.main}>{getPearsCardText(card.card).main}</span>
              <span className={styles.flavor}> ({card.player})</span>
            </td>
            <td className={styles.right}>{card.votes}</td>
          </tr>
        ))}
      </table>

      {onContinue ? <button onClick={onContinue}>Ok</button> : null}
    </div>
  );
};
