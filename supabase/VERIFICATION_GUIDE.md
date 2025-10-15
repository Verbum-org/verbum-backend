# 🔍 Guia de Verificação do Supabase - Verbum V2.0

## 📋 Visão Geral

Este guia ajuda a verificar se todas as tabelas da **Nova Arquitetura V2.0** estão corretamente criadas e configuradas no Supabase.

---

## ✅ Checklist Rápido

### 1️⃣ **Verificar Todas as Tabelas**
```bash
# Execute o script:
supabase/scripts/01_check_all_tables.sql
```

**Resultado Esperado:** 24 tabelas criadas

### 2️⃣ **Verificar Políticas RLS**
```bash
# Execute o script:
supabase/scripts/02_verify_rls_policies.sql
```

**Resultado Esperado:** Todas as tabelas com RLS habilitado

### 3️⃣ **Verificar Contagem de Registros**
```bash
# Execute o script:
supabase/scripts/03_count_records.sql
```

**Resultado Esperado:** Veja quantos registros existem em cada tabela

### 4️⃣ **Testar Inserção/Autenticação**
```bash
# Execute o script:
supabase/scripts/04_test_authentication.sql
```

**Resultado Esperado:** Consegue inserir e consultar dados

---

## 📊 Como Executar os Scripts

### **Opção A: Dashboard do Supabase (Mais Fácil)**

1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. Copie e cole o conteúdo do script
6. Clique em **Run** (ou `Ctrl+Enter`)

### **Opção B: CLI do Supabase**

```bash
# Instalar CLI (se ainda não tem)
npm install -g supabase

# Login
supabase login

# Linkar projeto
supabase link --project-ref sua-project-ref

# Executar script
supabase db execute --file supabase/scripts/01_check_all_tables.sql
```

### **Opção C: Via Backend (Node.js)**

```bash
# Use o script Node.js
npm run db:verify
```

---

## 🗂️ Tabelas Esperadas (24 no Total)

### **📦 Core (4 tabelas)**
- ✅ `trial_accounts` - Contas trial vinculadas ao Supabase Auth
- ✅ `organizations` - Organizações (cada trial = 1 org)
- ✅ `users` - Usuários com roles e permissões
- ✅ `user_permissions` - Permissões granulares (RBAC)

### **📝 Content & Forms (3 tabelas)**
- ✅ `forms` - Formulários dinâmicos
- ✅ `form_submissions` - Respostas de formulários
- ✅ `content` - Conteúdos (vídeos, arquivos, docs)

### **📊 Dashboard & Notifications (3 tabelas)**
- ✅ `audit_logs` - Logs de auditoria
- ✅ `notifications` - Notificações do sistema
- ✅ `user_notification_preferences` - Preferências de notificações

### **🎓 Courses & Progress (4 tabelas)**
- ✅ `courses` - Cursos
- ✅ `enrollments` - Matrículas em cursos
- ✅ `user_progress` - Progresso dos usuários
- ✅ `activity_logs` - Logs de atividades

### **🔗 Webhooks (3 tabelas)**
- ✅ `webhook_events` - Eventos de webhooks recebidos
- ✅ `webhook_subscriptions` - Assinaturas de webhooks
- ✅ `webhook_delivery_logs` - Logs de entregas

### **⚙️ Jobs (3 tabelas)**
- ✅ `jobs` - Jobs assíncronos
- ✅ `job_logs` - Logs de execução de jobs
- ✅ `scheduled_jobs` - Jobs agendados

### **🔌 Moodle Integration (4 tabelas)**
- ✅ `moodle_configurations` - Configurações de integração
- ✅ `moodle_sync_logs` - Logs de sincronização
- ✅ `moodle_entity_mappings` - Mapeamento de entidades
- ✅ `moodle_sync_errors` - Erros de sincronização

---

## 🔒 Verificações de Segurança

### **RLS (Row Level Security)**
Todas as 24 tabelas devem ter:
- ✅ `rowsecurity = TRUE`
- ✅ Pelo menos 1 política RLS ativa
- ✅ Políticas permitem acesso para usuários autenticados

### **Triggers**
Algumas tabelas devem ter triggers para:
- `updated_at` - Auto-update timestamp
- `soft_delete` - Exclusão lógica

---

## 🧪 Testando a Conexão

### **1. Via Health Check do Backend**
```bash
curl http://localhost:4000/api/v1/health
```

Deve retornar:
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "supabase": {
      "status": "up"
    }
  }
}
```

### **2. Via Script SQL**
```sql
-- Execute no SQL Editor do Supabase
SELECT 'Conexão OK!' AS status;
```

---

## 🐛 Troubleshooting

### **❌ Erro: "relation does not exist"**
**Causa:** Tabela não foi criada.  
**Solução:** Execute a migration correspondente.

```bash
# Liste as migrations executadas
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;

# Execute a migration faltante manualmente
# Vá em SQL Editor e execute o arquivo .sql
```

### **❌ Erro: "permission denied for table X"**
**Causa:** RLS está bloqueando acesso.  
**Solução:** Verifique políticas RLS.

```sql
-- Ver políticas da tabela
SELECT * FROM pg_policies WHERE tablename = 'nome_da_tabela';

-- Se não houver políticas, crie uma permissiva (TEMPORÁRIO PARA TESTE)
CREATE POLICY "temp_allow_all" ON nome_da_tabela FOR ALL USING (true) WITH CHECK (true);
```

### **❌ Erro: "could not connect to server"**
**Causa:** URL ou credenciais incorretas.  
**Solução:** Verifique `.env`:

```bash
SUPABASE_URL=https://xxxxx.supabase.co  # Sem barra no final
SUPABASE_ANON_KEY=eyJhbGc...             # Anon Key (pública)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...    # Service Key (privada)
```

---

## 📝 Ordem de Execução das Migrations

Se estiver configurando do zero:

```bash
001_trial_schema.sql               # Core: trial_accounts, organizations, users
002_fix_rls_insert.sql             # Fix RLS para inserts
003_new_architecture.sql           # Atualiza schema para V2
004_dashboard_reports_notifications.sql  # Adiciona notifications
005_fix_rls_recursion.sql          # Fix recursão RLS
006_fix_all_rls_policies.sql       # Limpa e recria RLS
007_force_remove_all_old_policies.sql  # Remove políticas antigas
008_fix_rls_existing_tables_only.sql   # Fix RLS em tabelas existentes
009_force_clean_and_recreate_rls.sql   # Recria RLS limpo
010_courses_schema.sql             # Courses + Enrollments
011_progress_schema.sql            # User Progress + Activity Logs
012_webhooks_schema.sql            # Webhooks
013_jobs_schema.sql                # Jobs + Job Logs
014_moodle_integration_schema.sql  # Moodle Integration
```

---

## 🎯 Próximos Passos

Após verificar que tudo está OK:

1. ✅ Todas as 24 tabelas criadas
2. ✅ RLS habilitado em todas
3. ✅ Backend conectando sem erros
4. ➡️ **Executar testes E2E**
5. ➡️ **Popular dados de exemplo** (opcional)
6. ➡️ **Configurar backup automático**

---

## 📞 Suporte

- 📖 Documentação Supabase: https://supabase.com/docs
- 💬 Discord Supabase: https://discord.supabase.com
- 🐛 Issues: GitHub do projeto

---

**Última Atualização:** Refatoração V2.0 - Arquitetura Unificada


