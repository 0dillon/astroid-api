import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const createMemorySchema = z
  .object({
    agentId: z.string().uuid().optional(),
    transactionId: z.string().uuid().optional(),
    task: z.string().max(280).optional(),
    reason: z.string().max(2000).optional(),
    conversationId: z.string().max(120).optional(),
    policyUsed: z.string().max(120).optional(),
    risk: z.number().int().min(0).max(100).optional(),
    summary: z.string().max(2000).optional(),
    metadata: z.record(z.unknown()).default({}),
  })
  .strict();
export type CreateMemoryInput = z.infer<typeof createMemorySchema>;

// ── Swagger DTOs ──

export class CreateMemoryDto {
  @ApiPropertyOptional()
  agentId?: string;

  @ApiPropertyOptional()
  transactionId?: string;

  @ApiPropertyOptional({ example: 'Pay invoice #4521' })
  task?: string;

  @ApiPropertyOptional({ example: 'Vendor is a known recipient; amount within monthly budget.' })
  reason?: string;

  @ApiPropertyOptional()
  conversationId?: string;

  @ApiPropertyOptional()
  policyUsed?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  risk?: number;

  @ApiPropertyOptional()
  summary?: string;

  @ApiPropertyOptional({ type: Object })
  metadata?: Record<string, unknown>;
}
