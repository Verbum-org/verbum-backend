-- =====================================================
-- FORCE REMOVE: Remove TODAS as políticas antigas
-- =====================================================
-- Este script remove FORÇADAMENTE todas as políticas
-- antigas que estão causando recursão infinita
-- =====================================================

-- =====================================================
-- 1. DESABILITAR RLS EM TODAS AS TABELAS
-- =====================================================
ALTER TABLE trial_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE content DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. REMOVER TODAS AS POLÍTICAS (ANTIGAS E NOVAS)
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
DROP POLICY IF EXISTS "Audit logs can be inserted by system" ON audit_logs;

-- notifications
DROP POLICY IF EXISTS "notifications_all_authenticated" ON notifications;
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;

-- user_notification_preferences
DROP POLICY IF EXISTS "user_notification_preferences_all_authenticated" ON user_notification_preferences;
DROP POLICY IF EXISTS "Users can manage their preferences" ON user_notification_preferences;

-- =====================================================
-- 3. REABILITAR RLS EM TODAS AS TABELAS
-- =====================================================
ALTER TABLE trial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CRIAR APENAS AS POLÍTICAS SIMPLES (SEM RECURSÃO)
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

-- notifications
CREATE POLICY "notifications_all_authenticated"
    ON notifications
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- user_notification_preferences
CREATE POLICY "user_notification_preferences_all_authenticated"
    ON user_notification_preferences
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 5. VERIFICAR RESULTADO
-- =====================================================
SELECT
    schemaname AS schema,
    tablename AS tabela,
    policyname AS politica,
    cmd AS comando
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
-- Cada tabela deve ter APENAS 1 política:
-- - trial_accounts: 1 política
-- - organizations: 1 política
-- - users: 1 política
-- - forms: 1 política
-- - content: 1 política
-- - etc...
--
-- TOTAL: 10 políticas (1 por tabela)
-- =====================================================

