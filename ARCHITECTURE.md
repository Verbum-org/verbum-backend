# Arquitetura do Sistema - Verbum Backend v2.0

## 🏗️ Visão Geral

O Verbum Backend é uma API REST construída com **NestJS**, usando **Supabase** (PostgreSQL + Auth) como backend principal e **BullMQ/Redis** para processamento de jobs assíncronos.

---

## 📐 Arquitetura de Camadas

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT (Frontend)                   │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              API Gateway (NestJS)                    │
│  - Controllers (REST endpoints)                      │
│  - Guards (Auth, Permissions, Plans)                 │
│  - Middlewares (Organization, Subscription)          │
│  - Interceptors (Logging, Transform)                 │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│            Business Logic (Services)                 │
│  - AuthService                                       │
│  - UsersService                                      │
│  - OrganizationsService                              │
│  - CoursesService                                    │
│  - ProgressService                                   │
│  - PermissionsService                                │
│  - PlansService                                      │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              Data Layer (Supabase)                   │
│  - PostgreSQL (14 tabelas + RLS)                     │
│  - Supabase Auth (JWT tokens)                        │
│  - Storage (futuramente)                             │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│         Async Processing (BullMQ + Redis)            │
│  - Sync Processor (Moodle sync)                      │
│  - Webhook Processor                                 │
│  - Report Processor                                  │
└─────────────────────────────────────────────────────┘
```

---

## 🗂️ Estrutura de Diretórios

```
src/
├── common/                          # Módulos compartilhados
│   ├── decorators/                  # Custom decorators
│   │   ├── current-user.decorator.ts
│   │   ├── organization.decorator.ts
│   │   ├── requires-permission.decorator.ts
│   │   ├── requires-role.decorator.ts
│   │   ├── requires-plan.decorator.ts
│   │   └── requires-feature.decorator.ts
│   ├── guards/                      # Guards de acesso
│   │   ├── auth.guard.ts           # Supabase Auth
│   │   ├── permissions.guard.ts
│   │   ├── role-hierarchy.guard.ts
│   │   ├── plan.guard.ts
│   │   ├── feature.guard.ts
│   │   └── subscription.guard.ts
│   ├── middlewares/                 # Middlewares
│   │   ├── organization.middleware.ts
│   │   └── subscription.middleware.ts
│   ├── filters/                     # Exception filters
│   │   └── http-exception.filter.ts
│   ├── interceptors/                # Interceptors
│   │   ├── logging.interceptor.ts
│   │   └── transform.interceptor.ts
│   ├── plans/                       # Sistema de planos
│   │   ├── plan.types.ts
│   │   ├── plans.service.ts
│   │   └── plans.module.ts
│   ├── permissions/                 # Sistema de permissões
│   │   ├── permission.types.ts
│   │   ├── permissions.service.ts
│   │   └── permissions.module.ts
│   ├── health/                      # Health checks
│   ├── redis/                       # Redis config
│   └── sentry/                      # Sentry monitoring
│
├── config/                          # Configurações
│   ├── configuration.ts
│   └── validation.ts
│
├── modules/                         # Módulos de negócio
│   ├── auth/                        # Autenticação
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   └── strategies/
│   │       ├── lti.strategy.ts     # LTI (Moodle)
│   │       └── oauth2.strategy.ts  # OAuth2
│   │
│   ├── users/                       # Gerenciamento de usuários
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── dto/
│   │
│   ├── organizations/               # Organizações
│   │   ├── organizations.controller.ts
│   │   ├── organizations.service.ts
│   │   ├── organizations.module.ts
│   │   └── dto/
│   │
│   ├── courses/                     # Cursos e matrículas
│   │   ├── courses.controller.ts
│   │   ├── courses.service.ts
│   │   ├── courses.module.ts
│   │   └── dto/
│   │
│   ├── progress/                    # Progresso dos usuários
│   │   ├── progress.controller.ts
│   │   ├── progress.service.ts
│   │   ├── progress.module.ts
│   │   └── dto/
│   │
│   ├── webhooks/                    # Webhooks
│   │   ├── webhooks.controller.ts
│   │   ├── webhooks.service.ts
│   │   ├── webhooks.module.ts
│   │   └── dto/
│   │
│   ├── jobs/                        # Jobs assíncronos
│   │   ├── jobs.controller.ts
│   │   ├── jobs.service.ts
│   │   ├── jobs.module.ts
│   │   ├── dto/
│   │   └── processors/
│   │       ├── sync.processor.ts
│   │       ├── webhook.processor.ts
│   │       └── report.processor.ts
│   │
│   ├── moodle-adapter/              # Integração Moodle
│   │   ├── moodle-adapter.controller.ts
│   │   ├── moodle-adapter.service.ts
│   │   ├── moodle-adapter.module.ts
│   │   └── dto/
│   │
│   └── metrics/                     # Métricas/Observabilidade
│       ├── metrics.controller.ts
│       ├── metrics.service.ts
│       └── metrics.module.ts
│
├── supabase/                        # Supabase client
│   ├── supabase.module.ts
│   └── supabase.service.ts
│
├── app.module.ts                    # Root module
└── main.ts                          # Bootstrap
```

---

## 🔐 Sistema de Autenticação e Autorização

### Fluxo de Autenticação

```
1. Cliente envia credenciais → POST /auth/login
2. AuthService valida com Supabase Auth
3. Supabase retorna JWT token + user data
4. Backend busca dados adicionais (organization, role)
5. Retorna token + user profile completo
6. Cliente armazena token (localStorage/cookies)
7. Requests seguintes incluem: Authorization: Bearer <token>
8. AuthGuard valida token com Supabase
9. OrganizationMiddleware injeta dados da org no request
10. PermissionsGuard valida permissões
11. Controller executa lógica de negócio
```

### Camadas de Autorização

```
┌─────────────────────────────────────────────┐
│  1. AuthGuard                               │
│     ✓ Valida JWT token                      │
│     ✓ Extrai user_id do token               │
│     ✓ Busca dados do usuário no DB          │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  2. OrganizationMiddleware                  │
│     ✓ Injeta dados da organização           │
│     ✓ Injeta dados do plano                 │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  3. SubscriptionGuard (opcional)            │
│     ✓ Verifica se plano está ativo          │
│     ✓ Verifica limites (trial)              │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  4. PlanGuard (opcional)                    │
│     ✓ Verifica plano requerido              │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  5. FeatureGuard (opcional)                 │
│     ✓ Verifica acesso a feature/módulo      │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  6. PermissionsGuard                        │
│     ✓ Valida permissões granulares          │
│     ✓ Valida roles (@RequiresRole)          │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  7. RoleHierarchyGuard (opcional)           │
│     ✓ Valida hierarquia para ações          │
│     ✓ Ex: coordenador não pode editar admin │
└─────────────────────────────────────────────┘
```

---

## 🎭 Sistema de Planos e Features

### Planos Disponíveis

```typescript
enum PlanType {
  TRIAL = 'trial', // 7 dias, max 20 users
  BASIC = 'basic', // Sem limites quantitativos
  PREMIUM = 'premium', // Sem limites quantitativos
  ENTERPRISE = 'enterprise', // Sem limites quantitativos
}
```

### Features/Módulos

```typescript
enum Feature {
  COURSES = 'courses',
  PROGRESS = 'progress',
  WEBHOOKS = 'webhooks',
  MOODLE = 'moodle',
  REPORTS = 'reports',
  ANALYTICS = 'analytics',
  NOTIFICATIONS = 'notifications',
}
```

### Controle de Acesso por Plano

**Configuração atual:** Todos os planos têm acesso a todos os módulos

**Futuro (customizável):**

```typescript
{
  trial: [COURSES, PROGRESS],
  basic: [COURSES, PROGRESS, WEBHOOKS],
  premium: [COURSES, PROGRESS, WEBHOOKS, REPORTS, ANALYTICS],
  enterprise: [ALL]
}
```

---

## 👥 Sistema de Roles e Hierarquia

### Roles Educacionais

```
ADMIN (god mode)
  └─ DIRETORIA (gestão geral)
      └─ COORDENADOR (gestão pedagógica)
          └─ PROFESSOR (gestão de turmas)
              └─ ALUNO (acesso limitado)
```

### Permissões por Role

| Role        | Pode Criar | Pode Editar | Pode Deletar | Pode Ver |
| ----------- | ---------- | ----------- | ------------ | -------- |
| ADMIN       | Tudo       | Tudo        | Tudo         | Tudo     |
| DIRETORIA   | Org, Users | Org, Users  | Users        | Tudo     |
| COORDENADOR | Courses    | Courses     | -            | Tudo     |
| PROFESSOR   | Content    | Own Content | -            | Assigned |
| ALUNO       | -          | Own Profile | -            | Enrolled |

### Validação de Hierarquia

```typescript
// Exemplo: Usuário só pode criar/editar usuários de role inferior
// Coordenador pode criar Professor/Aluno
// Coordenador NÃO pode criar Admin/Diretoria

@Post('invite')
@RequiresRole(UserRole.ADMIN, UserRole.DIRETORIA, UserRole.COORDENADOR)
async invite(@CurrentUser('role') inviterRole, @Body() dto) {
  // RoleHierarchyGuard valida automaticamente
}
```

---

## 🗄️ Modelo de Dados (Supabase)

### Principais Entidades

```
trial_accounts (1) ──┬─→ organizations (N)
                     │
                     └─→ users (N)

organizations (1) ──┬─→ users (N)
                    │
                    ├─→ courses (N)
                    │
                    ├─→ enrollments (N)
                    │
                    ├─→ user_progress (N)
                    │
                    ├─→ webhook_events (N)
                    │
                    └─→ jobs (N)

courses (1) ───→ enrollments (N)
users (1) ───→ enrollments (N)
users (1) ───→ user_progress (N)
courses (1) ───→ user_progress (N)
```

### RLS (Row Level Security)

Todas as tabelas possuem políticas RLS:

```sql
-- Exemplo: users table
CREATE POLICY "Users can view users in their org"
  ON users FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'diretoria')
      AND organization_id = users.organization_id
    )
  );
```

---

## 🔄 Fluxo de Jobs Assíncronos (BullMQ)

```
1. Controller recebe request
2. JobsService adiciona job na fila
3. BullMQ armazena job no Redis
4. Processor pega job da fila
5. Processor executa lógica (sync, webhook, report)
6. Processor atualiza status no Supabase
7. (Opcional) Processor emite evento
8. Controller retorna job_id ao cliente
9. Cliente pode consultar status via GET /jobs/:id
```

### Filas Disponíveis

- `sync` - Sincronização Moodle
- `webhook` - Processamento de webhooks
- `report` - Geração de relatórios

---

## 📊 Observabilidade

### Logs

- Winston (estruturados, JSON)
- Níveis: error, warn, info, debug
- Destinos: Console, arquivos, Sentry

### Métricas (Prometheus)

- HTTP requests (latência, status)
- Jobs (enqueued, completed, failed)
- Database queries (timing)
- Custom business metrics

### Tracing (OpenTelemetry)

- Distributed tracing
- Spans por request
- Exportação para Jaeger/Zipkin

### Error Tracking (Sentry)

- Captura automática de exceções
- Stack traces
- User context
- Breadcrumbs

---

## 🚀 Escalabilidade

### Horizontal Scaling

- Múltiplas instâncias da API (stateless)
- Load balancer (Nginx, ALB)
- Sessões em Redis (não em memória)

### Async Processing

- Jobs pesados em filas (BullMQ)
- Processadores dedicados
- Rate limiting por job type

### Database

- Supabase auto-scaling
- Connection pooling (pgBouncer)
- Read replicas (futuro)

### Caching

- Redis para sessions
- Redis para rate limiting
- Query caching (futuro)

---

## 🔒 Segurança

### Autenticação

- JWT tokens (Supabase Auth)
- Token expiration (1h)
- Refresh tokens (30d)
- Secure cookies (HttpOnly, SameSite)

### Autorização

- RLS no banco de dados
- Guards em múltiplas camadas
- Validação de hierarquia de roles

### API Security

- Rate limiting (Throttler)
- CORS configurado
- Helmet (security headers)
- Input validation (class-validator)
- SQL injection prevention (ORM)

### Secrets Management

- Variáveis de ambiente
- Supabase Vault (futuro)
- Rotação de secrets

---

## 📈 Performance

### Response Times (target)

- GET endpoints: < 100ms
- POST/PUT endpoints: < 200ms
- Async jobs: background

### Database

- Indexes em foreign keys
- Indexes em campos de busca
- Query optimization

### Caching Strategy

- Redis para dados frequentes
- TTL configurável
- Cache invalidation

---

## 🧪 Testes

### Unitários

- Services (mocking Supabase)
- Guards (mocking requests)
- Utilities

### Integração

- Controllers + Services
- Database queries (test DB)
- Auth flow

### E2E

- Fluxos completos
- Multi-tenant scenarios
- Permission scenarios

---

## 📦 Deploy

### Ambientes

- **Development:** Local + Docker
- **Staging:** Cloud + Supabase staging
- **Production:** Cloud + Supabase prod

### CI/CD Pipeline

```
1. Git push → main/develop
2. GitHub Actions trigger
3. Run linting (ESLint)
4. Run tests (Jest)
5. Build Docker image
6. Push to registry
7. Deploy to environment
8. Run health checks
9. Notify team
```

### Health Checks

- `/health` - Liveness probe
- `/health/readiness` - Readiness probe
- Database connectivity
- Redis connectivity

---

## 🎯 Roadmap Técnico

### Curto Prazo (Q4 2024)

- [ ] Implementar testes E2E completos
- [ ] Configurar CI/CD
- [ ] Adicionar cache com Redis
- [ ] Melhorar observabilidade

### Médio Prazo (Q1 2025)

- [ ] Implementar módulos faltantes (Dashboard, Reports, Notifications)
- [ ] Billing/Pagamentos
- [ ] White-label por organização
- [ ] API versioning

### Longo Prazo (2025)

- [ ] GraphQL API (complementar REST)
- [ ] WebSockets (real-time)
- [ ] Multi-region deployment
- [ ] LGPD/GDPR compliance tooling

---

**Última atualização:** Outubro 2025
**Versão:** 2.0.0
