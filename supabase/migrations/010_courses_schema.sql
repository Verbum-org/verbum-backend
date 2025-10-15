-- =====================================================
-- VERBUM - COURSES & ENROLLMENTS SCHEMA
-- =====================================================
-- Migração dos schemas MongoDB Course e Enrollment para Supabase
-- Adiciona suporte multi-organização
-- =====================================================

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- Status de matrícula
CREATE TYPE enrollment_status AS ENUM (
  'active',
  'completed',
  'suspended',
  'cancelled'
);

-- Tipo de módulo de curso
CREATE TYPE module_type AS ENUM (
  'video',
  'text',
  'quiz',
  'assignment',
  'resource',
  'forum',
  'other'
);

-- =====================================================
-- TABELA: courses
-- =====================================================
-- Cursos da plataforma

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Dados do curso
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Integração Moodle (opcional)
  moodle_id INTEGER,
  moodle_short_name TEXT,
  moodle_full_name TEXT,
  moodle_category_id INTEGER,
  moodle_start_date TIMESTAMPTZ,
  moodle_end_date TIMESTAMPTZ,
  
  -- Módulos do curso (armazenados como JSONB para flexibilidade)
  modules JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Índices
  CONSTRAINT courses_short_name_org_unique UNIQUE (organization_id, short_name)
);

-- Índices
CREATE INDEX idx_courses_organization ON courses(organization_id);
CREATE INDEX idx_courses_moodle_id ON courses(moodle_id) WHERE moodle_id IS NOT NULL;
CREATE INDEX idx_courses_is_active ON courses(is_active);

-- Trigger para updated_at
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: enrollments
-- =====================================================
-- Matrículas de usuários em cursos

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Status da matrícula
  status enrollment_status DEFAULT 'active',
  
  -- Datas
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Integração Moodle (opcional)
  moodle_enrollment_id INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraint: usuário pode ter apenas uma matrícula ativa por curso
  CONSTRAINT enrollments_user_course_unique UNIQUE (user_id, course_id)
);

-- Índices
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_organization ON enrollments(organization_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_enrollments_moodle_id ON enrollments(moodle_enrollment_id) WHERE moodle_enrollment_id IS NOT NULL;

-- Trigger para updated_at
CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Políticas para courses
CREATE POLICY "Users can view courses from their organization"
  ON courses FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and diretoria can manage courses"
  ON courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND organization_id = courses.organization_id
      AND role IN ('admin', 'diretoria')
    )
  );

-- Políticas para enrollments
CREATE POLICY "Users can view their own enrollments"
  ON enrollments FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND organization_id = enrollments.organization_id
      AND role IN ('admin', 'diretoria', 'coordenador', 'professor')
    )
  );

CREATE POLICY "Admins, diretoria and coordenadores can manage enrollments"
  ON enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND organization_id = enrollments.organization_id
      AND role IN ('admin', 'diretoria', 'coordenador')
    )
  );

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE courses IS 'Cursos da plataforma com suporte multi-organização';
COMMENT ON TABLE enrollments IS 'Matrículas de usuários em cursos';
COMMENT ON COLUMN courses.modules IS 'Array de módulos do curso em formato JSONB: [{id, name, type, url, content, isVisible, moodleId}]';

