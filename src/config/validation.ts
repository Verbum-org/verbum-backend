import * as Joi from 'joi';

/**
 * Schema de validação para variáveis de ambiente
 * Sistema Unificado v2.0 - Supabase Only
 */
export const validationSchema = Joi.object({
  // Ambiente
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production', 'test')
    .default('development'),

  // API
  PORT: Joi.number().default(4000),
  API_PREFIX: Joi.string().default('api/v1'),

  // Supabase (Obrigatório)
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),

  // Redis (Obrigatório para BullMQ)
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().default(0),
  REDIS_TLS: Joi.boolean().default(false),

  // CORS (aceita múltiplas URIs separadas por vírgula)
  CORS_ORIGIN: Joi.string().default('http://localhost:3001'),
  CORS_CREDENTIALS: Joi.boolean().default(true),

  // Rate Limiting
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(1000),

  // Moodle (Opcional)
  MOODLE_URL: Joi.string().uri().allow('').optional(),
  MOODLE_TOKEN: Joi.string().allow('').optional(),
  MOODLE_SERVICE: Joi.string().default('moodle_mobile_app'),

  // OAuth2 (Opcional)
  OAUTH_CLIENT_ID: Joi.string().allow('').optional(),
  OAUTH_CLIENT_SECRET: Joi.string().allow('').optional(),
  OAUTH_REDIRECT_URI: Joi.string().uri().allow('').optional(),
  OAUTH_AUTHORIZATION_URL: Joi.string().uri().allow('').optional(),
  OAUTH_TOKEN_URL: Joi.string().uri().allow('').optional(),

  // LTI (Opcional)
  LTI_CONSUMER_KEY: Joi.string().allow('').optional(),
  LTI_CONSUMER_SECRET: Joi.string().allow('').optional(),

  // Email (Opcional)
  SMTP_HOST: Joi.string().allow('').optional(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().allow('').optional(),
  SMTP_PASS: Joi.string().allow('').optional(),
  EMAIL_FROM: Joi.string().allow('').optional(),

  // Sentry (Opcional)
  SENTRY_DSN: Joi.string().uri().allow('').optional(),
  SENTRY_ENVIRONMENT: Joi.string().allow('').optional(),
  SENTRY_TRACES_SAMPLE_RATE: Joi.number().min(0).max(1).default(0.1),

  // Prometheus (Opcional)
  PROMETHEUS_PORT: Joi.number().default(9090),
  PROMETHEUS_ENABLED: Joi.boolean().default(true),

  // OpenTelemetry (Opcional)
  OTEL_ENABLED: Joi.boolean().default(false),
  OTEL_EXPORTER_OTLP_ENDPOINT: Joi.string().uri().allow('').optional(),

  // Logs
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug', 'verbose').default('info'),
  LOG_DIR: Joi.string().default('./logs'),

  // Upload (Opcional)
  MAX_FILE_SIZE: Joi.number().default(10485760), // 10MB
  UPLOAD_PATH: Joi.string().default('./uploads'),

  // Webhooks (Opcional)
  WEBHOOK_SECRET: Joi.string().allow('').optional(),
  MOODLE_WEBHOOK_SECRET: Joi.string().allow('').optional(),
});
