import { registerAs } from '@nestjs/config';
import { aiEnvSchema, validateEnv } from './env.validation';

export type AiConfig = {
  provider: string;
  providerKey: string;
  baseUrl: string;
  model: string;
};

export const aiConfig = registerAs('ai', (): AiConfig => {
  const env = validateEnv(aiEnvSchema, process.env);
  return {
    provider: env.AI_PROVIDER,
    providerKey: env.AI_PROVIDER_KEY,
    baseUrl: env.AI_BASE_URL,
    model: env.AI_MODEL,
  };
});
