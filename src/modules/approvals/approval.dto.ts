import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApprovalDecision } from '@prisma/client';

export const decideProposalSchema = z
  .object({
    decision: z.enum([ApprovalDecision.APPROVED, ApprovalDecision.REJECTED]),
    comment: z.string().max(500).optional(),
  })
  .strict();
export type DecideProposalInput = z.infer<typeof decideProposalSchema>;

// ── Swagger DTOs ──

export class DecideProposalDto {
  @ApiProperty({ enum: [ApprovalDecision.APPROVED, ApprovalDecision.REJECTED] })
  decision!: ApprovalDecision;

  @ApiPropertyOptional({ description: 'Optional reviewer note' })
  comment?: string;
}

export const decisionCommentSchema = z
  .object({
    comment: z.string().max(500).optional(),
  })
  .strict();
export type DecisionCommentInput = z.infer<typeof decisionCommentSchema>;

export class DecisionCommentDto {
  @ApiPropertyOptional({ description: 'Optional reviewer note' })
  comment?: string;
}
