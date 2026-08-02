import { Module } from '@nestjs/common';
import { RiskController } from './risk.controller';
import { RiskService } from './risk.service';
import { RiskEngine } from './risk.engine';

@Module({
  controllers: [RiskController],
  providers: [RiskService, RiskEngine],
  exports: [RiskService, RiskEngine],
})
export class RiskModule {}
