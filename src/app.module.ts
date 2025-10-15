import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { HealthModule } from './common/health/health.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { RedisModule } from './common/redis/redis.module';
import { SentryModule } from './common/sentry/sentry.module';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { MoodleAdapterModule } from './modules/moodle-adapter/moodle-adapter.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProgressModule } from './modules/progress/progress.module';
import { UsersModule } from './modules/users/users.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { SupabaseModule } from './supabase/supabase.module';
import { PlansModule } from './common/plans/plans.module';
import { PermissionsModule } from './common/permissions/permissions.module';
import { GuardsModule } from './common/guards/guards.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get('THROTTLE_TTL', 60) * 1000,
            limit: configService.get('THROTTLE_LIMIT', 100),
          },
        ],
      }),
      inject: [ConfigService],
    }),

    // Redis and BullMQ
    RedisModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
        },
      }),
      inject: [ConfigService],
    }),

    // Event emitter
    EventEmitterModule.forRoot(),

    // Prometheus metrics
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'verbum_',
        },
      },
    }),

    // Health checks
    TerminusModule,
    HealthModule,

    // Sentry
    SentryModule,

    // Database
    SupabaseModule,

    // Global Common Modules (Plans, Permissions, Guards)
    PlansModule,
    PermissionsModule,
    GuardsModule,

    // Application modules
    AuthModule,
    UsersModule,
    OrganizationsModule,
    CoursesModule,
    MoodleAdapterModule,
    ProgressModule,
    WebhooksModule,
    JobsModule,
    MetricsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
