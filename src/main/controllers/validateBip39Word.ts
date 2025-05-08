import { wordlists } from 'bip39';
import { ValidateBip39WordParams } from 'models/api/validateBip39Word';

const englishValidWords = wordlists.english;

export const validateBip39Word = (
  _: Event,
  { word }: ValidateBip39WordParams
) => englishValidWords.includes(word);
