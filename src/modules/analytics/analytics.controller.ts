import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Dashboard overview: counts, spend and distributions' })
  overview(@CurrentUser('organizationId') organizationId: string) {
    return this.analyticsService.overview(organizationId);
  }

  @Get('spend-by-agent')
  @ApiOperation({ summary: 'Completed spend grouped by agent' })
  spendByAgent(@CurrentUser('organizationId') organizationId: string) {
    return this.analyticsService.spendByAgent(organizationId);
  }
}
