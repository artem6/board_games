import React, { useEffect, useState } from 'react';

interface PropType {
  endTime: number;
}

export const Timer = ({ endTime }: PropType) => {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (endTime < Date.now()) return;
    const int = setInterval(() => {
      const remaining = Math.round((endTime - Date.now()) / 1000);
      if (remaining < 0) {
        clearInterval(int);
        setRemaining(0);
      } else setRemaining(remaining);
    }, 1000);
    return () => {
      clearInterval(int);
    };
  }, [endTime]);

  return <div>{remaining} s</div>;
};
