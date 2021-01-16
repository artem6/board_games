// random between 0 and max - 1
export const randomInt = (max: number) => Math.floor(Math.random() * max);

const getLetter = () => letters[Math.floor(Math.random() * letters.length)];

export const getGameCode = () => getLetter() + getLetter() + getLetter() + getLetter();

export const selectOneRandomly = <T>(list: T[]) => list[randomInt(list.length)];

export const randomizeList = <T>(list: T[]) => {
  list = [...list];
  list.sort(() => (Math.random() > 0.5 ? 1 : -1));
  return list;
};

const letters = 'abcdefghjkmnpqrstuvwxyz';
