import React, { useEffect, useState } from 'react';
import styles from './common.module.css';

export const Loading = () => {
  const [width, setWidth] = useState('0%');
  useEffect(() => {
    setTimeout(() => {
      setWidth('100%');
    }, 500);
  }, []);
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingBar} style={{ width }}></div>
    </div>
  );
};
