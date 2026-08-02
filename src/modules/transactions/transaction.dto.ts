import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const amountString = z
  .string()
  .regex(/^\d+(\.\d{1,7})?$/, 'Amount must be a positive decimal with up to 7 places')
  .refine((v) => Number(v) > 0, 'Amount must be greater than zero');

export const createTransactionSchema = z
  .object({
    walletId: z.string().uuid(),
    agentId: z.string().uuid().optional(),
    budgetId: z.string().uuid().optional(),
    asset: z.string().min(1).max(24).default('XLM'),
    amount: amountString,
    recipientAddress: z.string().min(1),
    memo: z.string().max(28).optional(),
    purpose: z.string().max(280).optional(),
    metadata: z.record(z.unknown()).default({}),
  })
  .strict();
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const simulateTransactionSchema = createTransactionSchema;
export type SimulateTransactionInput = z.infer<typeof simulateTransactionSchema>;

// ── Swagger DTOs ──

export class CreateTransactionDto {
  @ApiProperty({ description: 'Sender wallet id' })
  walletId!: string;

  @ApiPropertyOptional({ description: 'Initiating agent id' })
  agentId?: string;

  @ApiPropertyOptional({ description: 'Budget to charge this transaction against' })
  budgetId?: string;

  @ApiPropertyOptional({ example: 'XLM' })
  asset?: string;

  @ApiProperty({ example: '125.5000000' })
  amount!: string;

  @ApiProperty({ example: 'GB...' })
  recipientAddress!: string;

  @ApiPropertyOptional({ maxLength: 28 })
  memo?: string;

  @ApiPropertyOptional()
  purpose?: string;

  @ApiPropertyOptional({ type: Object })
  metadata?: Record<string, unknown>;
}
