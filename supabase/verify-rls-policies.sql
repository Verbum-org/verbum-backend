-- =====================================================
-- SCRIPT DE VERIFICAÇÃO: Políticas RLS
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- para verificar quais políticas RLS estão ativas
-- =====================================================

-- Listar TODAS as políticas RLS ativas
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
ORDER BY
    tablename, policyname;

-- =====================================================
-- Verificar status de RLS por tabela
-- =====================================================
SELECT
    schemaname AS schema,
    tablename AS tabela,
    rowsecurity AS rls_habilitado
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
    tablename;

-- =====================================================
-- RESULTADO ESPERADO (após executar migration 006):
-- =====================================================
-- Todas as tabelas devem ter:
-- - rls_habilitado = TRUE
-- - Apenas 1 política simples por tabela
-- - Políticas com USING (true) e WITH CHECK (true)
-- =====================================================

