-- =====================================================
-- VERBUM TRIAL SYSTEM - SUPABASE SCHEMA
-- =====================================================
-- Este arquivo contém todas as tabelas e configurações
-- necessárias para o sistema de trial no Supabase
-- =====================================================

-- Tabela de usuários trial
CREATE TABLE IF NOT EXISTS trial_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company_name TEXT,
  phone TEXT,
  
  -- Controle de trial
  trial_starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_expired BOOLEAN DEFAULT false,
  expiration_warning_sent BOOLEAN DEFAULT false,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  -- Auth do Supabase (referência ao auth.users)
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabela de sub-usuários criados pelo trial (limite de 10)
CREATE TABLE IF NOT EXISTS trial_sub_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_user_id UUID NOT NULL REFERENCES trial_users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'viewer', -- viewer, editor
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint para garantir limite de 10 sub-users por trial
  CONSTRAINT unique_sub_user_email_per_trial UNIQUE(trial_user_id, email)
);

-- Tabela de formulários dinâmicos
CREATE TABLE IF NOT EXISTS trial_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_user_id UUID NOT NULL REFERENCES trial_users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  schema JSONB NOT NULL, -- Estrutura do formulário (campos, validações, etc)
  
  -- Configurações
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  
  -- Estatísticas
  submission_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de respostas dos formulários
CREATE TABLE IF NOT EXISTS trial_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES trial_forms(id) ON DELETE CASCADE,
  
  data JSONB NOT NULL, -- Respostas do formulário
  submitted_by TEXT, -- Email ou nome de quem preencheu
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de conteúdo (vídeos, arquivos, etc)
CREATE TABLE IF NOT EXISTS trial_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_user_id UUID NOT NULL REFERENCES trial_users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL, -- 'video', 'document', 'image', 'file'
  
  -- Storage
  file_path TEXT, -- Caminho no Supabase Storage
  file_size BIGINT, -- Tamanho em bytes
  mime_type TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de auditoria/logs
CREATE TABLE IF NOT EXISTS trial_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_user_id UUID NOT NULL REFERENCES trial_users(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL, -- 'login', 'create_form', 'upload_file', etc
  resource_type TEXT, -- 'form', 'content', 'sub_user', etc
  resource_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_trial_users_email ON trial_users(email);
CREATE INDEX idx_trial_users_auth_user_id ON trial_users(auth_user_id);
CREATE INDEX idx_trial_users_trial_ends_at ON trial_users(trial_ends_at);
CREATE INDEX idx_trial_users_is_expired ON trial_users(is_expired);
CREATE INDEX idx_trial_users_expiration_warning ON trial_users(expiration_warning_sent, trial_ends_at);

CREATE INDEX idx_trial_sub_users_trial_user_id ON trial_sub_users(trial_user_id);
CREATE INDEX idx_trial_forms_trial_user_id ON trial_forms(trial_user_id);
CREATE INDEX idx_trial_form_submissions_form_id ON trial_form_submissions(form_id);
CREATE INDEX idx_trial_content_trial_user_id ON trial_content(trial_user_id);
CREATE INDEX idx_trial_content_type ON trial_content(content_type);
CREATE INDEX idx_trial_audit_logs_trial_user_id ON trial_audit_logs(trial_user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para validar limite de sub-users (máximo 10)
CREATE OR REPLACE FUNCTION check_sub_users_limit()
RETURNS TRIGGER AS $$
DECLARE
    sub_user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO sub_user_count
    FROM trial_sub_users
    WHERE trial_user_id = NEW.trial_user_id AND is_active = true;
    
    IF sub_user_count >= 10 THEN
        RAISE EXCEPTION 'Trial user has reached the maximum limit of 10 sub-users';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para marcar trials expirados
CREATE OR REPLACE FUNCTION mark_expired_trials()
RETURNS void AS $$
BEGIN
    UPDATE trial_users
    SET is_expired = true,
        is_active = false
    WHERE trial_ends_at < NOW()
      AND is_expired = false;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Triggers para updated_at
CREATE TRIGGER update_trial_users_updated_at BEFORE UPDATE ON trial_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trial_sub_users_updated_at BEFORE UPDATE ON trial_sub_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trial_forms_updated_at BEFORE UPDATE ON trial_forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trial_content_updated_at BEFORE UPDATE ON trial_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para validar limite de sub-users
CREATE TRIGGER check_sub_users_limit_trigger BEFORE INSERT ON trial_sub_users
    FOR EACH ROW EXECUTE FUNCTION check_sub_users_limit();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE trial_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_sub_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para trial_users
CREATE POLICY "Users can view their own data" ON trial_users
    FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update their own data" ON trial_users
    FOR UPDATE USING (auth_user_id = auth.uid());

-- Políticas para trial_sub_users
CREATE POLICY "Trial users can manage their sub-users" ON trial_sub_users
    FOR ALL USING (
        trial_user_id IN (
            SELECT id FROM trial_users WHERE auth_user_id = auth.uid()
        )
    );

-- Políticas para trial_forms
CREATE POLICY "Trial users can manage their forms" ON trial_forms
    FOR ALL USING (
        trial_user_id IN (
            SELECT id FROM trial_users WHERE auth_user_id = auth.uid()
        )
    );

-- Políticas para trial_form_submissions
CREATE POLICY "Trial users can view submissions of their forms" ON trial_form_submissions
    FOR SELECT USING (
        form_id IN (
            SELECT id FROM trial_forms WHERE trial_user_id IN (
                SELECT id FROM trial_users WHERE auth_user_id = auth.uid()
            )
        )
    );

-- Políticas para trial_content
CREATE POLICY "Trial users can manage their content" ON trial_content
    FOR ALL USING (
        trial_user_id IN (
            SELECT id FROM trial_users WHERE auth_user_id = auth.uid()
        )
    );

-- Políticas para trial_audit_logs
CREATE POLICY "Trial users can view their own logs" ON trial_audit_logs
    FOR SELECT USING (
        trial_user_id IN (
            SELECT id FROM trial_users WHERE auth_user_id = auth.uid()
        )
    );

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================
-- Execute estes comandos no console do Supabase:
-- 
-- 1. Criar bucket 'trial-content':
--    INSERT INTO storage.buckets (id, name, public) 
--    VALUES ('trial-content', 'trial-content', false);
--
-- 2. Política de upload:
--    CREATE POLICY "Trial users can upload files"
--    ON storage.objects FOR INSERT
--    WITH CHECK (bucket_id = 'trial-content' AND auth.role() = 'authenticated');
--
-- 3. Política de visualização:
--    CREATE POLICY "Trial users can view their files"
--    ON storage.objects FOR SELECT
--    USING (bucket_id = 'trial-content' AND auth.role() = 'authenticated');
--
-- 4. Política de deleção:
--    CREATE POLICY "Trial users can delete their files"
--    ON storage.objects FOR DELETE
--    USING (bucket_id = 'trial-content' AND auth.role() = 'authenticated');
-- =====================================================

