# Verbum Backend - Sistema Unificado v2.0

Sistema backend para plataforma educacional com integração Moodle, gestão de cursos, progresso de alunos e sistema multi-tenant baseado em planos.

## 🚀 Características Principais

- ✅ **Autenticação Unificada** - Supabase Auth (JWT)
- ✅ **Multi-tenant** - Sistema de organizações com planos (Trial, Basic, Premium, Enterprise)
- ✅ **Hierarquia de Roles** - Admin → Diretoria → Coordenador → Professor → Aluno
- ✅ **Integração Moodle** - LTI 1.3 + REST API + Webhooks
- ✅ **Jobs Assíncronos** - BullMQ + Redis para processamento em background
- ✅ **Observabilidade** - Prometheus + Sentry + Winston logs
- ✅ **Escalável** - Arquitetura stateless, pronta para horizontal scaling

## 📋 Tecnologias

- **Framework:** NestJS 10.x
- **Database:** Supabase (PostgreSQL 14+)
- **Auth:** Supabase Auth
- **Cache/Jobs:** Redis + BullMQ
- **Monitoring:** Prometheus + Sentry
- **Integrations:** Moodle LTI 1.3

## 🏗️ Arquitetura

```
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │
       ↓
┌──────────────────────────────────┐
│     API Gateway (NestJS)         │
│  - Guards (Auth, Permissions)    │
│  - Middlewares (Org, Subscription)│
└──────┬───────────────────────────┘
       │
       ├─→ Supabase (PostgreSQL + Auth)
       │
       └─→ Redis (BullMQ jobs)
```

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ e npm 9+
- Redis 6+
- Conta Supabase configurada

### Passos

1. **Clone o repositório:**

```bash
git clone <repo-url>
cd verbum-backend
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Configure as variáveis de ambiente:**

```bash
# Gerar arquivo de desenvolvimento (.env.local)
npm run env:setup
# Digite: local

# Editar com suas credenciais
code .env.local
```

**O sistema carrega automaticamente baseado no NODE_ENV:**

- `npm run start:dev` → usa `.env.local`
- `npm run start:homolog` → usa `.env.homolog`
- `npm run start:prod` → usa `.env.prod`

Credenciais mínimas no `.env.local`:

```bash
SUPABASE_URL=https://your-project-dev.supabase.co
SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-key
REDIS_HOST=localhost
REDIS_PORT=6379
```

📚 **Setup rápido:** [QUICK_START.md](./QUICK_START.md) | **Guia completo:** [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)

4. **Execute as migrations Supabase:**

Acesse o Supabase Dashboard → SQL Editor e execute as migrations em ordem:

- `supabase/migrations/001_trial_schema.sql`
- `supabase/migrations/002_fix_rls_insert.sql`
- ... (executar todas em ordem numérica)

5. **Inicie o servidor:**

**Desenvolvimento Local (usa .env.local automaticamente):**

```bash
npm run start:dev
```

**Homologação/Staging (usa .env.homolog automaticamente):**

```bash
npm run build
npm run start:homolog
```

**Produção (usa .env.prod automaticamente):**

```bash
npm run build
npm run start:prod
```

## 🔐 Autenticação e Autorização

### Sistema de Planos

| Plano      | Duração | Limite Usuários | Features            |
| ---------- | ------- | --------------- | ------------------- |
| Trial      | 7 dias  | 20              | Todas               |
| Basic      | ∞       | ∞               | Todas (padrão)      |
| Premium    | ∞       | ∞               | Todas + Analytics   |
| Enterprise | ∞       | ∞               | Todas + White-label |

### Hierarquia de Roles

```
ADMIN (acesso total)
  └─ DIRETORIA (gestão organizacional)
      └─ COORDENADOR (gestão pedagógica)
          └─ PROFESSOR (gestão de turmas)
              └─ ALUNO (acesso a cursos matriculados)
```

### Exemplo de Uso

```typescript
@Controller('courses')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class CoursesController {
  @Post()
  @RequiresRole(UserRole.ADMIN, UserRole.COORDENADOR)
  @RequiresFeature(Feature.COURSES)
  async create(
    @Organization('id') orgId: string,
    @CurrentUser('dbId') userId: string,
    @Body() dto: CreateCourseDto,
  ) {
    return this.service.create(orgId, dto);
  }
}
```

## 📡 API Endpoints

### Autenticação

- `POST /auth/register` - Registrar nova organização (trial)
- `POST /auth/login` - Login de usuário
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `GET /auth/profile` - Perfil do usuário
- `POST /auth/invite` - Convidar novo usuário

### Organizações

- `GET /organizations/me` - Dados da organização atual
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

### Progresso

- `GET /progress/stats` - Estatísticas do usuário
- `GET /progress/course/:id` - Progresso por curso
- `PUT /progress/:id` - Atualizar progresso
- `POST /progress/activity` - Registrar atividade

### Jobs

- `POST /jobs/sync` - Iniciar sincronização Moodle
- `GET /jobs/:id` - Status do job

### Health

- `GET /health` - Health check geral
- `GET /health/readiness` - Readiness probe

### Metrics

- `GET /metrics` - Prometheus metrics

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
npm run start:dev      # Desenvolvimento com watch
npm run build          # Build para produção
npm run start:prod     # Executar produção
npm run lint           # Linting
npm run test           # Testes unitários
npm run test:e2e       # Testes E2E
```

### Estrutura de Diretórios

```
src/
├── common/                 # Módulos compartilhados
│   ├── decorators/        # Custom decorators
│   ├── guards/            # Guards de autorização
│   ├── middlewares/       # Middlewares
│   ├── plans/             # Sistema de planos
│   └── permissions/       # Sistema de permissões
├── config/                # Configurações
├── modules/               # Módulos de negócio
│   ├── auth/
│   ├── users/
│   ├── organizations/
│   ├── courses/
│   ├── progress/
│   ├── webhooks/
│   ├── jobs/
│   ├── moodle-adapter/
│   └── metrics/
├── supabase/              # Supabase client
├── app.module.ts
└── main.ts
```

## 🐳 Docker

### Desenvolvimento com Docker Compose

```bash
docker-compose -f docker-compose.dev.yml up
```

Serviços incluídos:

- API (NestJS)
- Redis
- PostgreSQL (local, opcional)
- Prometheus
- Grafana

### Produção

```bash
docker build -t verbum-backend .
docker run -p 4000:4000 --env-file .env verbum-backend
```

## 📊 Monitoramento

### Prometheus Metrics

Acesse: `http://localhost:4000/api/v1/metrics`

Métricas disponíveis:

- `http_requests_total` - Total de requisições HTTP
- `http_request_duration_seconds` - Latência de requisições
- `jobs_processed_total` - Jobs processados
- `jobs_failed_total` - Jobs falhados

### Logs

Logs estruturados em JSON (Winston):

```json
{
  "level": "info",
  "message": "Usuario criado: João Silva",
  "timestamp": "2025-10-15T12:34:56.789Z",
  "context": "UsersService"
}
```

### Sentry

Erros são automaticamente enviados para Sentry se configurado:

```bash
SENTRY_DSN=https://your-sentry-dsn
SENTRY_ENVIRONMENT=production
```

## 🧪 Testes

### Unitários

```bash
npm run test
```

### E2E

```bash
npm run test:e2e
```

### Coverage

```bash
npm run test:cov
```

## 📚 Documentação Adicional

- [QUICK_START.md](./QUICK_START.md) - ⚡ Setup rápido em 3 passos
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Guia de configuração de ambientes (LOCAL, HOMOLOG, PROD)
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Guia completo de migração da v1 para v2
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura detalhada do sistema
- [MOODLE_INTEGRATION_GUIDE.md](./MOODLE_INTEGRATION_GUIDE.md) - Integração com Moodle
- [CHANGELOG.md](./CHANGELOG.md) - Histórico de mudanças

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📝 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

- **Verbum Team**
- Email: suporte@verbum.com

## 🔗 Links Úteis

- [NestJS Documentation](https://docs.nestjs.com)
- [Supabase Documentation](https://supabase.com/docs)
- [BullMQ Documentation](https://docs.bullmq.io)
- [Moodle LTI 1.3](https://docs.moodle.org/dev/LTI_Advantage)

---

**Versão:** 2.0.0 | **Última atualização:** Outubro 2025
