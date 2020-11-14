import React from 'react';
import styles from './common.module.css';

interface PropType {
  onRestart?: () => unknown;
  onNewGame?: () => unknown;
  playerScore: { [player: string]: number };
}

export const WinnerScoreboard = ({ onRestart, onNewGame, playerScore }: PropType) => {
  const scores = Object.keys(playerScore).map((player) => ({ player, score: playerScore[player] }));
  scores.sort((a, b) => b.score - a.score);

  return (
    <div>
      <h1>Final Scores</h1>
      <table className={styles.winnerScoreboard}>
        <tbody>
          {scores.map((s) => (
            <tr key={s.player}>
              <td className={styles.player}>{s.player}</td>
              <td className={styles.score}>{s.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
