-- =====================================================
-- VERIFICAR: Quais tabelas existem
-- =====================================================
-- Este script verifica quais tabelas da arquitetura V2
-- já foram criadas no banco de dados
-- =====================================================

SELECT 
    tablename AS tabela,
    CASE 
        WHEN tablename IN ('trial_accounts', 'organizations', 'users', 'user_permissions') 
        THEN '✅ ESSENCIAL'
        ELSE '📦 FEATURE'
    END AS status
FROM 
    pg_tables
WHERE 
    schemaname = 'public'
    AND tablename IN (
        'trial_accounts',
        'organizations',
        'users',
        'user_permissions',
        'forms',
        'form_submissions',
        'content',
        'audit_logs',
        'notifications',
        'user_notification_preferences'
    )
ORDER BY 
    CASE 
        WHEN tablename IN ('trial_accounts', 'organizations', 'users', 'user_permissions') THEN 1
        ELSE 2
    END,
    tablename;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Tabelas ESSENCIAIS (devem existir):
--   ✅ trial_accounts
--   ✅ organizations
--   ✅ users
--   ✅ user_permissions
--
-- Tabelas de FEATURES (podem não existir ainda):
--   📦 forms
--   📦 form_submissions
--   📦 content
--   📦 audit_logs
--   📦 notifications
--   📦 user_notification_preferences
-- =====================================================

