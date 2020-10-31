import { useEffect, useState } from 'react';
import websocketProvider from './websocketProvider';

export const useServerData = (id: string) => {
  const [val, setVal] = useState({});
  useEffect(() => {
    websocketProvider.subscribe(`EntityChange:${id}`, (val) => {
      setVal(val);
    });
    return () => {
      websocketProvider.unsubscribe(`EntityChange:${id}`);
    };
  }, []);
  return val;
};
