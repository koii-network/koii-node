import { promises as fsPromises } from 'fs';

import { getAppDataPath } from 'main/node/helpers/getAppDataPath';

import { fetchFromIPFSOrArweave } from './fetchFromIPFSOrArweave';
import { getTaskMetadata } from './getTaskMetadata';

jest.mock('./fetchFromIPFSOrArweave', () => ({
  __esModule: true,
  fetchFromIPFSOrArweave: jest.fn(),
}));

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    access: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

jest.mock('main/node/helpers/getAppDataPath', () => ({
  getAppDataPath: jest.fn(() => '/path/to/app/data'),
}));

describe('getTaskMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAppDataPath as jest.Mock).mockReturnValue('/path/to/app/data');
  });

  it('throws error if metadataCID is missing', async () => {
    const payload: any = {};

    await expect(getTaskMetadata({} as Event, payload)).rejects.toThrow();
  });

  it('throws too many request error', async () => {
    const payload = {
      metadataCID: 'example_cid',
    };

    (fetchFromIPFSOrArweave as jest.Mock).mockReturnValue(
      '<html>429 Too Many Requests</html>'
    );

    await expect(getTaskMetadata({} as Event, payload)).rejects.toThrow();
  });

  it('returns metadata from cache', async () => {
    const payload = {
      metadataCID: 'example_cid',
    };

    (fsPromises.readFile as jest.Mock).mockReturnValue(
      JSON.stringify({ description: 'example_description' })
    );

    const result = await getTaskMetadata({} as Event, payload);
    expect(result).toEqual({
      description: 'example_description',
    });
  });

  it('fetches and caches metadata', async () => {
    const payload = {
      metadataCID: 'example_cid',
    };

    (fsPromises.readFile as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    (fetchFromIPFSOrArweave as jest.Mock).mockReturnValue(
      JSON.stringify({ description: 'example_description' })
    );

    const result = await getTaskMetadata({} as Event, payload);
    expect(result).toEqual({
      description: 'example_description',
    });

    expect(fsPromises.writeFile).toHaveBeenCalledWith(
      '/path/to/app/data/metadata/example_cid.json',
      JSON.stringify({ description: 'example_description' }),
      'utf-8'
    );
  });
});
