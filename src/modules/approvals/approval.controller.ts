import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ApprovalService } from './approval.service';
import { decideProposalSchema, DecideProposalInput } from './approval.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { PaginationQuery, paginationQuerySchema } from '../../common/helpers/pagination';

@ApiTags('approvals')
@Controller('proposals')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Get()
  @ApiOperation({ summary: 'List approval proposals' })
  list(
    @CurrentUser('organizationId') organizationId: string,
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery,
  ) {
    return this.approvalService.list(organizationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a proposal with its approvals' })
  findOne(@CurrentUser('organizationId') organizationId: string, @Param('id') id: string) {
    return this.approvalService.getOrThrow(organizationId, id);
  }

  @Post(':id/decision')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.FINANCE)
  @ApiOperation({
    summary: 'Approve or reject a proposal',
    description:
      'When the approval threshold is met the underlying transaction is executed automatically.',
  })
  decide(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(decideProposalSchema)) body: DecideProposalInput,
  ) {
    return this.approvalService.decide(user.organizationId, user.id, id, body);
  }
}
