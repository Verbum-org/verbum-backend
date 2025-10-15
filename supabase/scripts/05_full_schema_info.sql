-- =====================================================
-- INFORMAÇÕES COMPLETAS: Schema do Banco
-- =====================================================
-- Mostra estrutura detalhada de todas as tabelas
-- =====================================================

-- 1️⃣ Listar todas as colunas de cada tabela
SELECT
  t.tablename AS tabela,
  c.column_name AS coluna,
  c.data_type AS tipo,
  c.character_maximum_length AS tamanho_maximo,
  c.is_nullable AS permite_null,
  c.column_default AS valor_padrao,
  CASE 
    WHEN pk.constraint_type = 'PRIMARY KEY' THEN '🔑 PK'
    WHEN fk.constraint_type = 'FOREIGN KEY' THEN '🔗 FK'
    WHEN uc.constraint_type = 'UNIQUE' THEN '⭐ UNIQUE'
    ELSE ''
  END AS constraint_tipo
FROM pg_tables t
JOIN information_schema.columns c 
  ON c.table_schema = t.schemaname 
  AND c.table_name = t.tablename
LEFT JOIN information_schema.table_constraints pk
  ON pk.table_schema = c.table_schema
  AND pk.table_name = c.table_name
  AND pk.constraint_type = 'PRIMARY KEY'
LEFT JOIN information_schema.constraint_column_usage ccu_pk
  ON ccu_pk.constraint_name = pk.constraint_name
  AND ccu_pk.column_name = c.column_name
LEFT JOIN information_schema.table_constraints fk
  ON fk.table_schema = c.table_schema
  AND fk.table_name = c.table_name
  AND fk.constraint_type = 'FOREIGN KEY'
LEFT JOIN information_schema.constraint_column_usage ccu_fk
  ON ccu_fk.constraint_name = fk.constraint_name
  AND ccu_fk.column_name = c.column_name
LEFT JOIN information_schema.table_constraints uc
  ON uc.table_schema = c.table_schema
  AND uc.table_name = c.table_name
  AND uc.constraint_type = 'UNIQUE'
LEFT JOIN information_schema.constraint_column_usage ccu_uc
  ON ccu_uc.constraint_name = uc.constraint_name
  AND ccu_uc.column_name = c.column_name
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'trial_accounts', 'organizations', 'users', 'user_permissions',
    'forms', 'form_submissions', 'content',
    'audit_logs', 'notifications', 'user_notification_preferences',
    'courses', 'enrollments', 'user_progress', 'activity_logs',
    'webhook_events', 'webhook_subscriptions', 'webhook_delivery_logs',
    'jobs', 'job_logs', 'scheduled_jobs',
    'moodle_configurations', 'moodle_sync_logs', 'moodle_entity_mappings', 'moodle_sync_errors'
  )
ORDER BY t.tablename, c.ordinal_position;

-- =====================================================
-- 2️⃣ Índices em cada tabela
-- =====================================================
SELECT
  schemaname AS schema,
  tablename AS tabela,
  indexname AS indice,
  indexdef AS definicao
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'trial_accounts', 'organizations', 'users', 'user_permissions',
    'forms', 'form_submissions', 'content',
    'audit_logs', 'notifications', 'user_notification_preferences',
    'courses', 'enrollments', 'user_progress', 'activity_logs',
    'webhook_events', 'webhook_subscriptions', 'webhook_delivery_logs',
    'jobs', 'job_logs', 'scheduled_jobs',
    'moodle_configurations', 'moodle_sync_logs', 'moodle_entity_mappings', 'moodle_sync_errors'
  )
ORDER BY tablename, indexname;

-- =====================================================
-- 3️⃣ Foreign Keys (Relacionamentos)
-- =====================================================
SELECT
  tc.table_name AS tabela_origem,
  kcu.column_name AS coluna_origem,
  ccu.table_name AS tabela_destino,
  ccu.column_name AS coluna_destino,
  rc.update_rule AS on_update,
  rc.delete_rule AS on_delete
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
    'trial_accounts', 'organizations', 'users', 'user_permissions',
    'forms', 'form_submissions', 'content',
    'audit_logs', 'notifications', 'user_notification_preferences',
    'courses', 'enrollments', 'user_progress', 'activity_logs',
    'webhook_events', 'webhook_subscriptions', 'webhook_delivery_logs',
    'jobs', 'job_logs', 'scheduled_jobs',
    'moodle_configurations', 'moodle_sync_logs', 'moodle_entity_mappings', 'moodle_sync_errors'
  )
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 4️⃣ Triggers
-- =====================================================
SELECT
  event_object_table AS tabela,
  trigger_name AS trigger,
  event_manipulation AS evento,
  action_statement AS acao
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN (
    'trial_accounts', 'organizations', 'users', 'user_permissions',
    'forms', 'form_submissions', 'content',
    'audit_logs', 'notifications', 'user_notification_preferences',
    'courses', 'enrollments', 'user_progress', 'activity_logs',
    'webhook_events', 'webhook_subscriptions', 'webhook_delivery_logs',
    'jobs', 'job_logs', 'scheduled_jobs',
    'moodle_configurations', 'moodle_sync_logs', 'moodle_entity_mappings', 'moodle_sync_errors'
  )
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 5️⃣ Tamanho das Tabelas (em disco)
-- =====================================================
SELECT
  schemaname AS schema,
  tablename AS tabela,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamanho_total,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS tamanho_dados,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS tamanho_indices
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'trial_accounts', 'organizations', 'users', 'user_permissions',
    'forms', 'form_submissions', 'content',
    'audit_logs', 'notifications', 'user_notification_preferences',
    'courses', 'enrollments', 'user_progress', 'activity_logs',
    'webhook_events', 'webhook_subscriptions', 'webhook_delivery_logs',
    'jobs', 'job_logs', 'scheduled_jobs',
    'moodle_configurations', 'moodle_sync_logs', 'moodle_entity_mappings', 'moodle_sync_errors'
  )
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;


