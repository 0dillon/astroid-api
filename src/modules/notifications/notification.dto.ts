import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const markReadSchema = z
  .object({
    ids: z.array(z.string().uuid()).min(1).max(200),
  })
  .strict();
export type MarkReadInput = z.infer<typeof markReadSchema>;

export class MarkReadDto {
  @ApiProperty({ type: [String], description: 'Notification ids to mark as read' })
  ids!: string[];
}
