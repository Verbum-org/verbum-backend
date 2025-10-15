#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const environments = {
  local: {
    file: '.env.local',
    template: `# ===========================================
# VERBUM BACKEND - AMBIENTE LOCAL
# ===========================================

# Node
NODE_ENV=development
PORT=4000
API_PREFIX=api/v1

# ===========================================
# SUPABASE (LOCAL/DEV)
# ===========================================
SUPABASE_URL=https://your-project-dev.supabase.co
SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-key

# ===========================================
# REDIS (LOCAL)
# ===========================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=false

# ===========================================
# CORS (LOCAL)
# ===========================================
CORS_ORIGIN=http://localhost:3001,http://localhost:5173
CORS_CREDENTIALS=true

# ===========================================
# RATE LIMITING
# ===========================================
THROTTLE_TTL=60
THROTTLE_LIMIT=1000

# ===========================================
# SENTRY (OPCIONAL - DEV)
# ===========================================
SENTRY_DSN=
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1

# ===========================================
# MOODLE (LOCAL)
# ===========================================
MOODLE_URL=http://localhost:8080
MOODLE_TOKEN=
MOODLE_SERVICE=moodle_mobile_app

# ===========================================
# EMAIL (MAILTRAP OU LOCAL)
# ===========================================
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=dev@verbum.local

# ===========================================
# LOGGING
# ===========================================
LOG_LEVEL=debug
LOG_DIR=./logs

# ===========================================
# PROMETHEUS
# ===========================================
PROMETHEUS_PORT=9090
PROMETHEUS_ENABLED=true

# ===========================================
# OBSERVABILITY
# ===========================================
OTEL_ENABLED=false
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
`,
  },
  homolog: {
    file: '.env.homolog',
    template: `# ===========================================
# VERBUM BACKEND - AMBIENTE HOMOLOGAÇÃO
# ===========================================

# Node
NODE_ENV=staging
PORT=4000
API_PREFIX=api/v1

# ===========================================
# SUPABASE (HOMOLOGAÇÃO)
# ===========================================
SUPABASE_URL=https://your-project-staging.supabase.co
SUPABASE_ANON_KEY=your-staging-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-staging-service-key

# ===========================================
# REDIS (HOMOLOGAÇÃO - Cloud)
# ===========================================
REDIS_HOST=redis-staging.your-cloud.com
REDIS_PORT=6380
REDIS_PASSWORD=your-redis-password
REDIS_TLS=true

# ===========================================
# CORS (HOMOLOGAÇÃO)
# ===========================================
CORS_ORIGIN=https://app-staging.verbum.com,https://admin-staging.verbum.com
CORS_CREDENTIALS=true

# ===========================================
# RATE LIMITING
# ===========================================
THROTTLE_TTL=60
THROTTLE_LIMIT=500

# ===========================================
# SENTRY (HOMOLOGAÇÃO)
# ===========================================
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
SENTRY_ENVIRONMENT=staging
SENTRY_TRACES_SAMPLE_RATE=0.3

# ===========================================
# MOODLE (HOMOLOGAÇÃO)
# ===========================================
MOODLE_URL=https://moodle-staging.your-domain.com
MOODLE_TOKEN=your-staging-token
MOODLE_SERVICE=moodle_mobile_app

# ===========================================
# EMAIL (SENDGRID/SES)
# ===========================================
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply-staging@verbum.com

# ===========================================
# LOGGING
# ===========================================
LOG_LEVEL=info
LOG_DIR=./logs

# ===========================================
# PROMETHEUS
# ===========================================
PROMETHEUS_PORT=9090
PROMETHEUS_ENABLED=true

# ===========================================
# OBSERVABILITY
# ===========================================
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://otel-collector-staging.your-cloud.com:4318
`,
  },
  prod: {
    file: '.env.prod',
    template: `# ===========================================
# VERBUM BACKEND - AMBIENTE PRODUÇÃO
# ===========================================

# Node
NODE_ENV=production
PORT=4000
API_PREFIX=api/v1

# ===========================================
# SUPABASE (PRODUÇÃO)
# ===========================================
SUPABASE_URL=https://your-project-prod.supabase.co
SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-key

# ===========================================
# REDIS (PRODUÇÃO - Cloud HA)
# ===========================================
REDIS_HOST=redis-prod.your-cloud.com
REDIS_PORT=6380
REDIS_PASSWORD=your-secure-redis-password
REDIS_TLS=true

# ===========================================
# CORS (PRODUÇÃO)
# ===========================================
CORS_ORIGIN=https://app.verbum.com,https://admin.verbum.com
CORS_CREDENTIALS=true

# ===========================================
# RATE LIMITING
# ===========================================
THROTTLE_TTL=60
THROTTLE_LIMIT=300

# ===========================================
# SENTRY (PRODUÇÃO)
# ===========================================
SENTRY_DSN=https://your-production-sentry-dsn@sentry.io/project
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1

# ===========================================
# MOODLE (PRODUÇÃO)
# ===========================================
MOODLE_URL=https://moodle.your-domain.com
MOODLE_TOKEN=your-production-token
MOODLE_SERVICE=moodle_mobile_app

# ===========================================
# EMAIL (SENDGRID/SES)
# ===========================================
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=apikey
SMTP_PASS=your-production-sendgrid-api-key
EMAIL_FROM=noreply@verbum.com

# ===========================================
# LOGGING
# ===========================================
LOG_LEVEL=warn
LOG_DIR=/var/log/verbum

# ===========================================
# PROMETHEUS
# ===========================================
PROMETHEUS_PORT=9090
PROMETHEUS_ENABLED=true

# ===========================================
# OBSERVABILITY
# ===========================================
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://otel-collector-prod.your-cloud.com:4318
`,
  },
};

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log('🔧 Verbum Backend - Setup de Ambientes\n');

  const env = await question(
    'Qual ambiente deseja configurar? (local/homolog/prod/all): ',
  );

  if (env === 'all') {
    for (const [key, config] of Object.entries(environments)) {
      createEnvFile(key, config);
    }
    console.log('\n✅ Todos os ambientes foram criados!');
  } else if (environments[env]) {
    createEnvFile(env, environments[env]);
    console.log(`\n✅ Arquivo ${environments[env].file} criado com sucesso!`);
  } else {
    console.log('\n❌ Ambiente inválido. Use: local, homolog, prod ou all');
  }

  console.log('\n📝 Próximos passos:');
  console.log('1. Edite os arquivos .env.* com suas credenciais');
  console.log('2. Execute: npm run start:local (ou start:homolog/start:prod)');
  console.log('3. NUNCA commite arquivos .env reais no Git!\n');

  rl.close();
}

function createEnvFile(envName, config) {
  const filePath = path.join(process.cwd(), config.file);

  if (fs.existsSync(filePath)) {
    console.log(`⚠️  ${config.file} já existe, pulando...`);
    return;
  }

  fs.writeFileSync(filePath, config.template);
  console.log(`✅ ${config.file} criado`);
}

main().catch((error) => {
  console.error('❌ Erro:', error);
  process.exit(1);
});

