/**
 * Configuração da aplicação - Sistema Unificado v2.0
 * Supabase Only + Redis + BullMQ
 */
export const configuration = () => ({
  // Ambiente
  port: parseInt(process.env.PORT, 10) || 4000,
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  nodeEnv: process.env.NODE_ENV || 'development',

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    tls: process.env.REDIS_TLS === 'true',
  },

  // Moodle (Opcional)
  moodle: {
    url: process.env.MOODLE_URL || '',
    token: process.env.MOODLE_TOKEN || '',
    service: process.env.MOODLE_SERVICE || 'moodle_mobile_app',
  },

  // OAuth2 (Opcional)
  oauth: {
    clientId: process.env.OAUTH_CLIENT_ID || '',
    clientSecret: process.env.OAUTH_CLIENT_SECRET || '',
    redirectUri: process.env.OAUTH_REDIRECT_URI || '',
    authorizationUrl: process.env.OAUTH_AUTHORIZATION_URL || '',
    tokenUrl: process.env.OAUTH_TOKEN_URL || '',
  },

  // LTI (Opcional)
  lti: {
    consumerKey: process.env.LTI_CONSUMER_KEY || '',
    consumerSecret: process.env.LTI_CONSUMER_SECRET || '',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // Email (Opcional)
  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || '',
  },

  // Sentry (Opcional)
  sentry: {
    dsn: process.env.SENTRY_DSN || undefined,
    environment: process.env.SENTRY_ENVIRONMENT || 'development',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
  },

  // Prometheus
  prometheus: {
    port: parseInt(process.env.PROMETHEUS_PORT, 10) || 9090,
    enabled: process.env.PROMETHEUS_ENABLED !== 'false',
  },

  // OpenTelemetry
  otel: {
    enabled: process.env.OTEL_ENABLED === 'true',
    endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '',
  },

  // Logs
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || './logs',
  },

  // Rate Limiting
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 1000,
  },

  // Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760, // 10MB
    path: process.env.UPLOAD_PATH || './uploads',
  },

  // Webhooks
  webhooks: {
    secret: process.env.WEBHOOK_SECRET || '',
    moodleSecret: process.env.MOODLE_WEBHOOK_SECRET || '',
  },

  // Trial (configurações de trial)
  trial: {
    durationDays: parseInt(process.env.TRIAL_DURATION_DAYS, 10) || 7,
    maxUsers: parseInt(process.env.TRIAL_MAX_USERS, 10) || 20,
    expirationWarningHours: parseInt(process.env.TRIAL_EXPIRATION_WARNING_HOURS, 10) || 24,
  },
});
