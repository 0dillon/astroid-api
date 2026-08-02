import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { AgentRepository } from './agent.repository';

/** Agent lifecycle management. */
@Module({
  controllers: [AgentController],
  providers: [AgentService, AgentRepository],
  exports: [AgentService],
})
export class AgentModule {}
