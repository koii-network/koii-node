import * as isIPFS from 'is-ipfs';

import axios from 'axios';
import config from 'config';
import { retrieveFromIPFS } from 'services/ipfs';

import { fetchFromIPFSOrArweave } from './fetchFromIPFSOrArweave';

jest.mock('services/ipfs', () => ({
  retrieveFromIPFS: jest.fn().mockReturnValue('result_from_ipfs'),
}));

jest.mock('axios', () => ({
  get: jest.fn(),
}));

jest.mock('is-ipfs', () => ({
  cid: jest.fn(),
}));

describe('fetchFromIPFSOrArweave', () => {
  const cid = 'example_cid';
  const filename = 'example_filename';
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls retrieveFromIPFS', async () => {
    (isIPFS.cid as jest.Mock).mockReturnValue(true);

    const result = await fetchFromIPFSOrArweave(cid, filename);

    expect(retrieveFromIPFS).toHaveBeenCalledWith(cid, filename);
    expect(axios.get).not.toHaveBeenCalled();
    expect(result).toBe('result_from_ipfs');
  });

  it('calls retrieveFromArweave', async () => {
    (isIPFS.cid as jest.Mock).mockReturnValue(false);
    (axios.get as jest.Mock).mockReturnValue({ data: 'result_from_arweave' });

    const result = await fetchFromIPFSOrArweave(cid, filename);

    expect(retrieveFromIPFS).not.toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalledWith(
      `${config.node.ARWEAVE_GATEWAY_URL}/${cid}`,
      {
        transformResponse: [],
      }
    );
    expect(result).toBe('result_from_arweave');
  });
});
