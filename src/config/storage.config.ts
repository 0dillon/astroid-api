import { registerAs } from '@nestjs/config';
import { storageEnvSchema, validateEnv } from './env.validation';

export type StorageConfig = {
  endpoint: string;
  region: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
};

export const storageConfig = registerAs('storage', (): StorageConfig => {
  const env = validateEnv(storageEnvSchema, process.env);
  return {
    endpoint: env.STORAGE_ENDPOINT,
    region: env.STORAGE_REGION,
    bucket: env.STORAGE_BUCKET,
    accessKey: env.STORAGE_ACCESS_KEY,
    secretKey: env.STORAGE_SECRET_KEY,
  };
});
