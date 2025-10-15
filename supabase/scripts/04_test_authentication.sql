-- =====================================================
-- TESTE: Autenticação e Acesso às Tabelas
-- =====================================================
-- Este script testa se é possível inserir e consultar
-- dados com as políticas RLS atuais
-- =====================================================

-- ⚠️ IMPORTANTE: Execute este script como SERVICE ROLE
-- (não como usuário autenticado)
-- =====================================================

-- 1️⃣ Criar uma organização de teste
INSERT INTO organizations (
  name,
  subdomain,
  plan_type,
  plan_status,
  settings
)
VALUES (
  'Org Teste Verificação',
  'teste-verificacao-' || floor(random() * 100000)::text,
  'trial',
  'active',
  '{"test": true}'::jsonb
)
ON CONFLICT (subdomain) DO NOTHING
RETURNING id, name, subdomain, plan_type;

-- ⚠️ IMPORTANTE: Copie o ID da organização retornado acima
-- e substitua 'ORG_ID_AQUI' nas queries abaixo

-- 2️⃣ Criar um usuário de teste
-- Substitua 'ORG_ID_AQUI' pelo ID da organização criada acima
/*
INSERT INTO users (
  organization_id,
  auth_id,
  email,
  full_name,
  role,
  status
)
VALUES (
  'ORG_ID_AQUI', -- ⚠️ Substituir pelo ID real
  gen_random_uuid()::text,
  'teste@verificacao.com',
  'Usuário Teste',
  'admin',
  'active'
)
RETURNING id, email, full_name, role;
*/

-- 3️⃣ Verificar se o usuário foi criado
-- SELECT * FROM users WHERE email = 'teste@verificacao.com';

-- 4️⃣ Criar um curso de teste
/*
INSERT INTO courses (
  organization_id,
  title,
  description,
  status
)
VALUES (
  'ORG_ID_AQUI', -- ⚠️ Substituir pelo ID real
  'Curso de Teste',
  'Este é um curso criado para verificação',
  'published'
)
RETURNING id, title, status;
*/

-- 5️⃣ Verificar se o curso foi criado
-- SELECT * FROM courses WHERE title = 'Curso de Teste';

-- =====================================================
-- LIMPEZA: Remover dados de teste
-- =====================================================
-- Após verificar que tudo funciona, execute:

-- DELETE FROM users WHERE email = 'teste@verificacao.com';
-- DELETE FROM courses WHERE title = 'Curso de Teste';
-- DELETE FROM organizations WHERE name = 'Org Teste Verificação';

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ Organização criada com sucesso
-- ✅ Usuário criado com sucesso
-- ✅ Curso criado com sucesso
-- ✅ Consultas retornam os dados inseridos
--
-- Se houver erro de "permission denied":
-- - Verifique se RLS está configurado corretamente
-- - Execute o script 02_verify_rls_policies.sql
-- - Considere executar migration 009 novamente
-- =====================================================


