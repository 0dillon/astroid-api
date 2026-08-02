import { Global, Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditRepository } from './audit.repository';
import { AuditListener } from './audit.listener';

/**
 * Audit module. Globally exported so any module can record audit entries
 * directly; the listener also captures every domain event automatically.
 */
@Global()
@Module({
  controllers: [AuditController],
  providers: [AuditService, AuditRepository, AuditListener],
  exports: [AuditService],
})
export class AuditModule {}
