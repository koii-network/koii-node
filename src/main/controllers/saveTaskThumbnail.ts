import { promises as fsPromises } from 'fs';
import https from 'https';

import axios from 'axios';
import { getAppDataPath } from 'main/node/helpers/getAppDataPath';

const { writeFile, mkdir } = fsPromises;

const THUMBNAILS_CACHE_DIR = `${getAppDataPath()}/thumbnails`;

export const sanitizeUrl = (url: string): string => {
  return url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export const saveTaskThumbnail = async (
  _: Event,
  { url }: { url: string }
): Promise<void> => {
  const sanitizedUrl = sanitizeUrl(url);
  const cacheFilePath = `${THUMBNAILS_CACHE_DIR}/${sanitizedUrl}`;

  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    httpsAgent,
  });
  const buffer = Buffer.from(response.data, 'binary');

  try {
    await mkdir(THUMBNAILS_CACHE_DIR, { recursive: true });
    await writeFile(cacheFilePath, buffer);
  } catch (error) {
    console.error('Error saving image', error);
  }
};
