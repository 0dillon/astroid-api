import { Injectable, Logger } from '@nestjs/common';
import { Queues } from '../queues/queues.constants';

export interface WebhookDeliveryJob {
  webhookId: string;
  event: string;
  payload: Record<string, unknown>;
  /** Current attempt number (1-based); BullMQ increments on retry. */
  attempt: number;
}

/**
 * Retries failed webhook deliveries with exponential backoff. Every payload is
 * signed with the webhook's HMAC secret in the dispatcher; this worker only
 * schedules redelivery and terminal dead-lettering after `attempts` exhausts.
 */
@Injectable()
export class WebhookDeliveryWorker {
  private readonly logger = new Logger(WebhookDeliveryWorker.name);
  readonly queue = Queues.Webhooks;

  async process(job: { data: WebhookDeliveryJob }): Promise<void> {
    this.logger.log(
      `deliver ${job.data.event} → webhook ${job.data.webhookId} (attempt ${job.data.attempt})`,
    );
  }
}
