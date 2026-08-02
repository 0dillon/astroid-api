import type { Agent, Budget, Policy, Transaction, Wallet } from '@prisma/client';

/** Decimal-as-string at Stellar's 7-decimal precision (serialized). */
export type DecimalString = string;

/** ISO-8601 UTC timestamp as returned by the API. */
export type IsoTimestamp = string;

/** Shared principal-visibility guard used when returning entities. */
export interface OwnedResource {
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/** Transaction enriched with related records for detail responses. */
export interface TransactionWithRelations extends Transaction {
  wallet: Wallet;
  agent?: Agent | null;
  policy?: Policy | null;
  budget?: Budget | null;
}

/** Agent row plus the hydrated wallet it operates through. */
export interface AgentWithWallet extends Agent {
  wallet?: Wallet | null;
}

/** Risk bands surface as both a numeric score and a discrete level. */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
