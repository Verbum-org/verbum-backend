-- =====================================================
-- VERBUM - WEBHOOKS SCHEMA
-- =====================================================
-- Migração do schema MongoDB WebhookEvent para Supabase
-- Sistema de webhooks para integrações externas
-- =====================================================

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- Status do webhook event
CREATE TYPE webhook_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled'
);

-- Fontes de webhooks
CREATE TYPE webhook_source AS ENUM (
  'moodle',
  'google_classroom',
  'canvas',
  'blackboard',
  'internal',
  'custom'
);

-- =====================================================
-- TABELA: webhook_events
-- =====================================================
-- Eventos de webhook recebidos

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Dados do webhook
  source webhook_source NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  
  -- Status e processamento
  status webhook_status DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  max_retries INTEGER DEFAULT 3,
  
  -- Metadados
  headers JSONB, -- Headers HTTP do webhook
  ip_address INET,
  signature TEXT, -- Assinatura/hash para validação
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_webhook_events_organization ON webhook_events(organization_id);
CREATE INDEX idx_webhook_events_source ON webhook_events(source);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at DESC);
CREATE INDEX idx_webhook_events_next_retry ON webhook_events(next_retry_at) WHERE status = 'failed';
CREATE INDEX idx_webhook_events_payload ON webhook_events USING GIN (payload);

-- Trigger para updated_at
CREATE TRIGGER update_webhook_events_updated_at
  BEFORE UPDATE ON webhook_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: webhook_subscriptions
-- =====================================================
-- Configuração de webhooks que a aplicação vai enviar

CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Configuração
  name TEXT NOT NULL,
  description TEXT,
  target_url TEXT NOT NULL,
  secret_key TEXT, -- Chave secreta para assinar payloads
  
  -- Eventos que disparam o webhook
  event_types TEXT[] NOT NULL, -- Array de tipos de eventos
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  
  -- Headers customizados (opcional)
  custom_headers JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_webhook_subscriptions_organization ON webhook_subscriptions(organization_id);
CREATE INDEX idx_webhook_subscriptions_is_active ON webhook_subscriptions(is_active);

-- Trigger para updated_at
CREATE TRIGGER update_webhook_subscriptions_updated_at
  BEFORE UPDATE ON webhook_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: webhook_delivery_logs
-- =====================================================
-- Log de entregas de webhooks enviados

CREATE TABLE IF NOT EXISTS webhook_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Dados da entrega
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  
  -- Resposta
  status_code INTEGER,
  response_body TEXT,
  response_time_ms INTEGER, -- Tempo de resposta em milissegundos
  
  -- Status
  is_success BOOLEAN DEFAULT false,
  error_message TEXT,
  
  -- Retry
  attempt_number INTEGER DEFAULT 1,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_webhook_delivery_logs_subscription ON webhook_delivery_logs(subscription_id);
CREATE INDEX idx_webhook_delivery_logs_organization ON webhook_delivery_logs(organization_id);
CREATE INDEX idx_webhook_delivery_logs_created_at ON webhook_delivery_logs(created_at DESC);
CREATE INDEX idx_webhook_delivery_logs_is_success ON webhook_delivery_logs(is_success);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_delivery_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para webhook_events
CREATE POLICY "Admins can view webhook events"
  ON webhook_events FOR SELECT
  USING (
    organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND organization_id = webhook_events.organization_id
      AND role IN ('admin', 'diretoria')
    )
  );

CREATE POLICY "System can insert webhook events"
  ON webhook_events FOR INSERT
  WITH CHECK (true); -- Webhooks externos podem inserir

-- Políticas para webhook_subscriptions
CREATE POLICY "Admins can manage webhook subscriptions"
  ON webhook_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND organization_id = webhook_subscriptions.organization_id
      AND role IN ('admin', 'diretoria')
    )
  );

-- Políticas para webhook_delivery_logs
CREATE POLICY "Admins can view webhook delivery logs"
  ON webhook_delivery_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND organization_id = webhook_delivery_logs.organization_id
      AND role IN ('admin', 'diretoria')
    )
  );

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE webhook_events IS 'Eventos de webhook recebidos de sistemas externos';
COMMENT ON TABLE webhook_subscriptions IS 'Webhooks que a aplicação envia para URLs externas';
COMMENT ON TABLE webhook_delivery_logs IS 'Log de entregas de webhooks enviados';

