# ⚡ Setup Rápido - Executar Migrations Faltantes

## 📊 Você tem: 8/24 tabelas | Faltam: 16 tabelas

---

## 🚀 **Execução Rápida (5 minutos)**

### **Passo 1: Acesse o SQL Editor**

1. Vá em https://app.supabase.com
2. Selecione seu projeto
3. Clique em **SQL Editor** (menu lateral esquerdo)

---

### **Passo 2: Execute as Migrations (UMA POR VEZ)**

#### **Migration 004 - Dashboard (2 tabelas)**

```
1. No VS Code, abra: supabase/migrations/004_dashboard_reports_notifications.sql
2. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
3. No SQL Editor do Supabase:
   - Clique em "New Query"
   - Cole o conteúdo (Ctrl+V)
   - Clique em "Run" (ou Ctrl+Enter)
4. Aguarde "Success" ✅
```

#### **Migration 010 - Courses (2 tabelas)**

```
1. Abra: supabase/migrations/010_courses_schema.sql
2. Copie TODO o conteúdo
3. No SQL Editor: New Query → Cole → Run
4. Aguarde "Success" ✅
```

#### **Migration 011 - Progress (2 tabelas)**

```
1. Abra: supabase/migrations/011_progress_schema.sql
2. Copie TODO o conteúdo
3. No SQL Editor: New Query → Cole → Run
4. Aguarde "Success" ✅
```

#### **Migration 012 - Webhooks (3 tabelas)**

```
1. Abra: supabase/migrations/012_webhooks_schema.sql
2. Copie TODO o conteúdo
3. No SQL Editor: New Query → Cole → Run
4. Aguarde "Success" ✅
```

#### **Migration 013 - Jobs (3 tabelas)**

```
1. Abra: supabase/migrations/013_jobs_schema.sql
2. Copie TODO o conteúdo
3. No SQL Editor: New Query → Cole → Run
4. Aguarde "Success" ✅
```

#### **Migration 014 - Moodle (4 tabelas)**

```
1. Abra: supabase/migrations/014_moodle_integration_schema.sql
2. Copie TODO o conteúdo
3. No SQL Editor: New Query → Cole → Run
4. Aguarde "Success" ✅
```

---

### **Passo 3: Verificar se Tudo Foi Criado**

No SQL Editor, execute:

```sql
-- Copie e cole este script:
-- (do arquivo: supabase/scripts/01_check_all_tables.sql)

WITH expected_tables AS (
  SELECT unnest(ARRAY[
    'trial_accounts', 'organizations', 'users', 'user_permissions',
    'forms', 'form_submissions', 'content',
    'audit_logs', 'notifications', 'user_notification_preferences',
    'courses', 'enrollments', 'user_progress', 'activity_logs',
    'webhook_events', 'webhook_subscriptions', 'webhook_delivery_logs',
    'jobs', 'job_logs', 'scheduled_jobs',
    'moodle_configurations', 'moodle_sync_logs', 'moodle_entity_mappings', 'moodle_sync_errors'
  ]) AS table_name
),
existing_tables AS (
  SELECT tablename AS table_name
  FROM pg_tables
  WHERE schemaname = 'public'
)
SELECT
  COUNT(DISTINCT e.table_name) AS total_esperado,
  COUNT(DISTINCT ex.table_name) AS total_criado,
  COUNT(DISTINCT e.table_name) - COUNT(DISTINCT ex.table_name) AS faltam,
  CASE
    WHEN COUNT(DISTINCT e.table_name) = COUNT(DISTINCT ex.table_name) THEN '✅ TODAS AS TABELAS CRIADAS!'
    ELSE '⚠️ FALTAM TABELAS'
  END AS resultado
FROM expected_tables e
LEFT JOIN existing_tables ex ON e.table_name = ex.table_name;
```

**Resultado Esperado:**

```json
{
  "total_esperado": 24,
  "total_criado": 24,
  "faltam": 0,
  "resultado": "✅ TODAS AS TABELAS CRIADAS!"
}
```

---

## 🐛 **Possíveis Erros**

### **Erro: "relation already exists"**

✅ Ignore! Significa que a tabela já foi criada. Continue com a próxima.

### **Erro: "column does not exist"**

⚠️ Você pulou uma migration. Execute na ordem: 004 → 010 → 011 → 012 → 013 → 014

### **Erro: "permission denied"**

⚠️ Certifique-se de estar no **SQL Editor do Supabase Dashboard** (não via backend).

---

## ✅ **Checklist de Execução**

- [ ] Migration 004 - Dashboard (notifications, user_notification_preferences)
- [ ] Migration 010 - Courses (courses, enrollments)
- [ ] Migration 011 - Progress (user_progress, activity_logs)
- [ ] Migration 012 - Webhooks (webhook_events, webhook_subscriptions, webhook_delivery_logs)
- [ ] Migration 013 - Jobs (jobs, job_logs, scheduled_jobs)
- [ ] Migration 014 - Moodle (moodle_configurations, moodle_sync_logs, moodle_entity_mappings, moodle_sync_errors)
- [ ] Verificação final: 24/24 tabelas ✅

---

## 🎯 **Após Concluir**

1. ✅ Execute: `npm run start:dev`
2. ✅ Teste: `curl http://localhost:4000/api/v1/health`
3. ✅ Swagger: http://localhost:4000/api/docs

---

**Qualquer dúvida, me avise! 🚀**

