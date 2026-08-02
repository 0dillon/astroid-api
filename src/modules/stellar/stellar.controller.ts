import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { StellarConfig } from '../../config/stellar.config';

/**
 * Read-only informational endpoints for the Stellar integration. Payment and
 * balance operations are exposed through the wallets module.
 */
@ApiTags('stellar')
@Controller('stellar')
export class StellarController {
  constructor(private readonly config: ConfigService) {}

  @Get('network')
  @ApiOperation({ summary: 'Returns the configured Stellar network + mode' })
  getNetwork(): { network: string; horizonUrl: string; mock: boolean } {
    const stellar = this.config.getOrThrow<StellarConfig>('stellar');
    return {
      network: stellar.network,
      horizonUrl: stellar.horizonUrl,
      mock: stellar.useMock,
    };
  }
}
