import { createHash } from 'crypto';

export const createReferralCode = async (
  event: Event,
  walletAddress: string
) => {
  const hash = createHash('sha256').update(walletAddress).digest('hex');
  // Take the first 12 characters of the hash and convert them to alphanumeric
  return hash.slice(0, 12).replace(/[^\w]/g, '').toUpperCase();
};
