# Verbum Backend

Backend para integração com Moodle - API Gateway e serviços

## 🏗️ Arquitetura

```
[React + TS + Tailwind]  <-- HTTPS -->  [API Gateway / Backend (NestJS)]
                                          ├─ Auth Module (JWT, OAuth2/LTI adapter)
                                          ├─ Moodle Adapter (consumes Moodle REST)
                                          ├─ Users Module (cópia/local users)
                                          ├─ Courses Module (proxy / modelagem)
                                          ├─ Progress Module (sincronização/relatórios)
                                          ├─ Webhooks Module (recebe eventos LTI / Moodle webhooks)
                                          ├─ Jobs Module (BullMQ + Redis) - sincronizações e relatórios
                                          ├─ Observability (Prometheus metrics, OpenTelemetry)
                                          ├─ Monitoring + Error Tracking (Sentry)
                                          └─ Prisma (Postgres) + Redis (cache/queue)
```

## 🚀 Tecnologias

- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma ORM
- **Cache/Queue**: Redis + BullMQ
- **Authentication**: JWT + OAuth2 + LTI
- **Monitoring**: Prometheus + Grafana
- **Error Tracking**: Sentry
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

## 📋 Pré-requisitos

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/your-username/verbum-backend.git
cd verbum-backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/verbum_db?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRES_IN=7d

# Moodle API
MOODLE_URL=https://your-moodle-instance.com
MOODLE_TOKEN=your-moodle-api-token
MOODLE_WS_URL=https://your-moodle-instance.com/webservice/rest/server.php

# OAuth2 / LTI
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_CLIENT_SECRET=your-oauth-client-secret
OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
LTI_CONSUMER_KEY=your-lti-consumer-key
LTI_CONSUMER_SECRET=your-lti-consumer-secret

# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1
CORS_ORIGIN=http://localhost:3001

# Monitoring
SENTRY_DSN=your-sentry-dsn-here
PROMETHEUS_PORT=9090
```

### 4. Execute as migrações do banco

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Execute o seed do banco

```bash
npm run prisma:seed
```

## 🐳 Docker

### Desenvolvimento

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Produção

```bash
docker-compose up -d
```

## 🚀 Executando

### Desenvolvimento

```bash
npm run start:dev
```

### Produção

```bash
npm run build
npm run start:prod
```

## 📚 API Documentation

Acesse a documentação da API em: `http://localhost:3000/api/docs`

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📊 Monitoramento

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
- **Health Check**: http://localhost:3000/health

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev          # Inicia em modo desenvolvimento
npm run start:debug        # Inicia em modo debug

# Build
npm run build              # Compila o projeto
npm run start:prod         # Inicia em modo produção

# Testes
npm run test               # Executa testes unitários
npm run test:watch         # Executa testes em modo watch
npm run test:cov           # Executa testes com coverage
npm run test:e2e           # Executa testes e2e

# Linting
npm run lint               # Executa o linter
npm run format             # Formata o código

# Database
npm run prisma:generate    # Gera o cliente Prisma
npm run prisma:push        # Aplica mudanças no schema
npm run prisma:migrate     # Executa migrações
npm run prisma:studio      # Abre o Prisma Studio
npm run prisma:seed        # Executa o seed do banco
```

## 📁 Estrutura do Projeto

```
src/
├── common/                 # Utilitários comuns
│   ├── decorators/        # Decorators customizados
│   ├── filters/           # Filtros de exceção
│   ├── guards/            # Guards de autenticação
│   ├── interceptors/      # Interceptors
│   ├── pipes/             # Pipes de validação
│   ├── redis/             # Serviço Redis
│   ├── health/            # Health checks
│   └── sentry/            # Configuração Sentry
├── config/                # Configurações
├── modules/               # Módulos da aplicação
│   ├── auth/              # Autenticação
│   ├── users/             # Usuários
│   ├── courses/           # Cursos
│   ├── moodle-adapter/    # Adaptador Moodle
│   ├── progress/          # Progresso
│   ├── webhooks/          # Webhooks
│   ├── jobs/              # Jobs assíncronos
│   └── metrics/           # Métricas
├── prisma/                # Schema e migrações Prisma
└── main.ts                # Arquivo principal
```

## 🔐 Autenticação

O sistema suporta múltiplos métodos de autenticação:

- **JWT**: Para autenticação baseada em token
- **OAuth2**: Para integração com provedores externos
- **LTI**: Para integração com sistemas LMS

## 🔄 Integração com Moodle

O sistema se integra com o Moodle através de:

- **REST API**: Para sincronização de dados
- **Webhooks**: Para eventos em tempo real
- **LTI**: Para autenticação e lançamento de recursos

## 📈 Monitoramento

- **Métricas**: Prometheus + Grafana
- **Logs**: Winston
- **Error Tracking**: Sentry
- **Health Checks**: Endpoints de saúde

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através de:

- Email: suporte@verbum.com
- Issues: [GitHub Issues](https://github.com/your-username/verbum-backend/issues)

## 🗺️ Roadmap

- [ ] Implementação completa dos webhooks
- [ ] Dashboard de métricas avançado
- [ ] Suporte a múltiplos provedores OAuth2
- [ ] Cache inteligente com Redis
- [ ] Documentação da API em OpenAPI 3.0
- [ ] Testes de carga e performance
- [ ] Suporte a múltiplos idiomas
- [ ] Integração com outros LMS além do Moodle
