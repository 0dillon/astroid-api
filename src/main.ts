import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { PrismaService } from './database/prisma.service';
import { AppConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const appConfig = config.getOrThrow<AppConfig>('app');

  // Structured logging (nestjs-pino)
  app.useLogger(app.get(PinoLogger));

  // CORS
  app.enableCors({ origin: appConfig.corsOrigins, credentials: true });

  // Global validation pipe (transforms + validates DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // API prefix (e.g. api/v1). Versioning is expressed via this stable prefix
  // rather than Nest URI versioning to avoid a duplicated version segment.
  app.setGlobalPrefix(appConfig.apiPrefix);

  // OpenAPI / Swagger documentation
  if (appConfig.nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Astroid API')
      .setDescription(
        'The intelligence layer for the Financial Operating System for autonomous AI agents on Stellar.',
      )
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
      .addApiKey({ type: 'apiKey', in: 'header', name: 'x-api-key' }, 'api-key')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  // Prisma shutdown hook
  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);

  await app.listen(appConfig.port);
  console.log(`🚀 Astroid API listening on port ${appConfig.port}`);
  console.log(`📚 Swagger docs: http://localhost:${appConfig.port}/docs`);
}

bootstrap().catch((error) => {
  console.error('Failed to bootstrap:', error);
  process.exit(1);
});
