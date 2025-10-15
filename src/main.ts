import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { loadEnvFile } from './config/env.loader';

// Carregar variáveis de ambiente apenas em desenvolvimento
// Em produção (Render), as variáveis são injetadas diretamente
if (process.env.NODE_ENV !== 'production') {
  loadEnvFile();
}

async function bootstrap() {
  // Initialize Sentry
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  // Em produção, usar process.env.PORT diretamente se disponível
  const port = process.env.NODE_ENV === 'production'
    ? parseInt(process.env.PORT || '10000', 10)
    : configService.get('PORT', 4000);
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  const corsOriginEnv = configService.get('CORS_ORIGIN', 'http://localhost:3000');

  // Processar CORS_ORIGIN para aceitar múltiplas origens separadas por vírgula
  const corsOrigin = corsOriginEnv.includes(',')
    ? corsOriginEnv.split(',').map((origin) => origin.trim())
    : corsOriginEnv;

  // Security middleware
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());

  // CORS
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters and interceptors are registered in app.module.ts via APP_FILTER and APP_INTERCEPTOR
  // No need to register them here to avoid duplicate execution

  // Swagger documentation (antes do global prefix para não ter conflito)
  if (process.env.NODE_ENV !== 'production' || process.env.SHOW_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Verbum Backend API')
      .setDescription('API Gateway para integração com Moodle')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Autenticação e autorização')
      .addTag('users', 'Gerenciamento de usuários')
      .addTag('courses', 'Gerenciamento de cursos')
      .addTag('moodle', 'Integração com Moodle')
      .addTag('progress', 'Progresso e relatórios')
      .addTag('webhooks', 'Webhooks e eventos')
      .addTag('jobs', 'Jobs e processamento assíncrono')
      .addTag('metrics', 'Métricas e monitoramento')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // API prefix
  app.setGlobalPrefix(apiPrefix);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    Logger.log('SIGTERM received, shutting down gracefully');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    Logger.log('SIGINT received, shutting down gracefully');
    await app.close();
    process.exit(0);
  });

  await app.listen(port);

  const isProduction = process.env.NODE_ENV === 'production';
  const host = isProduction ? '0.0.0.0' : 'localhost';

  Logger.log(`🚀 Application is running on: http://${host}:${port}/${apiPrefix}`);
  Logger.log(`📚 Swagger documentation: http://${host}:${port}/api/docs`);

  if (isProduction) {
    Logger.log(`🌐 Production URL: https://verbum-backend.onrender.com/${apiPrefix}`);
    Logger.log(`📚 Production Docs: https://verbum-backend.onrender.com/api/docs`);
  }
}

bootstrap().catch((error) => {
  Logger.error('Error starting application', error);
  process.exit(1);
});
