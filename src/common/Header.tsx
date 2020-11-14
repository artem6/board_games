import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './common.module.css';

interface PropType {
  title: string;
  infoText?: string;
}

export const Header = ({ title, infoText }: PropType) => {
  useEffect(() => {
    document.body.title = title;
  }, [title]);

  return (
    <div className={styles.header}>
      {title !== 'Board Games' ? (
        <div className={styles.back}>
          <Link to='/'>←</Link>
        </div>
      ) : null}
      <div className={styles.title}>{title}</div>
      {infoText ? <div className={styles.info}>{infoText}</div> : null}
    </div>
  );
};
