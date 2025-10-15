# Supabase Setup - Verbum Trial System

## 📋 Pré-requisitos

1. Conta no Supabase (https://supabase.com)
2. Projeto criado no Supabase

## 🚀 Setup Inicial

### 1. Criar Projeto no Supabase

1. Acesse https://app.supabase.com
2. Clique em "New Project"
3. Escolha um nome (ex: `verbum-trial`)
4. Defina uma senha forte para o banco de dados
5. Escolha a região mais próxima
6. Aguarde a criação do projeto (~2 minutos)

### 2. Obter as Credenciais

No dashboard do projeto, vá em **Settings > API**:

- **Project URL**: `https://xxxxxxxxxxx.supabase.co`
- **anon public**: `eyJhbGc...` (Anon/Public Key)
- **service_role**: `eyJhbGc...` (Service Role Key - **SECRETO**)

### 3. Configurar Variáveis de Ambiente

Adicione no seu arquivo `.env`:

```bash
# Supabase (Trial System)
SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc... # Anon Key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Service Role Key (NUNCA commitar!)

# Trial Configuration
TRIAL_DURATION_DAYS=7
TRIAL_EXPIRATION_WARNING_HOURS=24
```

### 4. Executar Migrations

#### Opção A: Via Dashboard Supabase (Recomendado)

1. Vá em **SQL Editor** no dashboard do Supabase
2. Clique em "New Query"
3. Copie todo o conteúdo do arquivo `migrations/001_trial_schema.sql`
4. Cole no editor e clique em "Run"

#### Opção B: Via CLI do Supabase

```bash
# Instalar CLI do Supabase
npm install -g supabase

# Login
supabase login

# Linkar projeto (você precisará do Project Ref do dashboard)
supabase link --project-ref sua-project-ref

# Executar migrations
supabase db push
```

### 5. Configurar Storage Bucket

No dashboard do Supabase:

1. Vá em **Storage**
2. Clique em "Create a new bucket"
3. Nome: `trial-content`
4. **Public bucket**: Desmarque (privado)
5. Clique em "Create bucket"

#### Configurar Políticas do Storage

Vá em **Storage > Policies** e adicione:

**Política 1: Upload**

```sql
CREATE POLICY "Trial users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'trial-content'
  AND auth.role() = 'authenticated'
);
```

**Política 2: Visualização**

```sql
CREATE POLICY "Trial users can view their files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'trial-content'
  AND auth.role() = 'authenticated'
);
```

**Política 3: Deleção**

```sql
CREATE POLICY "Trial users can delete their files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'trial-content'
  AND auth.role() = 'authenticated'
);
```

### 6. Configurar Email (Opcional mas Recomendado)

Para emails de confirmação e recuperação de senha:

1. Vá em **Authentication > Email Templates**
2. Customize os templates conforme necessário
3. Configure SMTP customizado em **Settings > Auth > SMTP Settings** (se necessário)

### 7. Desabilitar Confirmação de Email (Trial Only)

Como é um trial, você pode desabilitar a confirmação de email:

1. Vá em **Authentication > Settings**
2. Em "Email Auth", desmarque **"Enable email confirmations"**
3. Salve as alterações

## 📊 Estrutura das Tabelas

### users

Armazena usuários trial com data de expiração, roles e informações de organização.

### organizations

Organizações trial - cada trial cria uma organização.

### trial_accounts

Contas de trial vinculadas ao Supabase Auth.

### user_permissions

Permissões granulares por usuário (RBAC).

### content

Conteúdos (vídeos, arquivos, documentos) criados pelos usuários trial.

### forms

Formulários dinâmicos criados pelos usuários trial.

### form_submissions

Respostas/submissões dos formulários.

### audit_logs

Logs de auditoria de todas as ações dos usuários trial.

## 🔒 Segurança

- ✅ Row Level Security (RLS) habilitado em todas as tabelas
- ✅ Políticas configuradas para isolar dados entre trials
- ✅ Service Role Key deve ser mantida em segredo
- ✅ Storage bucket privado com políticas de acesso

## 🧪 Testar Conexão

Após configurar tudo, rode o backend:

```bash
npm run start:dev
```

Verifique os logs. Você deve ver:

```
[SupabaseService] Supabase initialized successfully
```

## 📝 Próximos Passos

1. ✅ Supabase configurado
2. ➡️ Usar os endpoints da API:
   - `POST /api/v1/trial/auth/register` - Registrar trial
   - `POST /api/v1/trial/auth/login` - Login
   - `GET /api/v1/trial/auth/profile` - Perfil
   - `GET /api/v1/trial/dashboard/stats` - Dashboard
   - `POST /api/v1/trial/forms` - Criar formulário
   - `POST /api/v1/trial/content/upload` - Upload de arquivo

## 🔧 Troubleshooting

### Erro: "Supabase client not initialized"

- Verifique se as variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão configuradas no `.env`

### Erro: "permission denied for table users"

- Execute as migrations SQL novamente (especialmente a migration 009)
- Verifique se as políticas RLS foram criadas corretamente
- Use a última migration para recriar todas as políticas RLS

### Erro ao fazer upload: "new row violates row-level security policy"

- Verifique se o bucket `trial-content` foi criado
- Confirme que as políticas de storage foram adicionadas

## 📞 Suporte

Em caso de dúvidas:

- Documentação Supabase: https://supabase.com/docs
- Discord Supabase: https://discord.supabase.com
