import config from 'config';
import sendMessage from 'preload/sendMessage';

export const fetchS3FolderContents = (payload: {
  bucket: string;
  prefix: string;
}): Promise<unknown[]> =>
  sendMessage(config.endpoints.FETCH_S3_FOLDER_CONTENTS, payload);
