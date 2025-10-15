-- =====================================================
-- VERBUM - MOODLE INTEGRATION SCHEMA
-- =====================================================
-- Schema para integração com Moodle
-- Configurações, logs de sincronização e mapeamentos
-- =====================================================

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- Status da sincronização
CREATE TYPE sync_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'failed',
  'partial'
);

-- Tipo de sincronização
CREATE TYPE sync_type AS ENUM (
  'full',
  'incremental',
  'courses',
  'users',
  'enrollments',
  'grades',
  'activities'
);

-- =====================================================
-- TABELA: moodle_configurations
-- =====================================================
-- Configurações de conexão Moodle por organização

CREATE TABLE IF NOT EXISTS moodle_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Configuração de conexão
  moodle_url TEXT NOT NULL,
  moodle_token TEXT NOT NULL, -- Criptografado
  is_active BOOLEAN DEFAULT true,
  
  -- Configurações de sincronização
  auto_sync_enabled BOOLEAN DEFAULT false,
  sync_interval_hours INTEGER DEFAULT 24,
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  
  -- Mapeamento de campos customizados
  field_mappings JSONB DEFAULT '{}'::jsonb,
  
  -- Configurações adicionais
  settings JSONB DEFAULT '{
    "sync_courses": true,
    "sync_users": true,
    "sync_enrollments": true,
    "sync_grades": false,
    "sync_activities": false
  }'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraint: apenas uma config ativa por organização
  CONSTRAINT moodle_config_org_unique UNIQUE (organization_id)
);

-- Índices
CREATE INDEX idx_moodle_configurations_organization ON moodle_configurations(organization_id);
CREATE INDEX idx_moodle_configurations_is_active ON moodle_configurations(is_active);
CREATE INDEX idx_moodle_configurations_next_sync ON moodle_configurations(next_sync_at) 
  WHERE is_active = true AND auto_sync_enabled = true;

-- Trigger para updated_at
CREATE TRIGGER update_moodle_configurations_updated_at
  BEFORE UPDATE ON moodle_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: moodle_sync_logs
-- =====================================================
-- Logs de sincronização com Moodle

CREATE TABLE IF NOT EXISTS moodle_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  moodle_config_id UUID NOT NULL REFERENCES moodle_configurations(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  
  -- Dados da sincronização
  sync_type sync_type NOT NULL,
  status sync_status DEFAULT 'pending',
  
  -- Resultados
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Estatísticas
  total_items INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  
  -- Detalhes
  error_message TEXT,
  summary JSONB DEFAULT '{}'::jsonb, -- Resumo detalhado da sync
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_moodle_sync_logs_organization ON moodle_sync_logs(organization_id);
CREATE INDEX idx_moodle_sync_logs_config ON moodle_sync_logs(moodle_config_id);
CREATE INDEX idx_moodle_sync_logs_status ON moodle_sync_logs(status);
CREATE INDEX idx_moodle_sync_logs_created_at ON moodle_sync_logs(created_at DESC);
CREATE INDEX idx_moodle_sync_logs_sync_type ON moodle_sync_logs(sync_type);

-- =====================================================
-- TABELA: moodle_entity_mappings
-- =====================================================
-- Mapeamento entre entidades Verbum e Moodle

CREATE TABLE IF NOT EXISTS moodle_entity_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Tipo de entidade
  entity_type TEXT NOT NULL, -- 'course', 'user', 'enrollment', 'activity'
  
  -- IDs
  verbum_id UUID NOT NULL,
  moodle_id INTEGER NOT NULL,
  
  -- Metadados
  sync_metadata JSONB DEFAULT '{}'::jsonb,
  last_synced_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: mapeamento único por tipo/verbum_id
  CONSTRAINT moodle_mappings_unique UNIQUE (entity_type, verbum_id),
  -- Constraint: mapeamento único por tipo/moodle_id/org
  CONSTRAINT moodle_mappings_moodle_unique UNIQUE (entity_type, moodle_id, organization_id)
);

-- Índices
CREATE INDEX idx_moodle_mappings_organization ON moodle_entity_mappings(organization_id);
CREATE INDEX idx_moodle_mappings_entity_type ON moodle_entity_mappings(entity_type);
CREATE INDEX idx_moodle_mappings_verbum_id ON moodle_entity_mappings(verbum_id);
CREATE INDEX idx_moodle_mappings_moodle_id ON moodle_entity_mappings(moodle_id);

-- Trigger para updated_at
CREATE TRIGGER update_moodle_mappings_updated_at
  BEFORE UPDATE ON moodle_entity_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: moodle_sync_errors
-- =====================================================
-- Erros específicos de sincronização Moodle

CREATE TABLE IF NOT EXISTS moodle_sync_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_log_id UUID NOT NULL REFERENCES moodle_sync_logs(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Dados do erro
  entity_type TEXT NOT NULL,
  entity_id TEXT, -- ID da entidade que causou erro
  error_code TEXT,
  error_message TEXT NOT NULL,
  error_details JSONB DEFAULT '{}'::jsonb,
  
  -- Tentativas
  retry_count INTEGER DEFAULT 0,
  resolved_at TIMESTAMPTZ,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_moodle_sync_errors_sync_log ON moodle_sync_errors(sync_log_id);
CREATE INDEX idx_moodle_sync_errors_organization ON moodle_sync_errors(organization_id);
CREATE INDEX idx_moodle_sync_errors_entity_type ON moodle_sync_errors(entity_type);
CREATE INDEX idx_moodle_sync_errors_resolved ON moodle_sync_errors(resolved_at) WHERE resolved_at IS NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE moodle_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodle_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodle_entity_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodle_sync_errors ENABLE ROW LEVEL SECURITY;

-- Políticas para moodle_configurations
CREATE POLICY "Admins can manage moodle configurations"
  ON moodle_configurations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND organization_id = moodle_configurations.organization_id
      AND role IN ('admin', 'diretoria')
    )
  );

-- Políticas para moodle_sync_logs
CREATE POLICY "Admins can view moodle sync logs"
  ON moodle_sync_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND organization_id = moodle_sync_logs.organization_id
      AND role IN ('admin', 'diretoria', 'coordenador')
    )
  );

-- Políticas para moodle_entity_mappings
CREATE POLICY "Users can view moodle mappings from their organization"
  ON moodle_entity_mappings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND organization_id = moodle_entity_mappings.organization_id
    )
  );

CREATE POLICY "Admins can manage moodle mappings"
  ON moodle_entity_mappings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND organization_id = moodle_entity_mappings.organization_id
      AND role IN ('admin', 'diretoria')
    )
  );

-- Políticas para moodle_sync_errors
CREATE POLICY "Admins can view moodle sync errors"
  ON moodle_sync_errors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND organization_id = moodle_sync_errors.organization_id
      AND role IN ('admin', 'diretoria', 'coordenador')
    )
  );

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE moodle_configurations IS 'Configurações de integração Moodle por organização';
COMMENT ON TABLE moodle_sync_logs IS 'Logs de sincronização com Moodle';
COMMENT ON TABLE moodle_entity_mappings IS 'Mapeamento entre entidades Verbum e Moodle';
COMMENT ON TABLE moodle_sync_errors IS 'Erros específicos de sincronização Moodle';
COMMENT ON COLUMN moodle_configurations.moodle_token IS 'Token de API do Moodle (deve ser criptografado)';

