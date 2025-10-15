-- =====================================================
-- FORCE CLEAN: Remove TODAS as políticas (antigas + novas)
-- =====================================================
-- Esta migration é mais agressiva e remove TUDO
-- =====================================================

-- =====================================================
-- 1. DESABILITAR RLS EM TODAS AS TABELAS
-- =====================================================
ALTER TABLE IF EXISTS trial_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS form_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. REMOVER **TODAS** AS POLÍTICAS (ANTIGAS + NOVAS)
-- =====================================================

-- trial_accounts
DROP POLICY IF EXISTS "Allow public trial account creation" ON trial_accounts;
DROP POLICY IF EXISTS "trial_accounts_all_authenticated" ON trial_accounts;
DROP POLICY IF EXISTS "Users can view their trial account" ON trial_accounts;
DROP POLICY IF EXISTS "Owners can update trial account" ON trial_accounts;

-- organizations
DROP POLICY IF EXISTS "Admin and diretoria can update organization" ON organizations;
DROP POLICY IF EXISTS "Allow organization creation during registration" ON organizations;
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "organizations_all_authenticated" ON organizations;
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Admins can manage organizations" ON organizations;

-- users
DROP POLICY IF EXISTS "Admins can create users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "users_all_authenticated" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;

-- user_permissions
DROP POLICY IF EXISTS "user_permissions_select_authenticated" ON user_permissions;
DROP POLICY IF EXISTS "Anyone can view permissions" ON user_permissions;

-- forms
DROP POLICY IF EXISTS "Authorized users can create forms" ON forms;
DROP POLICY IF EXISTS "Form creators can update their forms" ON forms;
DROP POLICY IF EXISTS "Users can view forms in their organization" ON forms;
DROP POLICY IF EXISTS "forms_all_authenticated" ON forms;
DROP POLICY IF EXISTS "Users can manage forms in their organization" ON forms;
DROP POLICY IF EXISTS "Users can manage forms" ON forms;

-- form_submissions
DROP POLICY IF EXISTS "Anyone can submit forms" ON form_submissions;
DROP POLICY IF EXISTS "Users can view submissions in their organization" ON form_submissions;
DROP POLICY IF EXISTS "form_submissions_all_authenticated" ON form_submissions;
DROP POLICY IF EXISTS "Users can manage submissions" ON form_submissions;
DROP POLICY IF EXISTS "Users can manage form submissions" ON form_submissions;

-- content
DROP POLICY IF EXISTS "Authorized users can upload content" ON content;
DROP POLICY IF EXISTS "Users can view content in their organization" ON content;
DROP POLICY IF EXISTS "content_all_authenticated" ON content;
DROP POLICY IF EXISTS "Users can manage content in their organization" ON content;

-- audit_logs
DROP POLICY IF EXISTS "Users can view logs in their organization" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_authenticated" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_select_authenticated" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_all_authenticated" ON audit_logs;
DROP POLICY IF EXISTS "Audit logs can be inserted by system" ON audit_logs;

-- =====================================================
-- 3. VERIFICAR QUE NÃO HÁ MAIS POLÍTICAS
-- =====================================================
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN (
        'trial_accounts',
        'organizations',
        'users',
        'user_permissions',
        'forms',
        'form_submissions',
        'content',
        'audit_logs'
    );
    
    IF policy_count > 0 THEN
        RAISE NOTICE 'AVISO: Ainda existem % políticas!', policy_count;
    ELSE
        RAISE NOTICE 'OK: Todas as políticas foram removidas!';
    END IF;
END
$$;

-- =====================================================
-- 4. REABILITAR RLS EM TODAS AS TABELAS
-- =====================================================
ALTER TABLE IF EXISTS trial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CRIAR APENAS AS POLÍTICAS SIMPLES (SEM RECURSÃO)
-- =====================================================

-- trial_accounts
CREATE POLICY "trial_accounts_all_authenticated"
    ON trial_accounts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- organizations
CREATE POLICY "organizations_all_authenticated"
    ON organizations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- users
CREATE POLICY "users_all_authenticated"
    ON users
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- user_permissions
CREATE POLICY "user_permissions_select_authenticated"
    ON user_permissions
    FOR SELECT
    TO authenticated
    USING (true);

-- forms
CREATE POLICY "forms_all_authenticated"
    ON forms
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- form_submissions
CREATE POLICY "form_submissions_all_authenticated"
    ON form_submissions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- content
CREATE POLICY "content_all_authenticated"
    ON content
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- audit_logs
CREATE POLICY "audit_logs_all_authenticated"
    ON audit_logs
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 6. VERIFICAR RESULTADO FINAL
-- =====================================================
SELECT
    schemaname AS schema,
    tablename AS tabela,
    policyname AS politica,
    cmd AS comando,
    CASE 
        WHEN policyname LIKE '%_all_authenticated' THEN '✅ NOVA'
        ELSE '❌ ANTIGA'
    END AS status
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
        'audit_logs'
    )
ORDER BY
    tablename, policyname;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Deve mostrar APENAS 8 políticas, todas com status ✅ NOVA:
--
-- audit_logs         | audit_logs_all_authenticated          | ✅ NOVA
-- content            | content_all_authenticated             | ✅ NOVA
-- form_submissions   | form_submissions_all_authenticated    | ✅ NOVA
-- forms              | forms_all_authenticated               | ✅ NOVA
-- organizations      | organizations_all_authenticated       | ✅ NOVA
-- trial_accounts     | trial_accounts_all_authenticated      | ✅ NOVA
-- user_permissions   | user_permissions_select_authenticated | ✅ NOVA
-- users              | users_all_authenticated               | ✅ NOVA
--
-- TOTAL: 8 políticas ✅
-- SE HOUVER POLÍTICAS COM STATUS ❌ ANTIGA, ALGO ESTÁ ERRADO!
-- =====================================================

