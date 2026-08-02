import { Injectable, Logger } from '@nestjs/common';
import { Queues } from '../queues/queues.constants';

export interface BalanceSyncJob {
  walletId: string;
  stellarAddress: string;
  network: 'testnet' | 'public';
}

/**
 * Polls Stellar for balance changes and confirmation updates outside the request
 * path. Runs rely on the Stellar integration module to read Horizon/Soroban; the
 * worker is responsible only for enqueueing the cadence and propagating results.
 */
@Injectable()
export class BalanceWorker {
  private readonly logger = new Logger(BalanceWorker.name);
  readonly queue = Queues.StellarSync;

  async process(job: { data: BalanceSyncJob }): Promise<void> {
    this.logger.log(`sync ${job.data.stellarAddress} on ${job.data.network}`);
  }
}
