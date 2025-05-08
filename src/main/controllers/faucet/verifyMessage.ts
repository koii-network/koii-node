import axios from 'axios';
import bs58 from 'bs58';
import { FAUCET_API_URL } from 'config/faucet';
import { getMainSystemAccountKeypair } from 'main/node/helpers';
import nacl from 'tweetnacl';

// Function to call the verifyMessage endpoint
export const verifyMessage = async () => {
  try {
    const mainWallet = await getMainSystemAccountKeypair();
    const privateKey = mainWallet.secretKey;
    const keyPair = nacl.sign.keyPair.fromSecretKey(privateKey);
    const publicKey = bs58.encode(keyPair.publicKey);

    console.log('Loaded Wallet:');
    console.log('Public Key:', publicKey);

    const timestamp = new Date().toISOString(); // ISO 8601 format
    const message = `Authenticate at ${timestamp}`;
    const encodedMessage = new TextEncoder().encode(message);

    const signature = nacl.sign.detached(encodedMessage, privateKey);
    const encodedSignature = bs58.encode(signature);

    console.log('\nSigning Message:');
    console.log('Message:', message);
    console.log('Signature:', encodedSignature);

    console.log('\nCalling /verify-message...');
    const verifyResponse = await axios.post(
      `${FAUCET_API_URL}/verify-message`,
      {
        message,
        signature: encodedSignature,
        publicKey,
      }
    );

    console.log('Verification Response:', verifyResponse.data);

    console.log('\nCalling /last-verified...');
    const lastVerifiedResponse = await axios.get(
      `${FAUCET_API_URL}/last-verified/${publicKey}`
    );

    console.log('Last Verified Response:', lastVerifiedResponse.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error Response:', error.response?.data);
    } else {
      console.error('Error:', error);
    }
  }
};
