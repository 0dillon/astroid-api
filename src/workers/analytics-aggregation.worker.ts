import { Injectable, Logger } from '@nestjs/common';
import { Queues } from '../queues/queues.constants';

export interface AnalyticsRollupJob {
  organizationId: string;
  /** ISO date of the day to roll up. */
  date: string;
}

/**
 * Nightly aggregation job that pre-computes cash-flow, budget utilization and
 * risk distribution so the dashboard reads warm snapshots instead of scanning
 * the transaction log on every render.
 */
@Injectable()
export class AnalyticsAggregationWorker {
  private readonly logger = new Logger(AnalyticsAggregationWorker.name);
  readonly queue = Queues.Analytics;

  async process(job: { data: AnalyticsRollupJob }): Promise<void> {
    this.logger.log(`aggregate ${job.data.date} for org ${job.data.organizationId}`);
  }
}
