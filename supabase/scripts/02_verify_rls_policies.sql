-- =====================================================
-- VERIFICAÇÃO: Políticas RLS de Todas as Tabelas
-- =====================================================
-- Verifica se RLS está habilitado e se há políticas
-- =====================================================

-- 1️⃣ Status RLS por Tabela
SELECT
  schemaname AS schema,
  tablename AS tabela,
  CASE 
    WHEN rowsecurity = TRUE THEN '✅ RLS HABILITADO'
    ELSE '❌ RLS DESABILITADO'
  END AS status_rls,
  CASE 
    WHEN tablename IN ('trial_accounts', 'organizations', 'users', 'user_permissions') THEN '🔐 Core'
    WHEN tablename IN ('forms', 'form_submissions', 'content') THEN '📝 Content'
    WHEN tablename IN ('audit_logs', 'notifications', 'user_notification_preferences') THEN '📊 Dashboard'
    WHEN tablename IN ('courses', 'enrollments', 'user_progress', 'activity_logs') THEN '🎓 Courses'
    WHEN tablename IN ('webhook_events', 'webhook_subscriptions', 'webhook_delivery_logs') THEN '🔗 Webhooks'
    WHEN tablename IN ('jobs', 'job_logs', 'scheduled_jobs') THEN '⚙️ Jobs'
    WHEN tablename IN ('moodle_configurations', 'moodle_sync_logs', 'moodle_entity_mappings', 'moodle_sync_errors') THEN '🔌 Moodle'
    ELSE '❓ Outro'
  END AS categoria
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    -- Core
    'trial_accounts', 'organizations', 'users', 'user_permissions',
    -- Content
    'forms', 'form_submissions', 'content',
    -- Dashboard
    'audit_logs', 'notifications', 'user_notification_preferences',
    -- Courses
    'courses', 'enrollments', 'user_progress', 'activity_logs',
    -- Webhooks
    'webhook_events', 'webhook_subscriptions', 'webhook_delivery_logs',
    -- Jobs
    'jobs', 'job_logs', 'scheduled_jobs',
    -- Moodle
    'moodle_configurations', 'moodle_sync_logs', 'moodle_entity_mappings', 'moodle_sync_errors'
  )
ORDER BY categoria, tablename;

-- =====================================================
-- 2️⃣ Políticas Existentes
-- =====================================================
SELECT
  schemaname AS schema,
  tablename AS tabela,
  policyname AS politica,
  permissive AS permissivo,
  roles AS roles,
  cmd AS comando,
  CASE 
    WHEN qual = 'true' THEN '✅ USING (true)'
    ELSE SUBSTRING(qual::TEXT, 1, 50) || '...'
  END AS condicao_using,
  CASE 
    WHEN with_check = 'true' THEN '✅ WITH CHECK (true)'
    WHEN with_check IS NULL THEN 'N/A'
    ELSE SUBSTRING(with_check::TEXT, 1, 50) || '...'
  END AS condicao_with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    -- Core
    'trial_accounts', 'organizations', 'users', 'user_permissions',
    -- Content
    'forms', 'form_submissions', 'content',
    -- Dashboard
    'audit_logs', 'notifications', 'user_notification_preferences',
    -- Courses
    'courses', 'enrollments', 'user_progress', 'activity_logs',
    -- Webhooks
    'webhook_events', 'webhook_subscriptions', 'webhook_delivery_logs',
    -- Jobs
    'jobs', 'job_logs', 'scheduled_jobs',
    -- Moodle
    'moodle_configurations', 'moodle_sync_logs', 'moodle_entity_mappings', 'moodle_sync_errors'
  )
ORDER BY tablename, policyname;

-- =====================================================
-- 3️⃣ Tabelas SEM Políticas RLS
-- =====================================================
WITH tables_with_policies AS (
  SELECT DISTINCT tablename
  FROM pg_policies
  WHERE schemaname = 'public'
)
SELECT 
  t.tablename AS tabela_sem_politicas,
  '⚠️ ATENÇÃO: Tabela sem políticas RLS!' AS status
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.rowsecurity = TRUE
  AND t.tablename NOT IN (SELECT tablename FROM tables_with_policies)
  AND t.tablename IN (
    -- Core
    'trial_accounts', 'organizations', 'users', 'user_permissions',
    -- Content
    'forms', 'form_submissions', 'content',
    -- Dashboard
    'audit_logs', 'notifications', 'user_notification_preferences',
    -- Courses
    'courses', 'enrollments', 'user_progress', 'activity_logs',
    -- Webhooks
    'webhook_events', 'webhook_subscriptions', 'webhook_delivery_logs',
    -- Jobs
    'jobs', 'job_logs', 'scheduled_jobs',
    -- Moodle
    'moodle_configurations', 'moodle_sync_logs', 'moodle_entity_mappings', 'moodle_sync_errors'
  );

-- =====================================================
-- 4️⃣ RESUMO
-- =====================================================
WITH rls_summary AS (
  SELECT
    COUNT(*) FILTER (WHERE rowsecurity = TRUE) AS tabelas_com_rls,
    COUNT(*) FILTER (WHERE rowsecurity = FALSE) AS tabelas_sem_rls,
    COUNT(*) AS total_tabelas
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
),
policy_summary AS (
  SELECT COUNT(DISTINCT tablename) AS tabelas_com_politicas
  FROM pg_policies
  WHERE schemaname = 'public'
)
SELECT 
  r.total_tabelas AS "Total de Tabelas",
  r.tabelas_com_rls AS "Com RLS Habilitado",
  r.tabelas_sem_rls AS "Sem RLS",
  p.tabelas_com_politicas AS "Com Políticas",
  CASE 
    WHEN r.tabelas_com_rls = r.total_tabelas 
         AND p.tabelas_com_politicas = r.total_tabelas 
    THEN '✅ TODAS PROTEGIDAS!'
    ELSE '⚠️ ATENÇÃO: Revisar configuração'
  END AS resultado
FROM rls_summary r, policy_summary p;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Total | Com RLS | Sem RLS | Com Políticas | Resultado
-- 24    | 24      | 0       | 24            | ✅ TODAS PROTEGIDAS!
-- =====================================================


