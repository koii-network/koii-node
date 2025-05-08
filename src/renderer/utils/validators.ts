import { compare } from 'bcryptjs';

export async function validatePin(pin: string, pinSha: string | undefined) {
  if (pin.length === 6) {
    const pinMatchesStoredHash = await compare(pin, pinSha || '');
    return pinMatchesStoredHash;
  }
  return false;
}
