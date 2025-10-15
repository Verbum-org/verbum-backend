-- =====================================================
-- IDENTIFICAR: Quais Tabelas Estão Faltando
-- =====================================================
-- Este script mostra EXATAMENTE quais tabelas faltam
-- =====================================================

WITH expected_tables AS (
  SELECT 
    table_name,
    category,
    migration_file
  FROM (VALUES
    -- Core (Migration 001-009)
    ('trial_accounts', '🔐 Core', '001-009'),
    ('organizations', '🔐 Core', '001-009'),
    ('users', '🔐 Core', '001-009'),
    ('user_permissions', '🔐 Core', '001-009'),
    
    -- Content & Forms (Migration 001-009)
    ('forms', '📝 Content', '001-009'),
    ('form_submissions', '📝 Content', '001-009'),
    ('content', '📝 Content', '001-009'),
    
    -- Dashboard & Notifications (Migration 004)
    ('audit_logs', '📊 Dashboard', '004'),
    ('notifications', '📊 Dashboard', '004'),
    ('user_notification_preferences', '📊 Dashboard', '004'),
    
    -- Courses & Progress (Migration 010-011)
    ('courses', '🎓 Courses', '010'),
    ('enrollments', '🎓 Courses', '010'),
    ('user_progress', '🎓 Courses', '011'),
    ('activity_logs', '🎓 Courses', '011'),
    
    -- Webhooks (Migration 012)
    ('webhook_events', '🔗 Webhooks', '012'),
    ('webhook_subscriptions', '🔗 Webhooks', '012'),
    ('webhook_delivery_logs', '🔗 Webhooks', '012'),
    
    -- Jobs (Migration 013)
    ('jobs', '⚙️ Jobs', '013'),
    ('job_logs', '⚙️ Jobs', '013'),
    ('scheduled_jobs', '⚙️ Jobs', '013'),
    
    -- Moodle Integration (Migration 014)
    ('moodle_configurations', '🔌 Moodle', '014'),
    ('moodle_sync_logs', '🔌 Moodle', '014'),
    ('moodle_entity_mappings', '🔌 Moodle', '014'),
    ('moodle_sync_errors', '🔌 Moodle', '014')
  ) AS t(table_name, category, migration_file)
),

existing_tables AS (
  SELECT tablename AS table_name
  FROM pg_tables
  WHERE schemaname = 'public'
)

-- Mostrar quais tabelas EXISTEM e FALTAM
SELECT * FROM (
  SELECT 
    '✅ EXISTENTE' AS status,
    e.table_name AS tabela,
    e.category AS categoria,
    e.migration_file AS migration
  FROM expected_tables e
  INNER JOIN existing_tables ex ON e.table_name = ex.table_name

  UNION ALL

  SELECT 
    '❌ FALTANDO' AS status,
    e.table_name AS tabela,
    e.category AS categoria,
    e.migration_file AS migration
  FROM expected_tables e
  LEFT JOIN existing_tables ex ON e.table_name = ex.table_name
  WHERE ex.table_name IS NULL
) AS all_tables
ORDER BY 
  CASE status 
    WHEN '✅ EXISTENTE' THEN 1 
    WHEN '❌ FALTANDO' THEN 2 
  END,
  categoria, 
  tabela;

-- =====================================================
-- RESUMO POR CATEGORIA
-- =====================================================
WITH expected_tables AS (
  SELECT 
    table_name,
    category
  FROM (VALUES
    ('trial_accounts', '🔐 Core'),
    ('organizations', '🔐 Core'),
    ('users', '🔐 Core'),
    ('user_permissions', '🔐 Core'),
    ('forms', '📝 Content'),
    ('form_submissions', '📝 Content'),
    ('content', '📝 Content'),
    ('audit_logs', '📊 Dashboard'),
    ('notifications', '📊 Dashboard'),
    ('user_notification_preferences', '📊 Dashboard'),
    ('courses', '🎓 Courses'),
    ('enrollments', '🎓 Courses'),
    ('user_progress', '🎓 Courses'),
    ('activity_logs', '🎓 Courses'),
    ('webhook_events', '🔗 Webhooks'),
    ('webhook_subscriptions', '🔗 Webhooks'),
    ('webhook_delivery_logs', '🔗 Webhooks'),
    ('jobs', '⚙️ Jobs'),
    ('job_logs', '⚙️ Jobs'),
    ('scheduled_jobs', '⚙️ Jobs'),
    ('moodle_configurations', '🔌 Moodle'),
    ('moodle_sync_logs', '🔌 Moodle'),
    ('moodle_entity_mappings', '🔌 Moodle'),
    ('moodle_sync_errors', '🔌 Moodle')
  ) AS t(table_name, category)
),
existing_tables AS (
  SELECT tablename AS table_name
  FROM pg_tables
  WHERE schemaname = 'public'
)
SELECT 
  category AS categoria,
  COUNT(*) AS total_esperado,
  COUNT(ex.table_name) AS existentes,
  COUNT(*) - COUNT(ex.table_name) AS faltando,
  CASE 
    WHEN COUNT(*) = COUNT(ex.table_name) THEN '✅ COMPLETO'
    ELSE '⚠️ INCOMPLETO'
  END AS status
FROM expected_tables e
LEFT JOIN existing_tables ex ON e.table_name = ex.table_name
GROUP BY category
ORDER BY 
  CASE 
    WHEN COUNT(*) = COUNT(ex.table_name) THEN 1
    ELSE 0
  END,
  category;

