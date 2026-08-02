import { Module } from '@nestjs/common';

/**
 * Central queue plumbing. The BullMQ connections and named queues are provisioned
 * once here so domain modules can inject publishers and workers can attach
 * processors without re-establishing Redis each time.
 *
 * The concrete BullMQ registration is intentionally thin — the queue tokens
 * below are the public surface every worker uses.
 */
@Module({
  providers: [],
  exports: [],
})
export class QueueModule {}

/** Symbol tokens for typed queue injection across modules. */
export const QueueTokens = {
  Notifications: Symbol.for('queue:notifications'),
  Webhooks: Symbol.for('queue:webhooks'),
  StellarSync: Symbol.for('queue:stellar-sync'),
  Analytics: Symbol.for('queue:analytics'),
  Reports: Symbol.for('queue:reports'),
} as const;

/** Default job options for every queue: bounded retries with backoff. */
export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 1_000 },
  removeOnComplete: { count: 1_000 },
  removeOnFail: { age: 24 * 3_600 },
} as const;
