import sdk from 'main/services/sdk';

const connection = sdk.k2Connection;
type ConnectionType = typeof connection;

export const calculateTxFee = async (
  connection: ConnectionType,
  signaturesNumber: number
) => {
  const { feeCalculator } = await connection.getRecentBlockhash();
  const fees = feeCalculator.lamportsPerSignature * signaturesNumber;
  return fees;
};

export const ROE_PER_KOII = 1000000000;
