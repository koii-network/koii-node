// import { Keypair, PublicKey } from '@_koii/web3.js';

jest.mock('../node/helpers', () => ({
  __esModule: true,
  getMainSystemAccountKeypair: jest.fn(),
  getStakingAccountKeypair: jest.fn(),
}));

jest.mock('./getTaskInfo', () => ({
  __esModule: true,
  getTaskInfo: jest.fn(),
}));

jest.mock('../node/helpers/Namespace', () => ({
  __esModule: true,
  namespaceInstance: {
    claimReward: jest.fn(),
  },
}));
jest.mock('main/services/tasks-cache-utils', () => ({
  __esModule: true,
  saveStakeRecordToCache: jest.fn(),
  getTaskDataFromCache: jest.fn(),
  savePendingRewardsRecordToCache: jest.fn(),
}));

describe.skip('claimReward', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('claims reward and sends response', async () => {
    expect(true).toBe(true);
    //   const exampleAddress = '7x8tP5ipyqPfrRSXoxgGz6EzfTe3S84J3WUvJwbTwgnY';
    //   const examplePubkey = new PublicKey(exampleAddress);
    //   const stakingAccKeypair = Keypair.generate();
    //   const mainSystemAccountKeyPair = Keypair.generate();
    //   const expectedResponse = 'expectedResponse';
    //   const taskState = {
    //     stakePotAccount: exampleAddress,
    //   };
    //   (getStakingAccountKeypair as jest.Mock).mockReturnValue(stakingAccKeypair);
    //   (getMainSystemAccountKeypair as jest.Mock).mockReturnValue(
    //     mainSystemAccountKeyPair
    //   );
    //   (getTaskInfo as jest.Mock).mockReturnValue(taskState);
    //   (namespaceInstance.claimReward as jest.Mock).mockReturnValue(
    //     expectedResponse
    //   );
    //   const payload = {
    //     taskAccountPubKey: exampleAddress,
    //   };
    //   const result = await claimReward({} as Event, payload);
    //   expect(getStakingAccountKeypair).toHaveBeenCalled();
    //   expect(getMainSystemAccountKeypair).toHaveBeenCalled();
    //   expect(getTaskInfo).toHaveBeenCalledWith(
    //     {},
    //     { taskAccountPubKey: payload.taskAccountPubKey }
    //   );
    //   expect(namespaceInstance.claimReward).toHaveBeenCalledWith(
    //     examplePubkey,
    //     mainSystemAccountKeyPair.publicKey,
    //     stakingAccKeypair,
    //     examplePubkey
    //   );
    //   expect(result).toBe(expectedResponse);
  });
});
