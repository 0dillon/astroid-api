import { registerAs } from '@nestjs/config';
import { stellarEnvSchema, validateEnv } from './env.validation';

export type StellarConfig = {
  network: 'testnet' | 'public' | 'futurenet';
  horizonUrl: string;
  sorobanRpcUrl: string;
  useMock: boolean;
};

export const stellarConfig = registerAs('stellar', (): StellarConfig => {
  const env = validateEnv(stellarEnvSchema, process.env);
  return {
    network: env.STELLAR_NETWORK,
    horizonUrl: env.STELLAR_HORIZON_URL,
    sorobanRpcUrl: env.STELLAR_SOROBAN_RPC_URL,
    useMock: env.STELLAR_USE_MOCK,
  };
});
