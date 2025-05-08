import { Readable } from 'stream';

import {
  ListObjectsV2Command,
  GetObjectCommand,
  GetObjectCommandOutput,
} from '@aws-sdk/client-s3';

import { s3Client } from 'main/services/aws-config';

interface FetchS3FolderContentsPayload {
  bucket: string;
  prefix: string;
}

interface FetchS3FolderContentsPayload {
  bucket: string;
  prefix: string;
}

const isDev = process.env.NODE_ENV === 'development';

export const fetchS3FolderContents = async (
  event: Event,
  payload: FetchS3FolderContentsPayload
): Promise<any[]> => {
  const { bucket, prefix } = payload;

  const bucketName = isDev ? `${bucket}-dev` : bucket;

  const listedObjects = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    })
  );

  const fileKeys =
    listedObjects.Contents?.filter((item) => item.Key !== `${prefix}/`).map(
      (item) => item.Key
    ) || [];

  const filesContentsPromises = fileKeys.map(async (key) => {
    if (!key) return null; // Safeguard for TypeScript

    const getObjectParams = { Bucket: bucketName, Key: key };

    const command = new GetObjectCommand(getObjectParams);
    const response: GetObjectCommandOutput = await s3Client.send(command);

    if (response.Body) {
      // Node.js environment
      const stream = response.Body as Readable;
      const chunks: Buffer[] = [];
      return new Promise<any>((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => {
          const content = Buffer.concat(chunks).toString('utf-8');
          resolve(JSON.parse(content));
        });
      });
    } else {
      console.error('The response body is not in expected format.');
      return null;
    }
  });

  return Promise.all(filesContentsPromises.filter(Boolean)); // Filter out any nulls for safety
};
