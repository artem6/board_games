const configSettings = {
  prod: {
    API_HOST: 'https://artemboardgames.herokuapp.com/',
    WS_HOST: 'wss://artemboardgames.herokuapp.com/ws',
  },
  test: {
    API_HOST: 'https://artemboardgames.herokuapp.com/',
    WS_HOST: 'wss://artemboardgames.herokuapp.com/ws',
  },
  dev: {
    API_HOST: 'http://localhost:5000/',
    WS_HOST: 'ws://localhost:5000/ws',
  },
};

const ENV = (process.env.REACT_APP_ENVIRONMENT || 'dev') as keyof typeof configSettings;
type ConfigValues = typeof configSettings.prod;
type ConfigKeys = keyof ConfigValues;

export const config = <T extends ConfigKeys>(key: T): ConfigValues[T] => {
  return configSettings[ENV][key];
};

export const getEnv = () => {
  return ENV;
};
