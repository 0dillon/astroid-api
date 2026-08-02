import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebhookRepository } from './webhook.repository';
import { DomainEventEnvelope } from '../../events/domain-event.types';
import { WEBHOOK_EVENTS } from '../../events/event-names';
import { hmacSign } from '../../utils/crypto.util';

/**
 * Delivers domain events to subscribed external webhooks. Each delivery is
 * signed with the webhook's HMAC secret (`x-astroid-signature`) so receivers can
 * verify authenticity. The secret itself is never logged. Delivery is
 * best-effort and isolated per webhook — one failing endpoint never blocks
 * others or the originating operation.
 */
@Injectable()
export class WebhookDispatcher {
  private readonly logger = new Logger(WebhookDispatcher.name);

  constructor(private readonly repository: WebhookRepository) {}

  @OnEvent('**')
  async dispatch(envelope: DomainEventEnvelope): Promise<void> {
    if (!envelope?.organizationId) {
      return;
    }
    // Only forward the curated set of externally-relevant events.
    if (!WEBHOOK_EVENTS.includes(envelope.name)) {
      return;
    }

    const webhooks = await this.repository.findEnabledForEvent(
      envelope.organizationId,
      envelope.name,
    );
    if (webhooks.length === 0) {
      return;
    }

    const body = JSON.stringify({
      event: envelope.name,
      occurredAt: envelope.occurredAt,
      aggregateType: envelope.aggregateType,
      aggregateId: envelope.aggregateId,
      data: envelope.payload,
    });

    await Promise.all(
      webhooks.map(async (webhook) => {
        try {
          const signature = hmacSign(webhook.secret, body);
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-astroid-event': envelope.name,
              'x-astroid-signature': signature,
            },
            body,
            // Bound the wait so a slow endpoint cannot stall the dispatcher.
            signal: AbortSignal.timeout(8_000),
          });
          if (!response.ok) {
            this.logger.warn(
              `Webhook ${webhook.id} responded ${response.status} for '${envelope.name}'`,
            );
          }
        } catch (error) {
          this.logger.warn(
            `Webhook ${webhook.id} delivery failed for '${envelope.name}': ${(error as Error).message}`,
          );
        }
      }),
    );
  }
}
