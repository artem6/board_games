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

    // API_HOST: 'http://192.168.50.63:5000/',
    // WS_HOST: 'ws://192.168.50.63:5000/ws',

    // API_HOST: 'https://artemboardgames.herokuapp.com/',
    // WS_HOST: 'wss://artemboardgames.herokuapp.com/ws',
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
