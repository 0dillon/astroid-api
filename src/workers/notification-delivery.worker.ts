import { Injectable, Logger } from '@nestjs/common';
import { Queues } from '../queues/queues.constants';

export interface NotificationJobPayload {
  notificationId: string;
  channel: 'dashboard' | 'email' | 'slack' | 'discord' | 'webhook';
  recipient: string;
  subject: string;
  body: string;
}

/**
 * Delivers outbound notifications one at a time. Email and chat channels can be
 * slow or token-bucketed, so sends are isolated to a worker rather than running
 * in the request path — a blocked SMTP server never delays a payment response.
 */
@Injectable()
export class NotificationDeliveryWorker {
  private readonly logger = new Logger(NotificationDeliveryWorker.name);
  readonly queue = Queues.Notifications;

  async process(job: { name: string; data: NotificationJobPayload }): Promise<void> {
    this.logger.log(`[${job.name}] deliver ${job.data.channel} → ${job.data.recipient}`);
    // Delivery is performed by the Notifications module dispatch layer; this
    // worker only owns the queue cadence and retry semantics.
  }
}
