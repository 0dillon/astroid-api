import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AgentRole, AgentStatus } from '@prisma/client';

export const createAgentSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  provider: z.string().max(80).optional(),
  model: z.string().max(80).optional(),
  role: z.nativeEnum(AgentRole).default(AgentRole.CUSTOM),
  capabilities: z.array(z.string().max(80)).max(50).default([]),
  metadata: z.record(z.unknown()).default({}),
});
export type CreateAgentInput = z.infer<typeof createAgentSchema>;

export const updateAgentSchema = createAgentSchema.partial();
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;

export const assignWalletSchema = z.object({
  walletId: z.string().uuid(),
});
export type AssignWalletInput = z.infer<typeof assignWalletSchema>;

// ── Swagger DTOs (documentation only; validation is done by Zod pipes) ──

export class CreateAgentDto {
  @ApiProperty({ example: 'Procurement Bot' })
  name!: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'openai' })
  provider?: string;

  @ApiPropertyOptional({ example: 'gpt-4o' })
  model?: string;

  @ApiPropertyOptional({ enum: AgentRole })
  role?: AgentRole;

  @ApiPropertyOptional({ type: [String], example: ['payments', 'reporting'] })
  capabilities?: string[];

  @ApiPropertyOptional({ type: Object })
  metadata?: Record<string, unknown>;
}

export class AssignWalletDto {
  @ApiProperty({ description: 'The wallet to set as the agent primary wallet' })
  walletId!: string;
}

export class UpdateAgentStatusDto {
  @ApiProperty({ enum: AgentStatus })
  status!: AgentStatus;
}
