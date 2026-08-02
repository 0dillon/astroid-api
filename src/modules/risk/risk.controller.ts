import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RiskService } from './risk.service';
import { assessRiskSchema, AssessRiskInput } from './risk.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@ApiTags('risk')
@Controller('risk')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Post('assess')
  @ApiOperation({ summary: 'Assess the risk score of a hypothetical transaction' })
  assess(
    @CurrentUser('organizationId') _organizationId: string,
    @Body(new ZodValidationPipe(assessRiskSchema)) body: AssessRiskInput,
  ) {
    return this.riskService.assess(body);
  }
}
