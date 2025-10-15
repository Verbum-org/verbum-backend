-- =====================================================
-- QUICK FIX: Permitir INSERT na tabela trial_users
-- =====================================================
-- Este fix é temporário até migrarmos para a nova estrutura

-- Adicionar política para permitir registro (INSERT público)
CREATE POLICY "Allow public registration" ON trial_users
    FOR INSERT WITH CHECK (true);

-- Nota: Esta política permite qualquer pessoa inserir na trial_users
-- mas a segurança real vem do Supabase Auth que valida o email/senha

