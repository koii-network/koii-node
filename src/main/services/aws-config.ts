import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  endpoint: 'https://s3.koii.network',
  forcePathStyle: true,
});
