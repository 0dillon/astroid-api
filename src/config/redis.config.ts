import { registerAs } from '@nestjs/config';
import { redisEnvSchema, validateEnv } from './env.validation';

export type RedisConfig = {
  host: string;
  port: number;
  password: string;
  db: number;
};

export const redisConfig = registerAs('redis', (): RedisConfig => {
  const env = validateEnv(redisEnvSchema, process.env);
  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
  };
});
