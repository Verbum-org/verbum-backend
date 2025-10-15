# 🚀 Guia de Deploy no Render - Verbum Backend

## Pré-requisitos

1. **Conta no Render**: Crie uma conta em [render.com](https://render.com)
2. **Repositório Git**: Seu código deve estar em um repositório Git (GitHub, GitLab, ou Bitbucket)
3. **Variáveis de Ambiente**: Tenha todas as variáveis necessárias anotadas

## Passo 1: Preparar o Repositório

### 1.1. Commit dos arquivos de configuração

```bash
git add render.yaml Dockerfile.render RENDER_DEPLOY_GUIDE.md
git commit -m "feat: adicionar configurações para deploy no Render"
git push origin main
```

### 1.2. Verificar se o build funciona localmente

```bash
npm ci
npm run build
npm run start:prod
```

## Passo 2: Criar Serviço no Render

### 2.1. Acesse o Dashboard do Render

1. Faça login em [render.com](https://render.com)
2. Clique em "New +" → "Web Service"

### 2.2. Conectar Repositório

1. Conecte sua conta do GitHub/GitLab/Bitbucket
2. Selecione o repositório `verbum-backend`
3. Clique em "Connect"

### 2.3. Configurar o Serviço

**Configurações Básicas:**

- **Name**: `verbum-backend`
- **Environment**: `Node`
- **Region**: `Oregon (US West)` (ou mais próximo do seu público)
- **Branch**: `main`
- **Root Directory**: Deixe vazio (raiz do projeto)

**Build & Deploy:**

- **Build Command**: `npm ci --production=false && npm run build`
- **Start Command**: `npm run start:prod`

**Advanced Settings:**

- **Instance Type**: `Starter` (gratuito) ou `Standard` (pago)
- **Auto-Deploy**: `Yes` (deploy automático em push)

## Passo 3: Configurar Variáveis de Ambiente

### 3.1. Variáveis Obrigatórias

No dashboard do Render, vá em "Environment" e adicione:

```env
# Aplicação
NODE_ENV=production
PORT=10000
API_PREFIX=api/v1
CORS_ORIGIN=https://seu-frontend.com

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro
JWT_REFRESH_SECRET=seu-refresh-secret-super-seguro
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Redis (usar o Redis do Render)
REDIS_HOST=seu-redis-host-do-render
REDIS_PORT=6379
REDIS_PASSWORD=sua-senha-redis
REDIS_DB=0

# Moodle
MOODLE_URL=https://seu-moodle.com
MOODLE_TOKEN=seu-token-moodle
MOODLE_WS_URL=https://seu-moodle.com/webservice/rest/server.php

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
SMTP_FROM=noreply@verbum.com

# Monitoramento
SENTRY_DSN=sua-dsn-sentry

# Webhooks
WEBHOOK_SECRET=seu-webhook-secret
```

### 3.2. Variáveis Opcionais (já configuradas no render.yaml)

- `TRIAL_DURATION_DAYS=7`
- `TRIAL_EXPIRATION_WARNING_HOURS=24`
- `THROTTLE_TTL=60`
- `THROTTLE_LIMIT=100`
- `MAX_FILE_SIZE=10485760`
- `UPLOAD_PATH=./uploads`

## Passo 4: Configurar Banco de Dados Redis

### 4.1. Criar Redis Database

1. No dashboard do Render, clique em "New +" → "Redis"
2. **Name**: `verbum-redis`
3. **Plan**: `Starter` (gratuito)
4. **Region**: Mesma região do seu serviço web
5. Clique em "Create Database"

### 4.2. Obter Credenciais do Redis

1. Após criar, vá na aba "Info" do Redis
2. Copie as credenciais:
   - **Internal Database URL**: Use para `REDIS_HOST` e `REDIS_PORT`
   - **Password**: Use para `REDIS_PASSWORD`

## Passo 5: Deploy

### 5.1. Deploy Manual

1. No seu serviço web, clique em "Manual Deploy"
2. Selecione "Deploy latest commit"
3. Aguarde o build e deploy

### 5.2. Verificar Deploy

1. Após o deploy, acesse a URL fornecida pelo Render
2. Teste o health check: `https://seu-app.onrender.com/api/v1/health`
3. Teste a documentação: `https://seu-app.onrender.com/api/docs`

## Passo 6: Configurar Domínio Personalizado (Opcional)

### 6.1. Adicionar Domínio

1. No dashboard do serviço, vá em "Settings" → "Custom Domains"
2. Adicione seu domínio personalizado
3. Configure os registros DNS conforme instruções

## Passo 7: Monitoramento e Logs

### 7.1. Visualizar Logs

1. No dashboard do serviço, vá na aba "Logs"
2. Monitore logs em tempo real
3. Use filtros para encontrar erros específicos

### 7.2. Health Checks

- O Render monitora automaticamente o endpoint `/api/v1/health`
- Se o health check falhar, o serviço será reiniciado

## Passo 8: Configurações Avançadas

### 8.1. Auto-Deploy

- **Branch**: `main` (deploy automático em push)
- **Build Command**: `npm ci --production=false && npm run build`
- **Start Command**: `npm run start:prod`

### 8.2. Environment Variables

- Todas as variáveis sensíveis devem ser marcadas como "Secret"
- Use valores diferentes para produção

### 8.3. Scaling

- **Starter**: 1 instância, pode hibernar
- **Standard**: Múltiplas instâncias, sempre ativo

## Troubleshooting

### Problemas Comuns

1. **Build Falha - Comando `nest` não encontrado**
   - **Solução**: Mover `@nestjs/cli` e dependências relacionadas para `dependencies`
   - **Sintomas**: `sh: 1: nest: not found`
   - **Correção**: Verificar se `ts-loader`, `typescript`, `ts-node`, etc. estão em `dependencies`

2. **Build Falha - Arquivos de teste sendo incluídos**
   - **Solução**: Criar `tsconfig.build.json` que exclua a pasta `test`
   - **Sintomas**: Erros sobre `@nestjs/testing`, `supertest`, `jest`
   - **Correção**: Configurar `nest-cli.json` para usar `tsconfig.build.json`

3. **Build Falha - Geral**
   - Verifique se todas as dependências estão no `package.json`
   - Confirme se o comando `npm run build` funciona localmente

4. **Aplicação não inicia - Comando cross-env não encontrado**
   - **Solução**: Mover `cross-env` para `dependencies`
   - **Sintomas**: `sh: 1: cross-env: not found`
   - **Correção**: cross-env é necessário em produção para definir NODE_ENV

5. **Variáveis de ambiente não funcionam em produção**
   - **Solução**: Desabilitar carregamento de arquivos .env em produção
   - **Sintomas**: Porta mostra 4000 em vez de 10000, NODE_ENV não é reconhecido
   - **Correção**: Render injeta variáveis diretamente, não usar arquivos .env

6. **Swagger não funciona em produção**
   - **Solução**: Configurar Swagger antes do global prefix
   - **Sintomas**: 404 em `/api/docs`
   - **Correção**: Mover `SwaggerModule.setup()` antes de `app.setGlobalPrefix()`

7. **Aplicação não inicia**
   - Verifique os logs no dashboard do Render
   - Confirme se todas as variáveis de ambiente estão configuradas

8. **Health Check falha**
   - Verifique se o endpoint `/api/v1/health` está funcionando
   - Confirme se a aplicação está rodando na porta correta

9. **CORS Issues**
   - Atualize `CORS_ORIGIN` com o domínio correto do frontend
   - Use vírgulas para múltiplas origens

### Comandos Úteis

```bash
# Testar build local
npm ci
npm run build
npm run start:prod

# Verificar variáveis de ambiente
node -e "console.log(process.env)"

# Testar health check
curl https://seu-app.onrender.com/api/v1/health
```

## Custos

### Plano Gratuito (Starter)

- **Web Service**: 750 horas/mês (pode hibernar)
- **Redis**: 30MB de memória
- **Bandwidth**: 100GB/mês

### Plano Pago (Standard)

- **Web Service**: $7/mês por instância
- **Redis**: $3/mês por 30MB
- **Bandwidth**: $0.10/GB adicional

## Próximos Passos

1. **Configurar CI/CD**: Integrar com GitHub Actions
2. **Monitoramento**: Configurar Sentry e Prometheus
3. **Backup**: Configurar backup automático do Redis
4. **SSL**: Configurar certificado SSL personalizado
5. **CDN**: Integrar com Cloudflare para melhor performance

## Suporte

- **Documentação Render**: [render.com/docs](https://render.com/docs)
- **Status Page**: [status.render.com](https://status.render.com)
- **Community**: [community.render.com](https://community.render.com)
