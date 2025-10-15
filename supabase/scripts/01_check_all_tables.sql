-- =====================================================
-- VERIFICAÇÃO COMPLETA: Todas as Tabelas V2.0
-- =====================================================
-- Este script verifica se todas as 24 tabelas da
-- Nova Arquitetura V2.0 foram criadas no Supabase
-- =====================================================

-- Tabelas Esperadas
WITH expected_tables AS (
  SELECT unnest(ARRAY[
    -- Core (4 tabelas)
    'trial_accounts',
    'organizations',
    'users',
    'user_permissions',
    
    -- Content & Forms (3 tabelas)
    'forms',
    'form_submissions',
    'content',
    
    -- Dashboard & Notifications (3 tabelas)
    'audit_logs',
    'notifications',
    'user_notification_preferences',
    
    -- Courses & Progress (4 tabelas)
    'courses',
    'enrollments',
    'user_progress',
    'activity_logs',
    
    -- Webhooks (3 tabelas)
    'webhook_events',
    'webhook_subscriptions',
    'webhook_delivery_logs',
    
    -- Jobs (3 tabelas)
    'jobs',
    'job_logs',
    'scheduled_jobs',
    
    -- Moodle Integration (4 tabelas)
    'moodle_configurations',
    'moodle_sync_logs',
    'moodle_entity_mappings',
    'moodle_sync_errors'
  ]) AS table_name
),

-- Tabelas Existentes
existing_tables AS (
  SELECT tablename AS table_name
  FROM pg_tables
  WHERE schemaname = 'public'
)

-- Comparação
SELECT 
  e.table_name AS tabela,
  CASE 
    WHEN ex.table_name IS NOT NULL THEN '✅ EXISTE'
    ELSE '❌ NÃO EXISTE'
  END AS status,
  CASE 
    WHEN e.table_name IN ('trial_accounts', 'organizations', 'users', 'user_permissions') THEN '🔐 Core'
    WHEN e.table_name IN ('forms', 'form_submissions', 'content') THEN '📝 Content'
    WHEN e.table_name IN ('audit_logs', 'notifications', 'user_notification_preferences') THEN '📊 Dashboard'
    WHEN e.table_name IN ('courses', 'enrollments', 'user_progress', 'activity_logs') THEN '🎓 Courses'
    WHEN e.table_name IN ('webhook_events', 'webhook_subscriptions', 'webhook_delivery_logs') THEN '🔗 Webhooks'
    WHEN e.table_name IN ('jobs', 'job_logs', 'scheduled_jobs') THEN '⚙️ Jobs'
    WHEN e.table_name IN ('moodle_configurations', 'moodle_sync_logs', 'moodle_entity_mappings', 'moodle_sync_errors') THEN '🔌 Moodle'
    ELSE '❓ Outro'
  END AS categoria
FROM expected_tables e
LEFT JOIN existing_tables ex ON e.table_name = ex.table_name
ORDER BY 
  categoria,
  e.table_name;

-- =====================================================
-- TABELAS FALTANDO (se houver)
-- =====================================================
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
  '❌ FALTANDO' AS status,
  e.table_name AS tabela,
  CASE 
    WHEN e.table_name IN ('trial_accounts', 'organizations', 'users', 'user_permissions') THEN '🔐 Core'
    WHEN e.table_name IN ('forms', 'form_submissions', 'content') THEN '📝 Content'
    WHEN e.table_name IN ('audit_logs', 'notifications', 'user_notification_preferences') THEN '📊 Dashboard'
    WHEN e.table_name IN ('courses', 'enrollments', 'user_progress', 'activity_logs') THEN '🎓 Courses'
    WHEN e.table_name IN ('webhook_events', 'webhook_subscriptions', 'webhook_delivery_logs') THEN '🔗 Webhooks'
    WHEN e.table_name IN ('jobs', 'job_logs', 'scheduled_jobs') THEN '⚙️ Jobs'
    WHEN e.table_name IN ('moodle_configurations', 'moodle_sync_logs', 'moodle_entity_mappings', 'moodle_sync_errors') THEN '🔌 Moodle'
    ELSE '❓ Outro'
  END AS categoria,
  CASE 
    WHEN e.table_name IN ('audit_logs') THEN 'Migration 004'
    WHEN e.table_name IN ('notifications', 'user_notification_preferences') THEN 'Migration 004'
    WHEN e.table_name IN ('courses', 'enrollments') THEN 'Migration 010'
    WHEN e.table_name IN ('user_progress', 'activity_logs') THEN 'Migration 011'
    WHEN e.table_name IN ('webhook_events', 'webhook_subscriptions', 'webhook_delivery_logs') THEN 'Migration 012'
    WHEN e.table_name IN ('jobs', 'job_logs', 'scheduled_jobs') THEN 'Migration 013'
    WHEN e.table_name IN ('moodle_configurations', 'moodle_sync_logs', 'moodle_entity_mappings', 'moodle_sync_errors') THEN 'Migration 014'
    ELSE 'Migration 001-009'
  END AS migration_necessaria
FROM expected_tables e
LEFT JOIN existing_tables ex ON e.table_name = ex.table_name
WHERE ex.table_name IS NULL
ORDER BY categoria, e.table_name;

-- =====================================================
-- RESUMO
-- =====================================================
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
    ELSE '⚠️ FALTAM TABELAS - Veja acima quais'
  END AS resultado
FROM expected_tables e
LEFT JOIN existing_tables ex ON e.table_name = ex.table_name;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- total_esperado | total_criado | faltam | resultado
-- 24             | 24           | 0      | ✅ TODAS AS TABELAS CRIADAS!
-- =====================================================


