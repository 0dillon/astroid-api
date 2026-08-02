import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuditService } from './audit.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  PaginationQuery,
  paginationQuerySchema,
} from '../../common/helpers/pagination';

/** Read-only access to the append-only audit trail. Restricted to auditors/admins. */
@ApiTags('audit')
@Controller('audit')
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AUDITOR)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List audit log entries for the organization' })
  list(
    @CurrentUser('organizationId') organizationId: string,
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery,
  ) {
    return this.auditService.list(organizationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single audit log entry' })
  findOne(@CurrentUser('organizationId') organizationId: string, @Param('id') id: string) {
    return this.auditService.findById(organizationId, id);
  }
}
