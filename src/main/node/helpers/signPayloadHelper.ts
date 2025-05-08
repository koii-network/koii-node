import * as bs58 from 'bs58';
// eslint-disable-next-line @cspell/spellchecker
import * as nacl from 'tweetnacl';

import { getStakingAccountKeypair } from './wallets';

async function signPayload(): Promise<{ signData: string; pubKey: string }> {
  const stakingAccountKeyPair = await getStakingAccountKeypair();
  const ipAddress = await getIPAddress();
  const msgJson = { ip: ipAddress };
  const msg = new TextEncoder().encode(JSON.stringify(msgJson));
  const signedMessage = nacl.sign(msg, stakingAccountKeyPair.secretKey);
  const signData = bs58.encode(
    Buffer.from(
      signedMessage.buffer,
      signedMessage.byteOffset,
      signedMessage.byteLength
    )
  );
  return { signData, pubKey: stakingAccountKeyPair.publicKey.toBase58() };
}

async function getIPAddress(): Promise<string> {
  const res = await fetch('https://api.ipify.org/?format=json');
  const data: any = await res.json();
  return data.ip;
}

export default signPayload;
