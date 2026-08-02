import { Module } from '@nestjs/common';
import { MemoryController } from './memory.controller';
import { MemoryService } from './memory.service';
import { MemoryRepository } from './memory.repository';

/** Financial memory module — explainability and decision search. */
@Module({
  controllers: [MemoryController],
  providers: [MemoryService, MemoryRepository],
  exports: [MemoryService],
})
export class MemoryModule {}
