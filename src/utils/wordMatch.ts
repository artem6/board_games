import { levenshteinDistance } from './levenshteinDistance';
import { stemmer } from './stemmer';

const cleanWord = (word: string) => {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  word = stemmer(word);
  return word;
};

export const wordMatch = (word1: string, word2: string) => {
  word1 = cleanWord(word1);
  word2 = cleanWord(word2);
  if (word1 === word2) return true;
  if (word1.length < 3 && word2.length < 3) return null;
  const dist = levenshteinDistance(word1, word2);
  if (dist > 1) return false;
  return true;
};

// (window as any).wordMatch = wordMatch;
// (window as any).stemmer = stemmer;
