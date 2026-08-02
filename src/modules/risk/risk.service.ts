import { Injectable } from '@nestjs/common';
import { RiskEngine } from './risk.engine';
import { RiskAssessment, RiskFactorsInput } from './risk.types';
import { EventBusService } from '../../events/event-bus.service';
import { DomainEventName } from '../../events/event-names';

/**
 * Application-facing risk service. Wraps the pure {@link RiskEngine}, emits a
 * RiskEvaluated domain event, and is called by the transactions pipeline.
 */
@Injectable()
export class RiskService {
  constructor(
    private readonly engine: RiskEngine,
    private readonly eventBus: EventBusService,
  ) {}

  async evaluate(
    organizationId: string,
    input: RiskFactorsInput,
    context: { transactionId?: string; actorId?: string } = {},
  ): Promise<RiskAssessment> {
    const assessment = this.engine.assess(input);
    await this.eventBus.emit(
      DomainEventName.RiskEvaluated,
      {
        transactionId: context.transactionId,
        score: assessment.score,
        band: assessment.band,
      },
      {
        organizationId,
        actorId: context.actorId,
        aggregateType: 'transaction',
        aggregateId: context.transactionId,
      },
    );
    return assessment;
  }

  /** Synchronous assessment without event emission (used by simulate). */
  assess(input: RiskFactorsInput): RiskAssessment {
    return this.engine.assess(input);
  }
}
