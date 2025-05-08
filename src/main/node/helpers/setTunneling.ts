import signPayload from './signPayloadHelper';

const localtunnel: any = require('@koii-network/koii-localtunnel-client');

const startLocalTunnel = async (): Promise<{
  success: boolean;
  result?: string;
  error?: string;
  tunnel?: any;
}> => {
  try {
    const signedData = await signPayload();
    const tunnel = await localtunnel(
      {
        port: 30017,
      },
      {
        // signedData: 'JRSWuZL2taXj7FJXQtFUryJu4PDhuHDUo5QNYQEZPktiM2ZGmB8z6ALjCsUcZimjxBddmCjwH9ZsaHqhmVZN2chPeucpjAPCBe37SFg5r39oUGj3SpudWeMz',
        signedData: signedData.signData,
        publicKey: signedData.pubKey,
      }
    );
    return {
      success: true,
      result: tunnel.url,
      tunnel,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};
export default startLocalTunnel;
