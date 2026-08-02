import { z } from 'zod';

export const assessRiskSchema = z.object({
  amount: z.number().positive(),
  asset: z.string().min(1).default('USDC'),
  knownRecipient: z.boolean().default(false),
  recentTransactionCount: z.number().int().nonnegative().default(0),
  walletAgeDays: z.number().int().nonnegative().default(0),
  policyViolations: z.number().int().nonnegative().default(0),
  hourUtc: z.number().int().min(0).max(23).optional(),
});

export type AssessRiskInput = z.infer<typeof assessRiskSchema>;
