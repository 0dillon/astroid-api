import { registerAs } from '@nestjs/config';
import { appEnvSchema, validateEnv } from './env.validation';

export type AppConfig = {
  nodeEnv: 'development' | 'test' | 'production';
  name: string;
  port: number;
  apiPrefix: string;
  logLevel: string;
  corsOrigins: string[];
  isProduction: boolean;
};

export const appConfig = registerAs('app', (): AppConfig => {
  const env = validateEnv(appEnvSchema, process.env);
  return {
    nodeEnv: env.NODE_ENV,
    name: env.APP_NAME,
    port: env.PORT,
    apiPrefix: env.API_PREFIX,
    logLevel: env.LOG_LEVEL,
    corsOrigins: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    isProduction: env.NODE_ENV === 'production',
  };
});
