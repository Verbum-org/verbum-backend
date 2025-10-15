-- =====================================================
-- VERBUM TRIAL SYSTEM - NOVA ARQUITETURA
-- =====================================================
-- Estrutura escalável com separação de conceitos:
-- - trial_accounts: Dados do período de trial
-- - organizations: Instituições de ensino
-- - users: Todos os usuários com hierarquia de roles
-- =====================================================

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- Roles do sistema (hierarquia educacional)
CREATE TYPE user_role AS ENUM (
  'admin',        -- Criador do trial / Dono da conta
  'diretoria',    -- Diretor / Gestor da instituição
  'coordenador',  -- Coordenador pedagógico
  'professor',    -- Professor / Educador
  'aluno'         -- Estudante / Aluno
);

-- Status do trial/subscription
CREATE TYPE subscription_status AS ENUM (
  'trial',        -- Em período de trial
  'active',       -- Assinatura ativa (paga)
  'expired',      -- Trial/assinatura expirada
  'cancelled',    -- Cancelada pelo usuário
  'suspended'     -- Suspensa por inadimplência
);

-- Planos disponíveis
CREATE TYPE plan_type AS ENUM (
  'trial',        -- Trial gratuito
  'basic',        -- Plano básico
  'premium',      -- Plano premium
  'enterprise'    -- Plano enterprise
);

-- =====================================================
-- TABELA: trial_accounts
-- =====================================================
-- Gerencia o período de trial e informações de billing

CREATE TABLE IF NOT EXISTS trial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informações do trial
  company_name TEXT NOT NULL,
  trial_starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ NOT NULL,
  
  -- Status e controle
  status subscription_status DEFAULT 'trial',
  plan plan_type DEFAULT 'trial',
  is_expired BOOLEAN DEFAULT false,
  expiration_warning_sent BOOLEAN DEFAULT false,
  
  -- Billing (para quando converter de trial)
  billing_email TEXT,
  billing_contact_name TEXT,
  billing_phone TEXT,
  
  -- Referência ao usuário admin/owner
  owner_user_id UUID, -- Será preenchido após criar o primeiro usuário
  
  -- Configurações gerais da conta
  settings JSONB DEFAULT '{
    "max_users": 50,
    "max_storage_gb": 10,
    "features": {
      "forms_enabled": true,
      "content_upload_enabled": true,
      "reports_enabled": true,
      "api_access_enabled": false
    }
  }'::jsonb,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- TABELA: organizations
-- =====================================================
-- Instituições de ensino dentro de uma conta

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_account_id UUID NOT NULL REFERENCES trial_accounts(id) ON DELETE CASCADE,
  
  -- Informações da instituição
  name TEXT NOT NULL,
  slug TEXT UNIQUE, -- URL amigável: verbum.com/org/escola-abc
  description TEXT,
  
  -- Contato
  email TEXT,
  phone TEXT,
  website TEXT,
  
  -- Endereço
  address JSONB DEFAULT '{}'::jsonb,
  
  -- Logo e branding
  logo_url TEXT,
  brand_colors JSONB DEFAULT '{
    "primary": "#1976d2",
    "secondary": "#dc004e"
  }'::jsonb,
  
  -- Configurações específicas da organização
  settings JSONB DEFAULT '{
    "timezone": "America/Sao_Paulo",
    "language": "pt-BR",
    "academic_year_start": "02-01",
    "academic_year_end": "12-20"
  }'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraint: nome único por conta
  CONSTRAINT unique_org_name_per_account UNIQUE(trial_account_id, name)
);

-- =====================================================
-- TABELA: users
-- =====================================================
-- Todos os usuários do sistema com hierarquia

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vínculo com organização e conta
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  trial_account_id UUID NOT NULL REFERENCES trial_accounts(id) ON DELETE CASCADE,
  
  -- Auth do Supabase
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informações pessoais
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  
  -- Contato
  phone TEXT,
  avatar_url TEXT,
  
  -- Role e hierarquia
  role user_role NOT NULL DEFAULT 'aluno',
  is_trial_owner BOOLEAN DEFAULT false,
  created_by_id UUID REFERENCES users(id), -- Quem criou este usuário
  
  -- Permissões customizadas (sobrescreve permissões padrão do role)
  custom_permissions JSONB DEFAULT '[]'::jsonb,
  
  -- Departamento / Curso (opcional)
  department TEXT,
  course TEXT,
  grade TEXT, -- Série/Ano
  
  -- Metadados educacionais
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  
  -- Datas de acesso
  last_login_at TIMESTAMPTZ,
  invited_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT unique_email_per_organization UNIQUE(organization_id, email)
);

-- =====================================================
-- TABELA: user_permissions
-- =====================================================
-- Permissões granulares do sistema

CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Permissão
  name TEXT UNIQUE NOT NULL, -- Ex: 'forms.create', 'users.delete', 'content.upload'
  description TEXT,
  category TEXT, -- Ex: 'forms', 'users', 'content', 'reports'
  
  -- Roles que tem esta permissão por padrão
  default_roles user_role[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: forms (atualizada)
-- =====================================================

CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  schema JSONB NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  
  is_active BOOLEAN DEFAULT true,
  submission_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: form_submissions (atualizada)
-- =====================================================

CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  submitted_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  data JSONB NOT NULL,
  submitted_by_email TEXT, -- Fallback se não for usuário logado
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: content (atualizada)
-- =====================================================

CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_by_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL,
  
  file_path TEXT,
  file_size BIGINT,
  mime_type TEXT,
  
  -- Organização de conteúdo
  folder_path TEXT DEFAULT '/',
  tags TEXT[] DEFAULT '{}',
  
  -- Compartilhamento
  is_public BOOLEAN DEFAULT false,
  shared_with_roles user_role[] DEFAULT '{}',
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: audit_logs (atualizada)
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_account_id UUID NOT NULL REFERENCES trial_accounts(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  changes JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- trial_accounts
CREATE INDEX idx_trial_accounts_status ON trial_accounts(status);
CREATE INDEX idx_trial_accounts_trial_ends_at ON trial_accounts(trial_ends_at);
CREATE INDEX idx_trial_accounts_owner ON trial_accounts(owner_user_id);

-- organizations
CREATE INDEX idx_organizations_trial_account ON organizations(trial_account_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);

-- users
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_trial_account ON users(trial_account_id);
CREATE INDEX idx_users_auth_user ON users(auth_user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_by ON users(created_by_id);
CREATE INDEX idx_users_is_trial_owner ON users(is_trial_owner) WHERE is_trial_owner = true;

-- forms
CREATE INDEX idx_forms_organization ON forms(organization_id);
CREATE INDEX idx_forms_created_by ON forms(created_by_id);

-- form_submissions
CREATE INDEX idx_form_submissions_form ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_user ON form_submissions(submitted_by_id);

-- content
CREATE INDEX idx_content_organization ON content(organization_id);
CREATE INDEX idx_content_uploaded_by ON content(uploaded_by_id);
CREATE INDEX idx_content_content_type ON content(content_type);
CREATE INDEX idx_content_folder_path ON content(folder_path);

-- audit_logs
CREATE INDEX idx_audit_logs_trial_account ON audit_logs(trial_account_id);
CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Validar hierarquia de roles
CREATE OR REPLACE FUNCTION validate_role_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
    creator_role user_role;
BEGIN
    -- Se tem created_by_id, validar hierarquia
    IF NEW.created_by_id IS NOT NULL THEN
        SELECT role INTO creator_role
        FROM users
        WHERE id = NEW.created_by_id;
        
        -- Admin pode criar qualquer role
        IF creator_role = 'admin' THEN
            RETURN NEW;
        END IF;
        
        -- Diretoria pode criar coordenador, professor, aluno
        IF creator_role = 'diretoria' AND NEW.role IN ('coordenador', 'professor', 'aluno') THEN
            RETURN NEW;
        END IF;
        
        -- Coordenador pode criar professor e aluno
        IF creator_role = 'coordenador' AND NEW.role IN ('professor', 'aluno') THEN
            RETURN NEW;
        END IF;
        
        -- Professor pode criar apenas aluno
        IF creator_role = 'professor' AND NEW.role = 'aluno' THEN
            RETURN NEW;
        END IF;
        
        -- Se chegou aqui, não tem permissão
        RAISE EXCEPTION 'User % cannot create users with role %', creator_role, NEW.role;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Marcar trials expirados
CREATE OR REPLACE FUNCTION mark_expired_trials()
RETURNS void AS $$
BEGIN
    UPDATE trial_accounts
    SET is_expired = true,
        status = 'expired'
    WHERE trial_ends_at < NOW()
      AND status = 'trial'
      AND is_expired = false;
END;
$$ LANGUAGE plpgsql;

-- Gerar slug único para organização
CREATE OR REPLACE FUNCTION generate_organization_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Gerar slug base a partir do nome
    base_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    final_slug := base_slug;
    
    -- Garantir unicidade
    WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = final_slug AND id != NEW.id) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at triggers
CREATE TRIGGER update_trial_accounts_updated_at 
    BEFORE UPDATE ON trial_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at 
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at 
    BEFORE UPDATE ON forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at 
    BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Slug generation
CREATE TRIGGER generate_org_slug_trigger 
    BEFORE INSERT OR UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION generate_organization_slug();

-- Role hierarchy validation
CREATE TRIGGER validate_user_role_hierarchy 
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION validate_role_hierarchy();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE trial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS: trial_accounts
-- =====================================================

-- Usuários podem ver sua própria conta trial
CREATE POLICY "Users can view their trial account" ON trial_accounts
    FOR SELECT USING (
        id IN (
            SELECT trial_account_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- Apenas owners podem atualizar
CREATE POLICY "Owners can update trial account" ON trial_accounts
    FOR UPDATE USING (
        owner_user_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- Permitir INSERT público (para registro)
CREATE POLICY "Allow public trial account creation" ON trial_accounts
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- POLÍTICAS: organizations
-- =====================================================

-- Usuários podem ver suas organizações
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- Admin e diretoria podem atualizar
CREATE POLICY "Admin and diretoria can update organization" ON organizations
    FOR UPDATE USING (
        id IN (
            SELECT organization_id FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'diretoria')
        )
    );

-- Permitir INSERT para criar durante registro
CREATE POLICY "Allow organization creation during registration" ON organizations
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- POLÍTICAS: users
-- =====================================================

-- Usuários podem ver outros usuários da mesma organização
CREATE POLICY "Users can view users in their organization" ON users
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth_user_id = auth.uid());

-- Admin, diretoria e coordenadores podem criar usuários
CREATE POLICY "Admins can create users" ON users
    FOR INSERT WITH CHECK (
        created_by_id IN (
            SELECT id FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'diretoria', 'coordenador', 'professor')
        )
        OR created_by_id IS NULL -- Permitir primeiro registro
    );

-- Admin e diretoria podem deletar usuários
CREATE POLICY "Admins can delete users" ON users
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'diretoria')
        )
    );

-- =====================================================
-- POLÍTICAS: forms
-- =====================================================

CREATE POLICY "Users can view forms in their organization" ON forms
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Authorized users can create forms" ON forms
    FOR INSERT WITH CHECK (
        created_by_id IN (
            SELECT id FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'diretoria', 'coordenador', 'professor')
        )
    );

CREATE POLICY "Form creators can update their forms" ON forms
    FOR UPDATE USING (
        created_by_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- =====================================================
-- POLÍTICAS: form_submissions
-- =====================================================

CREATE POLICY "Users can view submissions in their organization" ON form_submissions
    FOR SELECT USING (
        form_id IN (
            SELECT id FROM forms WHERE organization_id IN (
                SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Anyone can submit forms" ON form_submissions
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- POLÍTICAS: content
-- =====================================================

CREATE POLICY "Users can view content in their organization" ON content
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Authorized users can upload content" ON content
    FOR INSERT WITH CHECK (
        uploaded_by_id IN (
            SELECT id FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'diretoria', 'coordenador', 'professor')
        )
    );

-- =====================================================
-- POLÍTICAS: audit_logs
-- =====================================================

CREATE POLICY "Users can view logs in their organization" ON audit_logs
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'diretoria')
        )
    );

-- =====================================================
-- SEED: Permissões padrão
-- =====================================================

INSERT INTO user_permissions (name, description, category, default_roles) VALUES
-- Users
('users.view', 'Visualizar usuários', 'users', ARRAY['admin', 'diretoria', 'coordenador', 'professor']::user_role[]),
('users.create', 'Criar usuários', 'users', ARRAY['admin', 'diretoria', 'coordenador']::user_role[]),
('users.update', 'Editar usuários', 'users', ARRAY['admin', 'diretoria']::user_role[]),
('users.delete', 'Deletar usuários', 'users', ARRAY['admin', 'diretoria']::user_role[]),

-- Forms
('forms.view', 'Visualizar formulários', 'forms', ARRAY['admin', 'diretoria', 'coordenador', 'professor']::user_role[]),
('forms.create', 'Criar formulários', 'forms', ARRAY['admin', 'diretoria', 'coordenador', 'professor']::user_role[]),
('forms.update', 'Editar formulários', 'forms', ARRAY['admin', 'diretoria', 'coordenador', 'professor']::user_role[]),
('forms.delete', 'Deletar formulários', 'forms', ARRAY['admin', 'diretoria']::user_role[]),

-- Content
('content.view', 'Visualizar conteúdo', 'content', ARRAY['admin', 'diretoria', 'coordenador', 'professor', 'aluno']::user_role[]),
('content.upload', 'Fazer upload de conteúdo', 'content', ARRAY['admin', 'diretoria', 'coordenador', 'professor']::user_role[]),
('content.update', 'Editar conteúdo', 'content', ARRAY['admin', 'diretoria', 'coordenador', 'professor']::user_role[]),
('content.delete', 'Deletar conteúdo', 'content', ARRAY['admin', 'diretoria']::user_role[]),

-- Reports
('reports.view', 'Visualizar relatórios', 'reports', ARRAY['admin', 'diretoria', 'coordenador']::user_role[]),
('reports.export', 'Exportar relatórios', 'reports', ARRAY['admin', 'diretoria']::user_role[]),

-- Organization
('organization.settings', 'Gerenciar configurações', 'organization', ARRAY['admin', 'diretoria']::user_role[]),
('organization.billing', 'Gerenciar cobrança', 'organization', ARRAY['admin']::user_role[])
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================
-- Execute no console do Supabase:
-- 
-- 1. Criar bucket 'content':
--    INSERT INTO storage.buckets (id, name, public) 
--    VALUES ('content', 'content', false);
-- =====================================================

