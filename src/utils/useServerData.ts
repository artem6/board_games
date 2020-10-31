import { useEffect, useState } from 'react';
import websocketProvider from './websocketProvider';

export const useServerData = (id: string): any => {
  const [val, setVal] = useState({});
  useEffect(() => {
    if (!id) return;
    websocketProvider.subscribe(`EntityChange:${id}`, (val) => {
      setVal(val);
    });
    return () => {
      websocketProvider.unsubscribe(`EntityChange:${id}`);
    };
  }, [id]);
  return val;
};
