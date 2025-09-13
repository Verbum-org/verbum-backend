export const configuration = () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  nodeEnv: process.env.NODE_ENV || 'development',

  mongodb: {
    uri: process.env.MONGODB_URI,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  moodle: {
    url: process.env.MOODLE_URL,
    token: process.env.MOODLE_TOKEN,
    wsUrl: process.env.MOODLE_WS_URL,
  },

  oauth: {
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    redirectUri: process.env.OAUTH_REDIRECT_URI,
  },

  lti: {
    consumerKey: process.env.LTI_CONSUMER_KEY,
    consumerSecret: process.env.LTI_CONSUMER_SECRET,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  },

  sentry: {
    dsn: process.env.SENTRY_DSN || undefined,
  },

  prometheus: {
    port: parseInt(process.env.PROMETHEUS_PORT, 10) || 9090,
  },

  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760, // 10MB
    path: process.env.UPLOAD_PATH || './uploads',
  },

  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  },

  webhooks: {
    secret: process.env.WEBHOOK_SECRET,
    moodleSecret: process.env.MOODLE_WEBHOOK_SECRET,
  },
});
