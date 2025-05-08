import config from 'config';
import sendMessage from 'preload/sendMessage';

interface UpgradeTaskParams {
  oldPublicKey: string;
  newPublicKey: string;
  newStake: number;
  useStakingWalletForStake?: boolean;
  tokenType: string;
}

export default (payload: UpgradeTaskParams) =>
  sendMessage(config.endpoints.UPGRADE_TASK, payload);
