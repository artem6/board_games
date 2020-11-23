// random between 0 and max - 1
export const randomInt = (max: number) => Math.floor(Math.random() * max);

const getLetter = () => letters[Math.floor(Math.random() * letters.length)];

export const getGameCode = () => getLetter() + getLetter() + getLetter() + getLetter();

const letters = 'abcdefghjkmnpqrstuvwxyz';
