import { hash, compare } from 'bcryptjs';

export const usePinUtils = () => {
  const encryptPin = async (pin: string) => {
    const saltRounds = 10;
    const hashedPin = await hash(pin, saltRounds);
    return hashedPin;
  };

  const validatePin = async (pin: string, pinSha: string | undefined) => {
    if (pin.length === 6 && pinSha) {
      const pinMatchesStoredHash = await compare(pin, pinSha);
      return pinMatchesStoredHash;
    }
    return false;
  };

  return {
    encryptPin,
    validatePin,
  };
};
