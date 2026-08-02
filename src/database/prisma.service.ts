import { INestApplication, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * The single Prisma client for the application. Manages connection lifecycle
 * and exposes graceful shutdown hooks. All repositories depend on this service.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Prisma connected to the database');
    } catch (error) {
      // Do not crash on boot when the DB is unavailable (e.g. typecheck/build,
      // or during local development before `docker compose up`). Log and go on.
      this.logger.warn(
        `Prisma could not connect on startup: ${(error as Error).message}. ` +
          'The API will retry lazily on first query.',
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /** Registers a Nest shutdown hook so the process closes the pool cleanly. */
  async enableShutdownHooks(app: INestApplication): Promise<void> {
    process.on('beforeExit', () => {
      void app.close();
    });
  }
}
