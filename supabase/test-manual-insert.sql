-- =====================================================
-- TESTE MANUAL: Insert em Organizations
-- =====================================================
-- Este script testa se conseguimos inserir dados
-- manualmente nas tabelas, sem passar pelo código Node
-- =====================================================

-- =====================================================
-- 1. Criar um trial_account de teste
-- =====================================================
INSERT INTO trial_accounts (
    company_name,
    trial_starts_at,
    trial_ends_at,
    status
)
VALUES (
    'Teste Manual SQL',
    NOW(),
    NOW() + INTERVAL '7 days',
    'trial'
)
RETURNING *;

-- COPIE O ID RETORNADO ACIMA E USE NAS PRÓXIMAS QUERIES!
-- Exemplo: 352e3065-e276-44ea-92e1-4acf5970f43

-- =====================================================
-- 2. Testar insert em organizations
-- =====================================================
-- SUBSTITUA [ID-DO-TRIAL-ACCOUNT] pelo ID copiado acima
INSERT INTO organizations (
    trial_account_id,
    name,
    slug,
    is_active
)
VALUES (
    '[ID-DO-TRIAL-ACCOUNT]', -- ← SUBSTITUA AQUI
    'Organização Teste SQL',
    'organizacao-teste-sql',
    true
)
RETURNING *;

-- =====================================================
-- 3. Testar insert em users
-- =====================================================
-- SUBSTITUA os IDs conforme necessário
INSERT INTO users (
    organization_id,
    trial_account_id,
    auth_user_id,
    email,
    first_name,
    last_name,
    role,
    is_trial_owner,
    is_active
)
VALUES (
    '[ID-DA-ORGANIZATION]', -- ← ID da organization criada acima
    '[ID-DO-TRIAL-ACCOUNT]', -- ← Mesmo ID do trial_account
    'b086eecb-7fc5-427f6-a944-bbce827ec7f2', -- ← ID do auth.users (do Supabase Auth)
    'teste-sql@escola.com',
    'Teste',
    'SQL',
    'admin',
    true,
    true
)
RETURNING *;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Se todos os 3 INSERTs funcionarem:
--   ✅ O problema está no código Node.js
--   ✅ Provavelmente é o token de autenticação
--
-- Se algum INSERT falhar:
--   ❌ Você verá o erro exato do PostgreSQL
--   ❌ Pode ser:
--      - Campo obrigatório faltando
--      - Problema de RLS
--      - Foreign key inválida
--      - Trigger falhando
-- =====================================================

-- =====================================================
-- 4. LIMPEZA: Remover dados de teste
-- =====================================================
-- Execute APENAS se você quiser limpar os dados de teste
-- DELETE FROM users WHERE email = 'teste-sql@escola.com';
-- DELETE FROM organizations WHERE slug = 'organizacao-teste-sql';
-- DELETE FROM trial_accounts WHERE company_name = 'Teste Manual SQL';
-- =====================================================

