import { useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import deepCopy from './deepCopy';
import { gameUrl, homeUrl } from './paths';
import { updateData } from './updateData';

interface DataType {
  gameType: string;
  id: string;
  stage: string;
  players: string[];
}

interface Props extends Pick<RouteComponentProps, 'history'> {
  data: DataType;
  gameType: string;
  playerName: string;
}

export const useGameSession = ({ data, gameType, playerName, history }: Props) => {
  // game changed
  useEffect(() => {
    if (data.gameType && data.gameType !== gameType)
      history.push(gameUrl(data.gameType, data.id, playerName));
  }, [data, history, gameType, playerName]);

  // you were kicked
  useEffect(() => {
    if (data.id && playerName && data?.players?.length) {
      if (
        data.players.indexOf(playerName) === -1 &&
        data?.stage !== 'name' &&
        data.stage !== 'waiting'
      )
        history.push(homeUrl(data.id));
    }
  }, [data, history, playerName]);

  // to kick someone
  const onKick = (player: string) => {
    const kick = (data: DataType) => {
      data = deepCopy(data);
      data.players = data.players.filter((p) => p !== player);
      return data;
    };
    updateData(data, kick);
  };
  return { onKick };
};
