-- =====================================================
-- CONTAGEM DE REGISTROS: Todas as Tabelas
-- =====================================================
-- Mostra quantos registros existem em cada tabela
-- =====================================================

-- Função auxiliar para contagem segura
DO $$
DECLARE
  table_record RECORD;
  row_count INTEGER;
  result_text TEXT := '';
BEGIN
  result_text := result_text || E'TABELA                          | REGISTROS | CATEGORIA\n';
  result_text := result_text || E'================================|===========|==============\n';
  
  -- Core
  FOR table_record IN 
    SELECT unnest(ARRAY['trial_accounts', 'organizations', 'users', 'user_permissions']) AS tbl, '🔐 Core' AS cat
  LOOP
    BEGIN
      EXECUTE format('SELECT COUNT(*) FROM %I', table_record.tbl) INTO row_count;
      result_text := result_text || RPAD(table_record.tbl, 32) || '| ' || LPAD(row_count::TEXT, 9) || ' | ' || table_record.cat || E'\n';
    EXCEPTION WHEN OTHERS THEN
      result_text := result_text || RPAD(table_record.tbl, 32) || '| ' || LPAD('ERROR', 9) || ' | ' || table_record.cat || E'\n';
    END;
  END LOOP;

  -- Content & Forms
  FOR table_record IN 
    SELECT unnest(ARRAY['forms', 'form_submissions', 'content']) AS tbl, '📝 Content' AS cat
  LOOP
    BEGIN
      EXECUTE format('SELECT COUNT(*) FROM %I', table_record.tbl) INTO row_count;
      result_text := result_text || RPAD(table_record.tbl, 32) || '| ' || LPAD(row_count::TEXT, 9) || ' | ' || table_record.cat || E'\n';
    EXCEPTION WHEN OTHERS THEN
      result_text := result_text || RPAD(table_record.tbl, 32) || '| ' || LPAD('ERROR', 9) || ' | ' || table_record.cat || E'\n';
    END;
  END LOOP;

  -- Dashboard & Notifications
  FOR table_record IN 
    SELECT unnest(ARRAY['audit_logs', 'notifications', 'user_notification_preferences']) AS tbl, '📊 Dashboard' AS cat
  LOOP
    BEGIN
      EXECUTE format('SELECT COUNT(*) FROM %I', table_record.tbl) INTO row_count;
      result_text := result_text || RPAD(table_record.tbl, 32) || '| ' || LPAD(row_count::TEXT, 9) || ' | ' || table_record.cat || E'\n';
    EXCEPTION WHEN OTHERS THEN
      result_text := result_text || RPAD(table_record.tbl, 32) || '| ' || LPAD('ERROR', 9) || ' | ' || table_record.cat || E'\n';
    END;
  END LOOP;

  -- Courses & Progress
  FOR table_record IN 
    SELECT unnest(ARRAY['courses', 'enrollments', 'user_progress', 'activity_logs']) AS tbl, '🎓 Courses' AS cat
  LOOP
    BEGIN
      EXECUTE format('SELECT COUNT(*) FROM %I', table_record.tbl) INTO row_count;
      result_text := result_text || RPAD(table_record.tbl, 32) || '| ' || LPAD(row_count::TEXT, 9) || ' | ' || table_record.cat || E'\n';
    EXCEPTION WHEN OTHERS THEN
      result_text := result_text || RPAD(table_record.tbl, 32) || '| ' || LPAD('ERROR', 9) || ' | ' || table_record.cat || E'\n';
    END;
  END LOOP;

  -- Webhooks
  FOR table_record IN 
    SELECT unnest(ARRAY['webhook_events', 'webhook_subscriptions', 'webhook_delivery_logs']) AS tbl, '🔗 Webhooks' AS cat
  LOOP
    BEGIN
      EXECUTE format('SELECT COUNT(*) FROM %I', table_record.tbl) INTO row_count;
      result_text := result_text || RPAD(table_record.tbl, 32) || '| ' || LPAD(row_count::TEXT, 9) || ' | ' || table_record.cat || E'\n';
    EXCEPTION WHEN OTHERS THEN
      result_text := result_text || RPAD(table_record.tbl, 32) || '| ' || LPAD('ERROR', 9) || ' | ' || table_record.cat || E'\n';
    END;
  END LOOP;

  -- Jobs
  FOR table_record IN 
    SELECT unnest(ARRAY['jobs', 'job_logs', 'scheduled_jobs']) AS tbl, '⚙️ Jobs' AS cat
  LOOP
    BEGIN
      EXECUTE format('SELECT COUNT(*) FROM %I', table_record.tbl) INTO row_count;
      result_text := result_text || RPAD(table_record.tbl, 32) || '| ' || LPAD(row_count::TEXT, 9) || ' | ' || table_record.cat || E'\n';
    EXCEPTION WHEN OTHERS THEN
      result_text := result_text || RPAD(table_record.tbl, 32) || '| ' || LPAD('ERROR', 9) || ' | ' || table_record.cat || E'\n';
    END;
  END LOOP;

  -- Moodle Integration
  FOR table_record IN 
    SELECT unnest(ARRAY['moodle_configurations', 'moodle_sync_logs', 'moodle_entity_mappings', 'moodle_sync_errors']) AS tbl, '🔌 Moodle' AS cat
  LOOP
    BEGIN
      EXECUTE format('SELECT COUNT(*) FROM %I', table_record.tbl) INTO row_count;
      result_text := result_text || RPAD(table_record.tbl, 32) || '| ' || LPAD(row_count::TEXT, 9) || ' | ' || table_record.cat || E'\n';
    EXCEPTION WHEN OTHERS THEN
      result_text := result_text || RPAD(table_record.tbl, 32) || '| ' || LPAD('ERROR', 9) || ' | ' || table_record.cat || E'\n';
    END;
  END LOOP;

  RAISE NOTICE '%', result_text;
END $$;

-- =====================================================
-- ALTERNATIVA: Se o script acima não funcionar,
-- execute manualmente cada SELECT abaixo:
-- =====================================================

-- Core
-- SELECT 'trial_accounts' AS tabela, COUNT(*) AS registros FROM trial_accounts;
-- SELECT 'organizations' AS tabela, COUNT(*) AS registros FROM organizations;
-- SELECT 'users' AS tabela, COUNT(*) AS registros FROM users;
-- SELECT 'user_permissions' AS tabela, COUNT(*) AS registros FROM user_permissions;

-- Content
-- SELECT 'forms' AS tabela, COUNT(*) AS registros FROM forms;
-- SELECT 'form_submissions' AS tabela, COUNT(*) AS registros FROM form_submissions;
-- SELECT 'content' AS tabela, COUNT(*) AS registros FROM content;

-- Dashboard
-- SELECT 'audit_logs' AS tabela, COUNT(*) AS registros FROM audit_logs;
-- SELECT 'notifications' AS tabela, COUNT(*) AS registros FROM notifications;
-- SELECT 'user_notification_preferences' AS tabela, COUNT(*) AS registros FROM user_notification_preferences;

-- Courses
-- SELECT 'courses' AS tabela, COUNT(*) AS registros FROM courses;
-- SELECT 'enrollments' AS tabela, COUNT(*) AS registros FROM enrollments;
-- SELECT 'user_progress' AS tabela, COUNT(*) AS registros FROM user_progress;
-- SELECT 'activity_logs' AS tabela, COUNT(*) AS registros FROM activity_logs;

-- Webhooks
-- SELECT 'webhook_events' AS tabela, COUNT(*) AS registros FROM webhook_events;
-- SELECT 'webhook_subscriptions' AS tabela, COUNT(*) AS registros FROM webhook_subscriptions;
-- SELECT 'webhook_delivery_logs' AS tabela, COUNT(*) AS registros FROM webhook_delivery_logs;

-- Jobs
-- SELECT 'jobs' AS tabela, COUNT(*) AS registros FROM jobs;
-- SELECT 'job_logs' AS tabela, COUNT(*) AS registros FROM job_logs;
-- SELECT 'scheduled_jobs' AS tabela, COUNT(*) AS registros FROM scheduled_jobs;

-- Moodle
-- SELECT 'moodle_configurations' AS tabela, COUNT(*) AS registros FROM moodle_configurations;
-- SELECT 'moodle_sync_logs' AS tabela, COUNT(*) AS registros FROM moodle_sync_logs;
-- SELECT 'moodle_entity_mappings' AS tabela, COUNT(*) AS registros FROM moodle_entity_mappings;
-- SELECT 'moodle_sync_errors' AS tabela, COUNT(*) AS registros FROM moodle_sync_errors;


