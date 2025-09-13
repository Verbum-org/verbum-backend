import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryService {
  private readonly logger = new Logger(SentryService.name);

  constructor(private readonly configService: ConfigService) {
    this.initializeSentry();
  }

  private initializeSentry() {
    const dsn = this.configService.get('sentry.dsn');

    if (!dsn) {
      this.logger.warn('Sentry DSN not configured, skipping initialization');
      return;
    }

    try {
      Sentry.init({
        dsn,
        environment: this.configService.get('nodeEnv', 'development'),
        tracesSampleRate: this.configService.get('nodeEnv') === 'production' ? 0.1 : 1.0,
        profilesSampleRate: this.configService.get('nodeEnv') === 'production' ? 0.1 : 1.0,
        beforeSend(event) {
          // Filter out certain errors in development
          if (process.env.NODE_ENV === 'development') {
            // Don't send 404 errors in development
            if (event.exception?.values?.[0]?.type === 'NotFoundException') {
              return null;
            }
          }
          return event;
        },
      });

      this.logger.log('Sentry initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Sentry:', error);
    }
  }

  captureException(exception: any, context?: any) {
    try {
      Sentry.captureException(exception, context);
    } catch (error) {
      this.logger.error('Failed to capture exception in Sentry:', error);
    }
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: any) {
    try {
      Sentry.captureMessage(message, level);
    } catch (error) {
      this.logger.error('Failed to capture message in Sentry:', error);
    }
  }

  addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
    try {
      Sentry.addBreadcrumb(breadcrumb);
    } catch (error) {
      this.logger.error('Failed to add breadcrumb in Sentry:', error);
    }
  }

  setUser(user: Sentry.User) {
    try {
      Sentry.setUser(user);
    } catch (error) {
      this.logger.error('Failed to set user in Sentry:', error);
    }
  }

  setTag(key: string, value: string) {
    try {
      Sentry.setTag(key, value);
    } catch (error) {
      this.logger.error('Failed to set tag in Sentry:', error);
    }
  }

  setContext(key: string, context: any) {
    try {
      Sentry.setContext(key, context);
    } catch (error) {
      this.logger.error('Failed to set context in Sentry:', error);
    }
  }
}
