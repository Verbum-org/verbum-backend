# Guia de Migração - Sistema de Planos Unificado

## 📋 Resumo da Refatoração

O sistema foi refatorado de um modelo redundante com módulo `trial` separado para uma arquitetura unificada baseada em planos, usando **Supabase Auth** e **Supabase PostgreSQL** exclusivamente.

---

## 🎯 Mudanças Principais

### 1. **Autenticação Unificada**

- ✅ **Antes:** Dual auth (JWT + Supabase)
- ✅ **Agora:** Apenas Supabase Auth
- ✅ Removido: `JwtStrategy`, `LocalStrategy`, `JwtAuthGuard`
- ✅ Novo: `AuthGuard` (Supabase-based)

### 2. **Banco de Dados**

- ✅ **Antes:** MongoDB (Mongoose) + Supabase
- ✅ **Agora:** Apenas Supabase (PostgreSQL)
- ✅ Removido: `MongodbModule`, todos os schemas Mongoose
- ✅ 14 tabelas migradas para Supabase com RLS policies

### 3. **Sistema de Planos**

- ✅ **Planos Disponíveis:**
  - `trial`: 7 dias, máx 20 usuários, todas features
  - `basic`: Sem limites quantitativos
  - `premium`: Sem limites quantitativos
  - `enterprise`: Sem limites quantitativos

- ✅ **Controle de Acesso:**
  - Por plano (organização)
  - Por role (admin, diretoria, coordenador, professor, aluno)
  - Por feature/módulo
  - Por permissão granular

### 4. **Hierarquia de Roles**

```
ADMIN
  └─ DIRETORIA
      └─ COORDENADOR
          └─ PROFESSOR
              └─ ALUNO
```

### 5. **Módulos Refatorados**

#### Novos Módulos:

- `PlansModule` - Gerenciamento de planos
- `PermissionsModule` - Gerenciamento de permissões
- `GuardsModule` - Guards reutilizáveis
- `OrganizationsModule` - Gestão de organizações

#### Adaptados para Supabase:

- `AuthModule` - Login, registro, convite
- `UsersModule` - CRUD de usuários
- `CoursesModule` - Cursos e matrículas
- `ProgressModule` - Progresso e activity logs
- `WebhooksModule` - Webhooks events
- `JobsModule` - BullMQ + histórico Supabase

#### Mantidos (já compatíveis):

- `MoodleAdapterModule`
- `MetricsModule`

---

## 🔧 Variáveis de Ambiente Necessárias

### Supabase (Obrigatório)

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Redis (Obrigatório para BullMQ)

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Outras

```bash
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000
```

---

## 🚀 Como Executar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Aplicar Migrações Supabase

Execute as migrations na ordem em `supabase/migrations/`:

```bash
001_trial_schema.sql
002_fix_rls_insert.sql
003_new_architecture.sql
004_dashboard_reports_notifications.sql
005_fix_rls_recursion.sql
006_fix_all_rls_policies.sql
007_force_remove_all_old_policies.sql
008_fix_rls_existing_tables_only.sql
009_force_clean_and_recreate_rls.sql
010_courses_schema.sql
011_progress_schema.sql
012_webhooks_schema.sql
013_jobs_schema.sql
014_moodle_integration_schema.sql
```

### 3. Iniciar Servidor

```bash
npm run start:dev
```

---

## 📚 Endpoints Principais

### Autenticação

- `POST /auth/register` - Criar nova organização (trial)
- `POST /auth/login` - Login de usuário
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `GET /auth/profile` - Perfil do usuário
- `POST /auth/invite` - Convidar novo usuário

### Organizações

- `GET /organizations/me` - Dados da organização
- `GET /organizations/me/stats` - Estatísticas
- `PUT /organizations/me` - Atualizar organização

### Usuários

- `GET /users` - Listar usuários
- `GET /users/:id` - Buscar usuário
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Desativar usuário

### Cursos

- `POST /courses` - Criar curso
- `GET /courses` - Listar cursos
- `GET /courses/my-courses` - Meus cursos
- `GET /courses/:id` - Buscar curso
- `PUT /courses/:id` - Atualizar curso
- `POST /courses/enroll` - Matricular usuário
- `GET /courses/:id/enrollments` - Listar matrículas

### Progresso

- `GET /progress/stats` - Estatísticas do usuário
- `GET /progress/course/:id` - Progresso por curso
- `PUT /progress/:id` - Atualizar progresso
- `POST /progress/activity` - Registrar atividade

---

## 🔒 Guards e Decorators

### Guards Disponíveis:

1. `AuthGuard` - Valida autenticação Supabase
2. `PermissionsGuard` - Valida permissões granulares
3. `RoleHierarchyGuard` - Valida hierarquia de roles
4. `PlanGuard` - Valida plano da organização
5. `FeatureGuard` - Valida acesso a features
6. `SubscriptionGuard` - Valida expiração/limites

### Decorators Disponíveis:

1. `@CurrentUser()` - Extrai dados do usuário
2. `@Organization()` - Extrai dados da organização
3. `@RequiresRole(...roles)` - Requer roles específicos
4. `@RequiresPermission(...permissions)` - Requer permissões
5. `@RequiresPlan(...plans)` - Requer plano específico
6. `@RequiresFeature(...features)` - Requer feature/módulo

### Exemplo de Uso:

```typescript
@Controller('courses')
@UseGuards(AuthGuard, PermissionsGuard)
export class CoursesController {
  @Post()
  @RequiresRole(UserRole.ADMIN, UserRole.COORDENADOR)
  @RequiresFeature(Feature.COURSES)
  async create(
    @Organization('id') orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCourseDto,
  ) {
    return this.service.create(orgId, dto);
  }
}
```

---

## 🗑️ O Que Foi Removido

### Arquivos Deletados:

- `src/modules/trial/*` (todo o módulo)
- `src/schemas/*` (todos os schemas Mongoose)
- `src/mongodb/*` (módulo MongoDB)
- `src/modules/simple/*`
- `src/modules/auth/auth-simple.service.ts`
- `src/modules/auth/strategies/jwt.strategy.ts`
- `src/modules/auth/strategies/local.strategy.ts`
- `src/common/guards/jwt-auth.guard.ts`

### Dependências Removidas:

- `@nestjs/mongoose`
- `@nestjs/jwt`
- `mongoose`
- `jsonwebtoken`
- `passport-jwt`
- `passport-local`
- `passport-oauth2`

---

## ⚠️ Breaking Changes

### 1. Autenticação

**Antes:**

```typescript
@UseGuards(JwtAuthGuard)
```

**Agora:**

```typescript
@UseGuards(AuthGuard, PermissionsGuard)
```

### 2. User Data

**Antes:**

```typescript
@Req() req: Request
const userId = req.user.id;
```

**Agora:**

```typescript
@CurrentUser('dbId') userId: string
@Organization('id') orgId: string
```

### 3. Permissions

**Antes:** Lógica manual de permissões

**Agora:**

```typescript
@RequiresRole(UserRole.ADMIN)
@RequiresPermission('courses:write')
@RequiresFeature(Feature.COURSES)
```

---

## 📊 Estrutura de Dados Supabase

### Principais Tabelas:

- `trial_accounts` - Contas e planos
- `organizations` - Organizações
- `users` - Usuários e roles
- `courses` - Cursos
- `enrollments` - Matrículas
- `user_progress` - Progresso dos usuários
- `activity_logs` - Logs de atividades
- `webhook_events` - Eventos de webhook
- `jobs` - Histórico de jobs

### RLS (Row Level Security):

Todas as tabelas possuem políticas RLS baseadas em:

- `organization_id`
- `auth.uid()` (usuário autenticado)
- `role` (hierarquia de permissões)

---

## ✅ Checklist de Migração

- [x] Criar variáveis de ambiente Supabase
- [x] Executar migrations SQL
- [x] Atualizar dependências (`npm install`)
- [x] Testar registro de nova organização
- [x] Testar login
- [x] Testar criação de usuários (invite)
- [x] Testar permissões e roles
- [ ] Migrar dados existentes (se houver)
- [ ] Configurar monitoring/alertas
- [ ] Testar integração Moodle

---

## 🎓 Próximos Passos (Futuro)

1. **Implementar módulos adicionais:**
   - Dashboard/Analytics
   - Reports/Relatórios
   - Notifications
   - Content Management
   - Forms Builder

2. **Planos Diferenciados:**
   - Configurar quais features cada plano tem acesso
   - Implementar limites por plano (storage, API calls, etc)

3. **Billing/Pagamentos:**
   - Integração com Stripe/PagSeguro
   - Upgrades/Downgrades de plano
   - Gestão de faturas

4. **Multi-tenancy Avançado:**
   - White-label por organização
   - Custom domains
   - Temas personalizados

---

## 📞 Suporte

Para dúvidas ou problemas durante a migração, consulte:

- `README.md` - Documentação geral
- `MOODLE_INTEGRATION_GUIDE.md` - Integração Moodle
- Migrations em `supabase/migrations/`

---

**Última atualização:** Outubro 2025
**Versão:** 2.0.0 (Sistema Unificado)
