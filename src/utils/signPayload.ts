import { Keypair } from '@_koii/web3.js';
import bs58 from 'bs58';
// eslint-disable-next-line @cspell/spellchecker
import nacl from 'tweetnacl';

export const signPayload = (payload: string, keypair: Keypair) => {
  const msg = new TextEncoder().encode(JSON.stringify(payload));
  const signedMessage = nacl.sign(msg, keypair.secretKey);
  const signData = bs58.encode(
    Buffer.from(
      signedMessage.buffer,
      signedMessage.byteOffset,
      signedMessage.byteLength
    )
  );
  return signData;
};
