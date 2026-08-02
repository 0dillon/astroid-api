import { Global, Module } from '@nestjs/common';
import { ApiKeyController } from './api-key.controller';
import { ApiKeyService } from './api-key.service';
import { ApiKeyRepository } from './api-key.repository';

/**
 * Developer module (API keys). Global so an API-key auth guard can verify
 * presented keys from anywhere.
 */
@Global()
@Module({
  controllers: [ApiKeyController],
  providers: [ApiKeyService, ApiKeyRepository],
  exports: [ApiKeyService],
})
export class DeveloperModule {}
