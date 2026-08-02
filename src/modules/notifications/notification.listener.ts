import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '@prisma/client';
import { NotificationService } from './notification.service';
import { DomainEventEnvelope } from '../../events/domain-event.types';
import { DomainEventName } from '../../events/event-names';

/**
 * Turns selected domain events into in-app notifications broadcast to the
 * organization's members. Decoupled and best-effort: a failure here must never
 * roll back the originating operation.
 */
@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(private readonly notifications: NotificationService) {}

  @OnEvent(DomainEventName.ProposalCreated)
  async onApprovalRequired(envelope: DomainEventEnvelope): Promise<void> {
    await this.safeBroadcast(envelope, {
      title: 'Approval required',
      body: 'A transaction is awaiting your approval.',
      type: NotificationType.APPROVAL_REQUIRED,
    });
  }

  @OnEvent(DomainEventName.BudgetExceeded)
  async onBudgetExceeded(envelope: DomainEventEnvelope): Promise<void> {
    await this.safeBroadcast(envelope, {
      title: 'Budget limit reached',
      body: 'A transaction was blocked because it would exceed a budget limit.',
      type: NotificationType.BUDGET_EXCEEDED,
    });
  }

  @OnEvent(DomainEventName.PolicyViolated)
  async onPolicyViolated(envelope: DomainEventEnvelope): Promise<void> {
    await this.safeBroadcast(envelope, {
      title: 'Policy violation',
      body: 'A transaction was blocked by a policy.',
      type: NotificationType.POLICY_VIOLATION,
    });
  }

  @OnEvent(DomainEventName.TransactionFailed)
  async onTransactionFailed(envelope: DomainEventEnvelope): Promise<void> {
    await this.safeBroadcast(envelope, {
      title: 'Payment failed',
      body: 'A transaction failed to settle on the Stellar network.',
      type: NotificationType.PAYMENT_FAILED,
    });
  }

  @OnEvent(DomainEventName.RiskAlert)
  async onRiskAlert(envelope: DomainEventEnvelope): Promise<void> {
    await this.safeBroadcast(envelope, {
      title: 'Risk alert',
      body: 'A high-risk transaction was detected.',
      type: NotificationType.RISK_ALERT,
    });
  }

  private async safeBroadcast(
    envelope: DomainEventEnvelope,
    payload: { title: string; body: string; type: NotificationType },
  ): Promise<void> {
    if (!envelope?.organizationId) {
      return;
    }
    try {
      await this.notifications.broadcast(envelope.organizationId, {
        ...payload,
        metadata: { event: envelope.name, aggregateId: envelope.aggregateId },
      });
    } catch (error) {
      this.logger.error(
        `Failed to create notification for '${envelope.name}': ${(error as Error).message}`,
      );
    }
  }
}
