import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api/v1'),

  MONGODB_URI: Joi.string().required(),

  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow(''),
  REDIS_DB: Joi.number().default(0),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  MOODLE_URL: Joi.string().uri().required(),
  MOODLE_TOKEN: Joi.string().required(),
  MOODLE_WS_URL: Joi.string().uri().required(),

  OAUTH_CLIENT_ID: Joi.string().required(),
  OAUTH_CLIENT_SECRET: Joi.string().required(),
  OAUTH_REDIRECT_URI: Joi.string().uri().required(),

  LTI_CONSUMER_KEY: Joi.string().required(),
  LTI_CONSUMER_SECRET: Joi.string().required(),

  CORS_ORIGIN: Joi.string().uri().default('http://localhost:3001'),

  SENTRY_DSN: Joi.string().allow('').optional(),

  PROMETHEUS_PORT: Joi.number().default(9090),

  SMTP_HOST: Joi.string().allow(''),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().allow(''),
  SMTP_PASS: Joi.string().allow(''),
  SMTP_FROM: Joi.string().email().allow(''),

  MAX_FILE_SIZE: Joi.number().default(10485760),
  UPLOAD_PATH: Joi.string().default('./uploads'),

  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),

  WEBHOOK_SECRET: Joi.string().allow(''),
  MOODLE_WEBHOOK_SECRET: Joi.string().allow(''),
});
