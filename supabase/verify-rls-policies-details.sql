-- =====================================================
-- VERIFICAÇÃO DETALHADA: Políticas RLS
-- =====================================================
-- Este script mostra TODAS as políticas com detalhes
-- =====================================================

SELECT
    schemaname AS schema,
    tablename AS tabela,
    policyname AS politica,
    permissive AS permissivo,
    roles AS roles,
    cmd AS comando,
    qual AS condicao_using,
    with_check AS condicao_with_check
FROM
    pg_policies
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
    tablename, policyname;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Cada tabela deve ter apenas 1 política:
-- - trial_accounts_all_authenticated
-- - organizations_all_authenticated
-- - users_all_authenticated
-- - etc...
--
-- Cada política deve ter:
-- - cmd: ALL
-- - roles: {authenticated}
-- - qual: true
-- - with_check: true
-- =====================================================

