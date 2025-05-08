import { Connection, PublicKey as KplPublicKey } from '@_koi/web3.js';
import { getMint } from '@solana/spl-token';
import { Connection as SolConnection, PublicKey } from '@solana/web3.js';

export const verifyMintAddress = async (
  connection: Connection & SolConnection,
  mintAddress: PublicKey & KplPublicKey
) => {
  try {
    const mintInfo = await getMint(connection, new PublicKey(mintAddress));
    console.log('Mint info:', mintInfo);
    return true;
  } catch (error) {
    console.error('Invalid mint address:', error);
    return false;
  }
};
