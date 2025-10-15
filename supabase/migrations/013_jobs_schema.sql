-- =====================================================
-- VERBUM - JOBS SCHEMA
-- =====================================================
-- Migração do schema MongoDB Job para Supabase
-- Sistema de jobs para processamento assíncrono
-- Complementa o BullMQ para histórico persistente
-- =====================================================

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- Status do job
CREATE TYPE job_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'paused'
);

-- Tipos de jobs
CREATE TYPE job_type AS ENUM (
  'report_generation',
  'data_sync',
  'moodle_sync',
  'email_sending',
  'webhook_delivery',
  'data_export',
  'data_import',
  'cleanup',
  'backup',
  'custom'
);

-- =====================================================
-- TABELA: jobs
-- =====================================================
-- Registro de jobs para processamento assíncrono

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Usuário que iniciou o job
  
  -- Identificação do job
  name TEXT NOT NULL,
  type job_type NOT NULL,
  queue_name TEXT, -- Nome da fila no BullMQ
  bull_job_id TEXT, -- ID do job no BullMQ
  
  -- Dados do job
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Status e execução
  status job_status DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Erro
  error_message TEXT,
  error_stack TEXT,
  
  -- Tentativas
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  next_attempt_at TIMESTAMPTZ,
  
  -- Resultado
  result JSONB DEFAULT '{}'::jsonb,
  
  -- Progresso (0-100)
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  
  -- Prioridade (maior = mais importante)
  priority INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_jobs_organization ON jobs(organization_id);
CREATE INDEX idx_jobs_user ON jobs(user_id);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_bull_job_id ON jobs(bull_job_id) WHERE bull_job_id IS NOT NULL;
CREATE INDEX idx_jobs_next_attempt ON jobs(next_attempt_at) WHERE status = 'failed';
CREATE INDEX idx_jobs_queue_name ON jobs(queue_name);
CREATE INDEX idx_jobs_data ON jobs USING GIN (data);
CREATE INDEX idx_jobs_result ON jobs USING GIN (result);

-- Trigger para updated_at
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para marcar timestamps automaticamente
CREATE OR REPLACE FUNCTION set_job_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Marcar started_at quando status muda para processing
  IF NEW.status = 'processing' AND OLD.status != 'processing' THEN
    NEW.started_at = NOW();
  END IF;
  
  -- Marcar completed_at quando status muda para completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  
  -- Marcar failed_at quando status muda para failed
  IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    NEW.failed_at = NOW();
  END IF;
  
  -- Marcar cancelled_at quando status muda para cancelled
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_job_timestamps
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_job_timestamps();

-- =====================================================
-- TABELA: job_logs
-- =====================================================
-- Logs detalhados de execução de jobs

CREATE TABLE IF NOT EXISTS job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  
  -- Log entry
  level TEXT NOT NULL, -- 'info', 'warn', 'error', 'debug'
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_job_logs_job ON job_logs(job_id);
CREATE INDEX idx_job_logs_created_at ON job_logs(created_at DESC);
CREATE INDEX idx_job_logs_level ON job_logs(level);

-- =====================================================
-- TABELA: scheduled_jobs
-- =====================================================
-- Jobs agendados (cron-like)

CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Configuração
  name TEXT NOT NULL,
  description TEXT,
  type job_type NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  
  -- Agendamento (cron expression)
  cron_expression TEXT NOT NULL, -- Ex: '0 0 * * *' (todo dia à meia-noite)
  timezone TEXT DEFAULT 'UTC',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  last_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  
  -- Metadados
  run_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_scheduled_jobs_organization ON scheduled_jobs(organization_id);
CREATE INDEX idx_scheduled_jobs_is_active ON scheduled_jobs(is_active);
CREATE INDEX idx_scheduled_jobs_next_run ON scheduled_jobs(next_run_at) WHERE is_active = true;

-- Trigger para updated_at
CREATE TRIGGER update_scheduled_jobs_updated_at
  BEFORE UPDATE ON scheduled_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;

-- Políticas para jobs
CREATE POLICY "Users can view jobs from their organization"
  ON jobs FOR SELECT
  USING (
    organization_id IS NULL OR
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND organization_id = jobs.organization_id
      AND role IN ('admin', 'diretoria', 'coordenador')
    )
  );

CREATE POLICY "Admins can manage jobs"
  ON jobs FOR ALL
  USING (
    organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND organization_id = jobs.organization_id
      AND role IN ('admin', 'diretoria')
    )
  );

-- Políticas para job_logs
CREATE POLICY "Users can view job logs"
  ON job_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN users ON (jobs.organization_id = users.organization_id OR jobs.user_id = users.id)
      WHERE jobs.id = job_logs.job_id
      AND users.auth_user_id = auth.uid()
      AND users.role IN ('admin', 'diretoria', 'coordenador')
    )
  );

-- Políticas para scheduled_jobs
CREATE POLICY "Admins can manage scheduled jobs"
  ON scheduled_jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND organization_id = scheduled_jobs.organization_id
      AND role IN ('admin', 'diretoria')
    )
  );

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE jobs IS 'Registro de jobs para processamento assíncrono (complementa BullMQ)';
COMMENT ON TABLE job_logs IS 'Logs detalhados de execução de jobs';
COMMENT ON TABLE scheduled_jobs IS 'Jobs agendados com cron expressions';
COMMENT ON COLUMN jobs.bull_job_id IS 'ID do job no BullMQ para correlação';
COMMENT ON COLUMN jobs.progress IS 'Progresso da execução (0-100)';

