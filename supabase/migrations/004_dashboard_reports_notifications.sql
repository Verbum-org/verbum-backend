-- =====================================================
-- DASHBOARD, RELATÓRIOS E NOTIFICAÇÕES
-- =====================================================
-- Adiciona suporte para dashboard, relatórios e notificações
-- =====================================================

-- =====================================================
-- TABELA: notifications
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Destinatário
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Conteúdo
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'info', 'success', 'warning', 'error',
    'trial_expiring', 'new_user', 'form_submission', 'content_uploaded'
  )),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  read_at TIMESTAMPTZ,
  
  -- Ação
  action_url TEXT,
  action_label TEXT,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: user_notification_preferences
-- =====================================================

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Preferências
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  trial_expiring_reminders BOOLEAN DEFAULT true,
  new_user_notifications BOOLEAN DEFAULT true,
  form_submission_notifications BOOLEAN DEFAULT true,
  content_upload_notifications BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Índices para audit_logs (usado no dashboard)
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at_desc ON audit_logs(created_at DESC);

-- Índices para forms (usado no dashboard)
CREATE INDEX IF NOT EXISTS idx_forms_is_active ON forms(is_active);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_notification_preferences_updated_at
    BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas para notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (recipient_id = (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (recipient_id = (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (recipient_id = (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
    ));

-- Service role pode criar notificações
CREATE POLICY "Service role can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Políticas para user_notification_preferences
CREATE POLICY "Users can view their own preferences" ON user_notification_preferences
    FOR SELECT USING (user_id = (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own preferences" ON user_notification_preferences
    FOR ALL USING (user_id = (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
    ));

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Criar preferências padrão para usuários existentes
INSERT INTO user_notification_preferences (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE notifications IS 'Notificações em tempo real para usuários';
COMMENT ON TABLE user_notification_preferences IS 'Preferências de notificação por usuário';
COMMENT ON COLUMN notifications.type IS 'Tipo: info, success, warning, error, trial_expiring, new_user, form_submission, content_uploaded';
COMMENT ON COLUMN notifications.status IS 'Status: unread, read, archived';

