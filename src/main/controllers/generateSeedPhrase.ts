import { generateMnemonic, validateMnemonic } from 'bip39';

const generateSeedPhrase = async (event: Event): Promise<string> => {
  const seedPhrase = generateMnemonic().trim();

  const validMnemonic = validateMnemonic(seedPhrase)
    ? seedPhrase
    : await generateSeedPhrase(event);

  return validMnemonic;
};

export default generateSeedPhrase;
