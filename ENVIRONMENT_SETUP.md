# Guia de Configuração de Ambientes

Este guia explica como configurar e gerenciar diferentes ambientes (local, homologação e produção) no Verbum Backend.

---

## 🏗️ Ambientes Disponíveis

O projeto suporta 3 ambientes distintos:

| Ambiente     | Arquivo        | NODE_ENV    | Uso                           |
| ------------ | -------------- | ----------- | ----------------------------- |
| **Local**    | `.env.local`   | development | Desenvolvimento local         |
| **Homolog**  | `.env.homolog` | staging     | Testes em ambiente de staging |
| **Produção** | `.env.prod`    | production  | Ambiente de produção          |

---

## 🚀 Setup Rápido

### 1. Gerar Arquivos de Ambiente

Execute o script de setup:

```bash
npm run env:setup
```

O script perguntará qual ambiente você deseja configurar:

- `local` - Apenas desenvolvimento local
- `homolog` - Apenas homologação
- `prod` - Apenas produção
- `all` - Todos os ambientes de uma vez

### 2. Configurar Credenciais

Após criar os arquivos, edite cada um com suas credenciais reais:

```bash
# Para desenvolvimento local
code .env.local

# Para homologação
code .env.homolog

# Para produção (cuidado!)
code .env.prod
```

### 3. Executar o Ambiente Desejado

```bash
# Desenvolvimento local (carrega .env.local automaticamente)
npm run start:dev

# Homologação (carrega .env.homolog automaticamente)
npm run build
npm run start:homolog

# Produção (carrega .env.prod automaticamente)
npm run build
npm run start:prod
```

> **💡 Dica:** O sistema detecta automaticamente qual arquivo `.env.*` usar baseado no `NODE_ENV`

---

## 📋 Configurações por Ambiente

### 🖥️ **Local (.env.local)**

Ambiente para desenvolvimento local com configurações permissivas:

```bash
# Características
- NODE_ENV=development
- PORT=4000
- Log level: debug
- CORS: localhost permitido
- Redis: local sem senha
- Supabase: projeto dev
- Rate limiting: 1000 req/min (permissivo)
- Sentry: desabilitado ou opcional
- Email: Mailtrap ou mock
```

**Casos de uso:**

- Desenvolvimento de features
- Debugging
- Testes manuais
- Hot-reload ativo

### 🧪 **Homologação (.env.homolog)**

Ambiente para testes antes de produção:

```bash
# Características
- NODE_ENV=staging
- PORT=4000
- Log level: info
- CORS: domínios staging
- Redis: cloud com senha e TLS
- Supabase: projeto staging
- Rate limiting: 500 req/min
- Sentry: ativo (30% tracing)
- Email: SendGrid/SES real
```

**Casos de uso:**

- QA e testes de integração
- Validação de cliente
- Testes de performance
- Simulação de produção

### 🚀 **Produção (.env.prod)**

Ambiente de produção com segurança máxima:

```bash
# Características
- NODE_ENV=production
- PORT=4000
- Log level: warn (apenas erros)
- CORS: apenas domínios oficiais
- Redis: cloud HA com TLS
- Supabase: projeto produção
- Rate limiting: 300 req/min (restritivo)
- Sentry: ativo (10% tracing)
- Email: SendGrid/SES produção
- Logs: /var/log/verbum (persistente)
```

**Casos de uso:**

- Aplicação em uso real
- Dados de clientes reais
- Alta disponibilidade
- Monitoramento crítico

---

## 🔑 Variáveis Importantes

### Obrigatórias em Todos os Ambientes

```bash
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Redis
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD= # Vazio em local, obrigatório em homolog/prod

# Aplicação
PORT=4000
NODE_ENV=
```

### Opcionais mas Recomendadas

```bash
# Monitoramento
SENTRY_DSN=
PROMETHEUS_ENABLED=true

# Email
SMTP_HOST=
SMTP_USER=
SMTP_PASS=

# Moodle (se usar)
MOODLE_URL=
MOODLE_TOKEN=
```

---

## 🛡️ Segurança

### ⚠️ Regras de Ouro

1. **NUNCA commite arquivos `.env.*` reais no Git**

   ```bash
   # Verifique se estão no .gitignore
   cat .gitignore | grep ".env"
   ```

2. **Use secrets managers em produção**
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Secret Manager
   - HashiCorp Vault

3. **Rotacione credenciais regularmente**
   - Supabase service keys: a cada 90 dias
   - Redis passwords: a cada 6 meses
   - API tokens: conforme política

4. **Acesso restrito**
   - Apenas DevOps/Lead têm acesso a `.env.prod`
   - Developers só acessam `.env.local` e `.env.homolog`

### 🔒 Checklist de Segurança

- [ ] Arquivos `.env.*` estão no `.gitignore`
- [ ] Credenciais de produção NÃO estão no repositório
- [ ] Redis em prod usa TLS
- [ ] CORS configurado apenas para domínios oficiais
- [ ] Rate limiting ativo em todos os ambientes
- [ ] Sentry configurado para monitoramento de erros
- [ ] Logs não expõem informações sensíveis

---

## 📦 Deploy por Ambiente

### Local (Desenvolvimento)

```bash
# 1. Criar arquivo
npm run env:setup
# Escolher: local

# 2. Configurar
nano .env.local

# 3. Executar
npm run start:local
```

### Homologação (CI/CD)

```bash
# 1. Build
npm run build

# 2. Copiar .env.homolog no servidor
scp .env.homolog user@staging-server:/app/.env

# 3. Executar
npm run start:homolog
```

### Produção (CI/CD)

```bash
# 1. Build otimizado
npm run build

# 2. Variáveis via secrets (NÃO copiar arquivo)
# AWS ECS/Fargate: Task Definition
# Kubernetes: ConfigMap/Secrets
# Docker: --env-file ou variáveis diretas

# 3. Executar
npm run start:prod
```

---

## 🔄 Switching Entre Ambientes

### Automaticamente (Recomendado)

O sistema carrega o arquivo correto automaticamente:

```bash
# Desenvolvimento (carrega .env.local)
npm run start:dev

# Homologação (carrega .env.homolog)
npm run start:homolog

# Produção (carrega .env.prod)
npm run start:prod
```

### Manualmente (Fallback)

Se o arquivo específico não existir, o sistema usa `.env` como fallback:

```bash
# Copiar configuração para .env (não recomendado)
cp .env.local .env
npm run start:dev
```

### Via Docker

```bash
# Local
docker run -it --env-file .env.local verbum-backend

# Homolog
docker run -it --env-file .env.homolog verbum-backend

# Prod
docker run -it --env-file .env.prod verbum-backend
```

### Via Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    image: verbum-backend
    env_file:
      - .env.local # Alterar para .env.homolog ou .env.prod
    ports:
      - '4000:4000'
```

---

## 🧪 Testando Configurações

### Validar Ambiente

```bash
# Executar e verificar logs
npm run start:local

# Deve aparecer:
# [Nest] LOG [NestFactory] Starting Nest application...
# [Nest] LOG [SupabaseService] Supabase initialized successfully
# [Nest] LOG 🚀 Application is running on: http://localhost:4000/api/v1
```

### Health Check

```bash
# Verificar se ambiente está OK
curl http://localhost:4000/api/v1/health

# Resposta esperada:
{
  "status": "ok",
  "info": {
    "database": { "status": "up", "type": "supabase" },
    "redis": { "status": "up" }
  }
}
```

---

## 📚 Troubleshooting

### Problema: "Cannot find .env file"

**Solução:**

```bash
npm run env:setup
# Escolher ambiente desejado
```

### Problema: "SUPABASE_URL is not defined"

**Solução:**

```bash
# Editar arquivo e adicionar credenciais
nano .env.local
```

### Problema: "Redis connection failed"

**Solução:**

```bash
# Local: Verificar se Redis está rodando
redis-cli ping

# Homolog/Prod: Verificar credenciais e TLS
```

### Problema: "Port 4000 already in use"

**Solução:**

```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

---

## 🎯 Melhores Práticas

1. **Sempre use o ambiente correto**
   - Dev → `.env.local`
   - QA → `.env.homolog`
   - Prod → `.env.prod`

2. **Mantenha templates atualizados**
   - Quando adicionar nova variável, atualizar `setup-env.js`

3. **Documente variáveis customizadas**
   - Adicionar comentários nos arquivos `.env.*`

4. **Use ferramentas de validação**
   - `dotenv-safe` ou `envalid`

5. **Monitore logs por ambiente**
   - Local: debug completo
   - Homolog: info + errors
   - Prod: apenas warnings + errors

---

## 🔗 Links Úteis

- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [12-Factor App - Config](https://12factor.net/config)
- [OWASP - Configuration Management](https://owasp.org/www-project-top-ten/)

---

**Última atualização:** Outubro 2025
**Versão:** 2.0.0
