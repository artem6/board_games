const getLetter = () => letters[Math.floor(Math.random() * letters.length)];

export const getGameCode = () => getLetter() + getLetter() + getLetter() + getLetter();

const letters = 'abcdefghjkmnpqrstuvwxyz';
