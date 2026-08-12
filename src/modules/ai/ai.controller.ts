import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { z } from 'zod';
import { AiService } from './ai.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

const chatSchema = z.object({ message: z.string().min(1).max(2000) });
type ChatInput = z.infer<typeof chatSchema>;

@ApiTags('ai')
@ApiBearerAuth('access-token')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('briefing')
  @ApiOperation({ summary: 'Generate a daily executive AI briefing for the organization' })
  getBriefing(@CurrentUser('organizationId') organizationId: string) {
    return this.aiService.getBriefing(organizationId);
  }

  @Get('assistant/seed')
  @ApiOperation({ summary: 'Return the seeded assistant conversation transcript' })
  getSeed() {
    return this.aiService.getSeed();
  }

  @Post('chat')
  @ApiOperation({ summary: 'Send a message to the AI assistant' })
  chat(@Body(new ZodValidationPipe(chatSchema)) body: ChatInput) {
    return this.aiService.chat(body.message);
  }
}
