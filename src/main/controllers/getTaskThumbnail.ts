import { promises as fsPromises } from 'fs';

import { getAppDataPath } from 'main/node/helpers/getAppDataPath';

import { sanitizeUrl } from './saveTaskThumbnail';

const { readFile, access } = fsPromises;
const THUMBNAILS_CACHE_DIR = `${getAppDataPath()}/thumbnails`;

export const getTaskThumbnail = async (
  _: Event,
  { url }: { url: string }
): Promise<string | false> => {
  const sanitizedUrl = sanitizeUrl(url);
  const cacheFilePath = `${THUMBNAILS_CACHE_DIR}/${sanitizedUrl}`;

  try {
    await access(cacheFilePath);
    const fileBuffer = await readFile(cacheFilePath);
    const base64Image = Buffer.from(fileBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;
    return dataUrl;
  } catch (error) {
    return false;
  }
};
