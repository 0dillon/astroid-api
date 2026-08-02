import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WebhookRepository } from './webhook.repository';
import { WebhookDispatcher } from './webhook.dispatcher';

/**
 * Webhooks module. The dispatcher listens to domain events and signs + delivers
 * the curated WEBHOOK_EVENTS set to subscribed external endpoints.
 */
@Module({
  controllers: [WebhookController],
  providers: [WebhookService, WebhookRepository, WebhookDispatcher],
  exports: [WebhookService],
})
export class WebhookModule {}
