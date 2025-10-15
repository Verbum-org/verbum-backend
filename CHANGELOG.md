# Changelog

## [2.0.0] - 2025-10-15

### 🎉 Refatoração Completa - Sistema Unificado

#### ✅ Adicionado

- **Sistema de Planos Unificado:**
  - `PlansModule` com suporte a Trial, Basic, Premium, Enterprise
  - Guards para validação de planos: `PlanGuard`, `FeatureGuard`, `SubscriptionGuard`
  - Decorators: `@RequiresPlan()`, `@RequiresFeature()`
  - Limitador de trial: 7 dias, máx 20 usuários

- **Sistema de Permissões Centralizado:**
  - `PermissionsModule` com hierarquia de roles
  - `PermissionsGuard` e `RoleHierarchyGuard`
  - Decorators: `@RequiresRole()`, `@RequiresPermission()`
  - Hierarquia: Admin → Diretoria → Coordenador → Professor → Aluno

- **Autenticação Supabase:**
  - `AuthService` consolidado (registro, login, refresh, logout)
  - `AuthGuard` baseado em Supabase Auth
  - Endpoints: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/profile`, `/auth/invite`

- **Novos Módulos:**
  - `OrganizationsModule` - Gestão de organizações
  - `GuardsModule` - Guards reutilizáveis centralizados

- **Módulos Adaptados para Supabase:**
  - `UsersModule` - CRUD completo com Supabase
  - `CoursesModule` - Cursos e matrículas
  - `ProgressModule` - Tracking de progresso
  - `WebhooksModule` - Gestão de webhooks
  - `JobsModule` - BullMQ + histórico Supabase

- **Migrations Supabase:**
  - 14 migrations SQL criadas
  - Schemas completos para todas as entidades
  - RLS policies configuradas
  - Índices e constraints otimizados

- **Decorators Utilitários:**
  - `@CurrentUser()` - Extrai dados do usuário autenticado
  - `@Organization()` - Extrai dados da organização

- **Middlewares:**
  - `OrganizationMiddleware` - Injeta dados da organização no request
  - `SubscriptionMiddleware` - Valida expiração de trial

- **Documentação:**
  - `MIGRATION_GUIDE.md` - Guia completo de migração
  - `ARCHITECTURE.md` - Arquitetura detalhada do sistema
  - `CHANGELOG.md` - Histórico de mudanças

#### 🗑️ Removido

- **MongoDB Completo:**
  - `MongodbModule` e `MongodbService`
  - Todas as dependências Mongoose
  - Schemas: `User`, `Course`, `Enrollment`, `UserProgress`, `Job`, `WebhookEvent`

- **JWT Antigo:**
  - `@nestjs/jwt` (usando Supabase Auth)
  - `JwtStrategy` e `LocalStrategy`
  - `JwtAuthGuard`
  - `AuthSimpleService`
  - Dependências: `jsonwebtoken`, `passport-jwt`, `passport-local`

- **Trial Module:**
  - Todo o módulo `src/modules/trial/` removido
  - Controllers: `TrialAuthController`, `TrialContentController`, `TrialDashboardController`, `TrialFormsController`, `TrialNotificationsController`, `TrialReportsController`
  - Services: `TrialAuthService`, `TrialOrganizationsService`, `TrialPermissionsService`, etc.
  - Guards e decorators do trial (consolidados em `common/`)

- **SimpleModule:** Removido completamente

#### 🔄 Modificado

- **AppModule:**
  - Removido `MongodbModule`
  - Removido `TrialModule`
  - Adicionado `PlansModule`, `PermissionsModule`, `GuardsModule`, `OrganizationsModule`

- **AuthModule:**
  - Consolidado com lógica do `TrialAuthModule`
  - Usando apenas Supabase Auth
  - Removido `JwtModule` e `PassportModule`

- **Package.json:**
  - Removido: `@nestjs/mongoose`, `@nestjs/jwt`, `mongoose`, `jsonwebtoken`, `passport-jwt`, `passport-local`, `passport-oauth2`
  - Mantido: `@supabase/supabase-js`, `@nestjs/passport`, `passport-custom`

#### 🐛 Corrigido

- Duplicação de lógica de autenticação (JWT + Supabase)
- Redundância no sistema de trial (módulo separado)
- Fragmentação de banco de dados (MongoDB + Supabase)
- Inconsistências na hierarquia de permissões
- RLS policies recursivas no Supabase

#### 🔒 Segurança

- RLS policies aprimoradas em todas as tabelas
- Validação de hierarquia de roles
- Guards em múltiplas camadas
- Tokens gerenciados exclusivamente pelo Supabase

#### ⚡ Performance

- Redução de dependências (de ~77 para ~70)
- Eliminação de round-trips MongoDB
- Queries otimizadas com índices Supabase
- Jobs assíncronos com BullMQ

#### 📝 Breaking Changes

- **Autenticação:** JWT próprio → Supabase Auth
- **Database:** MongoDB → Supabase PostgreSQL
- **Guards:** `@UseGuards(JwtAuthGuard)` → `@UseGuards(AuthGuard, PermissionsGuard)`
- **User Context:** `@Req() req` → `@CurrentUser()` / `@Organization()`
- **Endpoints:** Mudanças em `/auth/*` (ver MIGRATION_GUIDE.md)

---

## [1.0.0] - 2024-XX-XX

### Inicial

- Sistema inicial com MongoDB + Supabase
- Autenticação dual (JWT + Supabase)
- Módulo Trial separado
- Integração Moodle via LTI e API
- BullMQ para jobs assíncronos
- Prometheus metrics
- Health checks
- Sentry monitoring

---

**Formato:** [Semantic Versioning](https://semver.org/)
**Categorias:** Added, Changed, Deprecated, Removed, Fixed, Security
