-- =====================================================
-- VERBUM - USER PROGRESS SCHEMA
-- =====================================================
-- Migração do schema MongoDB UserProgress para Supabase
-- Tracking de progresso de usuários em cursos e módulos
-- =====================================================

-- =====================================================
-- TABELA: user_progress
-- =====================================================
-- Progresso de usuários em cursos e módulos

CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Dados do progresso
  module_id TEXT, -- ID do módulo dentro do curso (referência ao JSONB de courses.modules)
  progress NUMERIC(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100), -- Porcentagem
  time_spent INTEGER DEFAULT 0, -- Tempo gasto em segundos
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  
  -- Metadados flexíveis (scores, tentativas, etc)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Integração Moodle (opcional)
  moodle_progress_id INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: um registro por usuário/curso/módulo
  CONSTRAINT user_progress_unique UNIQUE (user_id, course_id, module_id)
);

-- Índices
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_course ON user_progress(course_id);
CREATE INDEX idx_user_progress_organization ON user_progress(organization_id);
CREATE INDEX idx_user_progress_user_course ON user_progress(user_id, course_id);
CREATE INDEX idx_user_progress_is_completed ON user_progress(is_completed);
CREATE INDEX idx_user_progress_module_id ON user_progress(module_id) WHERE module_id IS NOT NULL;
CREATE INDEX idx_user_progress_metadata ON user_progress USING GIN (metadata);

-- Trigger para updated_at
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para marcar completed_at automaticamente
CREATE OR REPLACE FUNCTION set_progress_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_progress_completed_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION set_progress_completed_at();

-- =====================================================
-- TABELA: activity_logs
-- =====================================================
-- Log detalhado de atividades dos usuários
-- Útil para analytics e relatórios

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Dados da atividade
  activity_type TEXT NOT NULL, -- 'course_access', 'module_view', 'quiz_attempt', etc
  module_id TEXT,
  action TEXT NOT NULL, -- 'view', 'complete', 'submit', etc
  
  -- Metadados da atividade
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Contexto
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_course ON activity_logs(course_id);
CREATE INDEX idx_activity_logs_organization ON activity_logs(organization_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_activity_type ON activity_logs(activity_type);
CREATE INDEX idx_activity_logs_metadata ON activity_logs USING GIN (metadata);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para user_progress
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND organization_id = user_progress.organization_id
      AND role IN ('admin', 'diretoria', 'coordenador', 'professor')
    )
  );

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Políticas para activity_logs
CREATE POLICY "Users can view their own activity logs"
  ON activity_logs FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND organization_id = activity_logs.organization_id
      AND role IN ('admin', 'diretoria', 'coordenador', 'professor')
    )
  );

CREATE POLICY "Users can insert their own activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE user_progress IS 'Progresso de usuários em cursos e módulos';
COMMENT ON TABLE activity_logs IS 'Log detalhado de atividades dos usuários para analytics';
COMMENT ON COLUMN user_progress.progress IS 'Porcentagem de conclusão (0-100)';
COMMENT ON COLUMN user_progress.time_spent IS 'Tempo gasto em segundos';
COMMENT ON COLUMN user_progress.metadata IS 'Metadados flexíveis: scores, tentativas, respostas, etc';

