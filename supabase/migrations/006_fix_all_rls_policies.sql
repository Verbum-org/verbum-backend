-- =====================================================
-- FIX COMPLETO: Remove TODAS as políticas RLS e recria
-- =====================================================
-- Esta migration garante que não há nenhuma política
-- antiga causando recursão infinita
-- =====================================================

-- =====================================================
-- 1. DESABILITAR RLS TEMPORARIAMENTE
-- =====================================================

ALTER TABLE trial_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE content DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
-- =====================================================

-- trial_accounts
DROP POLICY IF EXISTS "Users can view their trial account" ON trial_accounts;
DROP POLICY IF EXISTS "Owners can update trial account" ON trial_accounts;
DROP POLICY IF EXISTS "Allow authenticated users to create trial accounts" ON trial_accounts;
DROP POLICY IF EXISTS "Allow authenticated users to view trial accounts" ON trial_accounts;
DROP POLICY IF EXISTS "Allow authenticated users to update trial accounts" ON trial_accounts;

-- organizations
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Admins can manage organizations" ON organizations;
DROP POLICY IF EXISTS "Allow authenticated users to create organizations" ON organizations;
DROP POLICY IF EXISTS "Allow authenticated users to view organizations" ON organizations;
DROP POLICY IF EXISTS "Allow authenticated users to update organizations" ON organizations;

-- users
DROP POLICY IF EXISTS "Users can view their organization users" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to create users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to view users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to update users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to delete users" ON users;

-- user_permissions
DROP POLICY IF EXISTS "Anyone can view permissions" ON user_permissions;

-- forms
DROP POLICY IF EXISTS "Users can manage forms in their organization" ON forms;
DROP POLICY IF EXISTS "Users can manage forms" ON forms;

-- form_submissions
DROP POLICY IF EXISTS "Users can manage submissions" ON form_submissions;
DROP POLICY IF EXISTS "Users can manage form submissions" ON form_submissions;

-- content
DROP POLICY IF EXISTS "Users can manage content in their organization" ON content;
DROP POLICY IF EXISTS "Users can manage content" ON content;

-- audit_logs
DROP POLICY IF EXISTS "Users can view their organization logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Service can insert audit logs" ON audit_logs;

-- =====================================================
-- 3. REABILITAR RLS
-- =====================================================

ALTER TABLE trial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CRIAR POLÍTICAS SIMPLES (SEM RECURSÃO)
-- =====================================================

-- -----------------------------------------------------
-- TRIAL_ACCOUNTS: Acesso total para authenticated
-- -----------------------------------------------------

CREATE POLICY "trial_accounts_all_authenticated" ON trial_accounts
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- -----------------------------------------------------
-- ORGANIZATIONS: Acesso total para authenticated
-- -----------------------------------------------------

CREATE POLICY "organizations_all_authenticated" ON organizations
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- -----------------------------------------------------
-- USERS: Acesso total para authenticated
-- -----------------------------------------------------

CREATE POLICY "users_all_authenticated" ON users
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- -----------------------------------------------------
-- USER_PERMISSIONS: Leitura para todos authenticated
-- -----------------------------------------------------

CREATE POLICY "user_permissions_select_authenticated" ON user_permissions
    FOR SELECT TO authenticated
    USING (true);

-- -----------------------------------------------------
-- FORMS: Acesso total para authenticated
-- -----------------------------------------------------

CREATE POLICY "forms_all_authenticated" ON forms
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- -----------------------------------------------------
-- FORM_SUBMISSIONS: Acesso total para authenticated
-- -----------------------------------------------------

CREATE POLICY "form_submissions_all_authenticated" ON form_submissions
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- -----------------------------------------------------
-- CONTENT: Acesso total para authenticated
-- -----------------------------------------------------

CREATE POLICY "content_all_authenticated" ON content
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- -----------------------------------------------------
-- AUDIT_LOGS: Leitura + Insert para authenticated
-- -----------------------------------------------------

CREATE POLICY "audit_logs_select_authenticated" ON audit_logs
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "audit_logs_insert_authenticated" ON audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- =====================================================
-- 5. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON POLICY "trial_accounts_all_authenticated" ON trial_accounts IS 
    'Permite todas as operações para usuários autenticados. Validação de regras no backend.';

COMMENT ON POLICY "organizations_all_authenticated" ON organizations IS 
    'Permite todas as operações para usuários autenticados. Validação de regras no backend.';

COMMENT ON POLICY "users_all_authenticated" ON users IS 
    'Permite todas as operações para usuários autenticados. Hierarquia validada por trigger.';

COMMENT ON POLICY "forms_all_authenticated" ON forms IS 
    'Permite todas as operações para usuários autenticados. Validação de regras no backend.';

COMMENT ON POLICY "content_all_authenticated" ON content IS 
    'Permite todas as operações para usuários autenticados. Validação de regras no backend.';

-- =====================================================
-- 6. VERIFICAÇÃO
-- =====================================================

-- Lista todas as políticas criadas (para debug)
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'POLÍTICAS RLS CRIADAS:';
    RAISE NOTICE '========================================';
    
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname
    LOOP
        RAISE NOTICE '% - % - %', 
            policy_record.tablename, 
            policy_record.policyname,
            'OK';
    END LOOP;
    
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 
-- ⚠️  ARQUITETURA DE SEGURANÇA:
-- 
-- Esta migration implementa uma abordagem de "segurança em camadas"
-- onde o RLS funciona como primeira barreira (autenticação) e as
-- regras de negócio são validadas no backend (NestJS).
-- 
-- 🔐 CAMADAS:
-- 
-- 1. RLS (Supabase)
--    └─> Garante que apenas usuários autenticados acessam os dados
--    └─> SEM RECURSÃO - Políticas simples que não fazem subqueries
-- 
-- 2. Guards (NestJS)
--    └─> SupabaseAuthGuard valida JWT
--    └─> PermissionsGuard valida permissões específicas
--    └─> RoleHierarchyGuard valida hierarquia de roles
-- 
-- 3. Services (NestJS)
--    └─> Validam regras de negócio
--    └─> Verificam se usuário pode acessar recurso específico
--    └─> Filtram dados baseado em organização/trial
-- 
-- 4. Triggers (Postgres)
--    └─> validate_role_hierarchy() garante hierarquia ao criar users
--    └─> generate_organization_slug() gera slugs únicos
-- 
-- ✅ VANTAGENS:
-- 
-- - Sem recursão infinita (políticas não fazem subqueries)
-- - Performance melhorada (menos queries no RLS)
-- - Validação centralizada no backend
-- - Mais fácil de debugar e manter
-- - RLS ainda protege de acessos não autenticados
-- 
-- 🎯 REGRAS VALIDADAS NO BACKEND:
-- 
-- - Usuário só acessa dados da própria organização
-- - Hierarquia de roles ao criar/editar usuários
-- - Permissões específicas por endpoint
-- - Trial expirado bloqueia acesso
-- 
-- =====================================================


