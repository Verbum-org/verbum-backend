# 🚀 Quick Start - Verbum Backend

## ⚡ Setup em 3 Passos

### 1️⃣ Instalar Dependências

```bash
npm install
```

### 2️⃣ Criar Arquivo de Ambiente Local

```bash
npm run env:setup
```

Quando perguntado, digite: **`local`**

### 3️⃣ Editar Credenciais

Abra o arquivo `.env.local` e configure:

```bash
# Mínimo necessário para rodar
SUPABASE_URL=https://your-project-dev.supabase.co
SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-key

# Redis local (padrão)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Porta da aplicação
PORT=4000
```

### 4️⃣ Iniciar o Servidor

```bash
npm run start:dev
```

✅ **Pronto!** O servidor vai iniciar em `http://localhost:4000/api/v1`

---

## 📚 Documentação e Endpoints

### Swagger API Docs

Acesse: **http://localhost:4000/api/docs**

### Health Check

```bash
curl http://localhost:4000/api/v1/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up", "type": "supabase" },
    "redis": { "status": "up" }
  }
}
```

---

## 🎯 Como Funciona o Sistema de Ambientes

### Carregamento Automático

O sistema **detecta automaticamente** qual arquivo `.env.*` usar:

| Comando                 | NODE_ENV    | Arquivo Carregado |
| ----------------------- | ----------- | ----------------- |
| `npm run start:dev`     | development | `.env.local`      |
| `npm run start:homolog` | staging     | `.env.homolog`    |
| `npm run start:prod`    | production  | `.env.prod`       |

### Logs de Carregamento

Quando você iniciar o servidor, verá:

```
✅ Carregando variáveis de: .env.local
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [SupabaseService] Supabase initialized successfully
[Nest] LOG 🚀 Application is running on: http://localhost:4000/api/v1
```

### Fallback Automático

Se `.env.local` não existir, o sistema tenta:

1. `.env.local` (específico do ambiente)
2. `.env` (fallback genérico)
3. Se nenhum existir → aviso no console

---

## 🐛 Troubleshooting Rápido

### ❌ "Cannot find .env file"

**Solução:**

```bash
npm run env:setup
# Escolher: local
```

### ❌ "SUPABASE_URL is not defined"

**Solução:**

```bash
# Editar .env.local e adicionar suas credenciais Supabase
code .env.local
```

### ❌ "Redis connection failed"

**Solução (Windows):**

```bash
# Instalar Redis via Chocolatey
choco install redis-64

# Ou via WSL
wsl sudo service redis-server start
```

**Solução (Mac):**

```bash
brew install redis
brew services start redis
```

**Solução (Linux):**

```bash
sudo apt install redis-server
sudo systemctl start redis
```

### ❌ "Port 4000 already in use"

**Solução (Windows):**

```bash
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

**Solução (Linux/Mac):**

```bash
lsof -ti:4000 | xargs kill -9
```

---

## 📡 Principais Endpoints

### Autenticação

- `POST /api/v1/auth/register` - Criar nova organização (trial)
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/profile` - Perfil do usuário

### Organizações

- `GET /api/v1/organizations/me` - Minha organização
- `GET /api/v1/organizations/me/stats` - Estatísticas

### Usuários

- `GET /api/v1/users` - Listar usuários
- `POST /api/v1/auth/invite` - Convidar usuário

### Cursos

- `GET /api/v1/courses` - Listar cursos
- `POST /api/v1/courses` - Criar curso
- `GET /api/v1/courses/my-courses` - Meus cursos

### Progresso

- `GET /api/v1/progress/my-stats` - Minhas estatísticas
- `GET /api/v1/progress/course/:courseId` - Progresso por curso

---

## 🔑 Exemplo de Request

### 1. Registrar Nova Organização (Trial)

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "Minha Escola",
    "adminEmail": "admin@minhaescola.com",
    "adminPassword": "SenhaSegura123!",
    "adminName": "João Silva"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@minhaescola.com",
    "password": "SenhaSegura123!"
  }'
```

Resposta:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@minhaescola.com",
    "name": "João Silva",
    "role": "admin",
    "organizationId": "uuid"
  }
}
```

### 3. Usar o Token

```bash
curl -X GET http://localhost:4000/api/v1/organizations/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📖 Documentação Completa

Para mais detalhes, consulte:

- **[README.md](./README.md)** - Documentação geral
- **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Guia completo de ambientes
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Migração v1 → v2
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitetura do sistema
- **[MOODLE_INTEGRATION_GUIDE.md](./MOODLE_INTEGRATION_GUIDE.md)** - Integração Moodle

---

## 💡 Dicas de Desenvolvimento

### Hot Reload

O servidor reinicia automaticamente quando você salvar arquivos:

```bash
npm run start:dev
# Edite um arquivo .ts
# Servidor reinicia automaticamente
```

### Debug Mode

```bash
npm run start:debug
# Conecte debugger na porta 9229
```

### Linting

```bash
npm run lint
# Corrige erros automaticamente
```

### Testes

```bash
# Rodar todos os testes
npm run test

# Modo watch
npm run test:watch

# Coverage
npm run test:cov
```

---

## 🎓 Próximos Passos

1. ✅ Servidor rodando
2. ✅ Health check OK
3. ✅ Swagger acessível
4. ⏭️ [Aplicar migrations Supabase](./supabase/README.md)
5. ⏭️ [Configurar integração Moodle](./MOODLE_INTEGRATION_GUIDE.md) (se necessário)
6. ⏭️ Testar endpoints via Swagger
7. ⏭️ Desenvolver suas features!

---

**Última atualização:** Outubro 2025
**Versão:** 2.0.0
