import { registerAs } from '@nestjs/config';
import { databaseEnvSchema, validateEnv } from './env.validation';

export type DatabaseConfig = {
  url: string;
};

export const databaseConfig = registerAs('database', (): DatabaseConfig => {
  const env = validateEnv(databaseEnvSchema, process.env);
  return { url: env.DATABASE_URL };
});
