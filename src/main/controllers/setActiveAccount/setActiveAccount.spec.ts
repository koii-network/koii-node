import { Event } from 'electron';

import { namespaceInstance } from 'main/node/helpers/Namespace';

import { SystemDbKeys } from '../../../config/systemDbKeys';
import { getMainSystemAccountKeypair } from '../../node/helpers';

import { setActiveAccount } from './setActiveAccount';

jest.mock('main/node/helpers/Namespace', () => ({
  namespaceInstance: {
    storeSet: jest.fn(),
    mainSystemAccount: null,
  },
}));

jest.mock('../../node/helpers', () => ({
  getMainSystemAccountKeypair: jest.fn(),
}));

describe('setActiveAccount', () => {
  const mockEvent = {} as Event;
  const mockPayload = { accountName: 'testAccount' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set active account successfully', async () => {
    (getMainSystemAccountKeypair as jest.Mock).mockResolvedValue('mockKeyPair');
    const result = await setActiveAccount(mockEvent, mockPayload);
    expect(result).toBe(true);
    expect(namespaceInstance.storeSet).toHaveBeenCalledWith(
      SystemDbKeys.ActiveAccount,
      mockPayload.accountName
    );
    expect(namespaceInstance.mainSystemAccount).toBe('mockKeyPair');
  });

  it('should handle error during setting active account', async () => {
    (namespaceInstance.storeSet as jest.Mock).mockRejectedValue(
      new Error('Mock error')
    );
    const result = await setActiveAccount(mockEvent, mockPayload);
    expect(result).toBe(false);
  });
});
