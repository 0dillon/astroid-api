import { RiskBand } from '@prisma/client';

/** Inputs to the risk engine — all optional except amount. */
export interface RiskFactorsInput {
  amount: number;
  asset: string;
  /** Has this recipient been paid before by the org? */
  knownRecipient: boolean;
  /** Number of transactions by this agent/wallet in the recent window. */
  recentTransactionCount: number;
  /** Age of the wallet in days. Newer wallets are riskier. */
  walletAgeDays: number;
  /** Count of policy violations detected for this intent. */
  policyViolations: number;
  /** Hour-of-day (UTC) the transaction is attempted, for suspicious timing. */
  hourUtc?: number;
}

export interface RiskFactorScore {
  factor: string;
  weight: number;
  contribution: number;
  detail: string;
}

export interface RiskAssessment {
  score: number;
  band: RiskBand;
  factors: RiskFactorScore[];
  /** Critical transactions can never auto-execute. */
  canAutoExecute: boolean;
}

/** Weight each factor contributes to the 0-100 composite score. */
export const RISK_WEIGHTS = {
  amount: 30,
  unknownRecipient: 20,
  velocity: 15,
  walletAge: 15,
  policyViolations: 15,
  suspiciousTiming: 5,
} as const;
