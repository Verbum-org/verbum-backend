/**
 * Tipos e enums relacionados a planos e features
 */

/**
 * Tipos de planos disponíveis
 */
export enum PlanType {
  TRIAL = 'trial',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

/**
 * Status da assinatura
 */
export enum SubscriptionStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended',
}

/**
 * Hierarquia de roles educacionais
 */
export enum UserRole {
  ADMIN = 'admin',
  DIRETORIA = 'diretoria',
  COORDENADOR = 'coordenador',
  PROFESSOR = 'professor',
  ALUNO = 'aluno',
}

/**
 * Features disponíveis no sistema
 */
export enum Feature {
  // Conteúdo
  CONTENT_UPLOAD = 'content_upload',
  CONTENT_MANAGEMENT = 'content_management',

  // Formulários
  FORMS_CREATE = 'forms_create',
  FORMS_RESPONSE = 'forms_response',

  // Relatórios
  REPORTS_BASIC = 'reports_basic',
  REPORTS_ADVANCED = 'reports_advanced',
  REPORTS_EXPORT = 'reports_export',

  // Dashboard
  DASHBOARD_VIEW = 'dashboard_view',
  DASHBOARD_CUSTOM = 'dashboard_custom',

  // Notificações
  NOTIFICATIONS = 'notifications',

  // Integrações
  MOODLE_INTEGRATION = 'moodle_integration',
  API_ACCESS = 'api_access',
  WEBHOOKS = 'webhooks',

  // Usuários
  USER_MANAGEMENT = 'user_management',

  // Cursos e Progresso
  COURSES = 'courses',
  PROGRESS_TRACKING = 'progress_tracking',
}

/**
 * Configuração de limites por plano
 */
export interface PlanLimits {
  maxUsers: number;
  maxStorageGb: number;
  trialDays?: number;
}

/**
 * Configuração de features por plano
 */
export interface PlanFeatures {
  [Feature.CONTENT_UPLOAD]: boolean;
  [Feature.CONTENT_MANAGEMENT]: boolean;
  [Feature.FORMS_CREATE]: boolean;
  [Feature.FORMS_RESPONSE]: boolean;
  [Feature.REPORTS_BASIC]: boolean;
  [Feature.REPORTS_ADVANCED]: boolean;
  [Feature.REPORTS_EXPORT]: boolean;
  [Feature.DASHBOARD_VIEW]: boolean;
  [Feature.DASHBOARD_CUSTOM]: boolean;
  [Feature.NOTIFICATIONS]: boolean;
  [Feature.MOODLE_INTEGRATION]: boolean;
  [Feature.API_ACCESS]: boolean;
  [Feature.WEBHOOKS]: boolean;
  [Feature.USER_MANAGEMENT]: boolean;
  [Feature.COURSES]: boolean;
  [Feature.PROGRESS_TRACKING]: boolean;
}

/**
 * Configuração completa de um plano
 */
export interface PlanConfiguration {
  type: PlanType;
  name: string;
  description: string;
  limits: PlanLimits;
  features: Partial<PlanFeatures>;
}

/**
 * Mapeamento de planos e suas configurações
 * Por enquanto, todos os planos têm acesso a todas as features
 * No futuro, isso será configurável
 */
export const PLAN_CONFIGURATIONS: Record<PlanType, PlanConfiguration> = {
  [PlanType.TRIAL]: {
    type: PlanType.TRIAL,
    name: 'Trial',
    description: 'Período de avaliação de 7 dias com limite de 20 usuários',
    limits: {
      maxUsers: 20,
      maxStorageGb: 5,
      trialDays: 7,
    },
    features: {
      [Feature.CONTENT_UPLOAD]: true,
      [Feature.CONTENT_MANAGEMENT]: true,
      [Feature.FORMS_CREATE]: true,
      [Feature.FORMS_RESPONSE]: true,
      [Feature.REPORTS_BASIC]: true,
      [Feature.REPORTS_ADVANCED]: true,
      [Feature.REPORTS_EXPORT]: true,
      [Feature.DASHBOARD_VIEW]: true,
      [Feature.DASHBOARD_CUSTOM]: true,
      [Feature.NOTIFICATIONS]: true,
      [Feature.MOODLE_INTEGRATION]: true,
      [Feature.API_ACCESS]: true,
      [Feature.WEBHOOKS]: true,
      [Feature.USER_MANAGEMENT]: true,
      [Feature.COURSES]: true,
      [Feature.PROGRESS_TRACKING]: true,
    },
  },
  [PlanType.BASIC]: {
    type: PlanType.BASIC,
    name: 'Basic',
    description: 'Plano básico com features essenciais',
    limits: {
      maxUsers: -1, // ilimitado
      maxStorageGb: -1, // ilimitado
    },
    features: {
      [Feature.CONTENT_UPLOAD]: true,
      [Feature.CONTENT_MANAGEMENT]: true,
      [Feature.FORMS_CREATE]: true,
      [Feature.FORMS_RESPONSE]: true,
      [Feature.REPORTS_BASIC]: true,
      [Feature.REPORTS_ADVANCED]: true,
      [Feature.REPORTS_EXPORT]: true,
      [Feature.DASHBOARD_VIEW]: true,
      [Feature.DASHBOARD_CUSTOM]: true,
      [Feature.NOTIFICATIONS]: true,
      [Feature.MOODLE_INTEGRATION]: true,
      [Feature.API_ACCESS]: true,
      [Feature.WEBHOOKS]: true,
      [Feature.USER_MANAGEMENT]: true,
      [Feature.COURSES]: true,
      [Feature.PROGRESS_TRACKING]: true,
    },
  },
  [PlanType.PREMIUM]: {
    type: PlanType.PREMIUM,
    name: 'Premium',
    description: 'Plano premium com todas as features',
    limits: {
      maxUsers: -1,
      maxStorageGb: -1,
    },
    features: {
      [Feature.CONTENT_UPLOAD]: true,
      [Feature.CONTENT_MANAGEMENT]: true,
      [Feature.FORMS_CREATE]: true,
      [Feature.FORMS_RESPONSE]: true,
      [Feature.REPORTS_BASIC]: true,
      [Feature.REPORTS_ADVANCED]: true,
      [Feature.REPORTS_EXPORT]: true,
      [Feature.DASHBOARD_VIEW]: true,
      [Feature.DASHBOARD_CUSTOM]: true,
      [Feature.NOTIFICATIONS]: true,
      [Feature.MOODLE_INTEGRATION]: true,
      [Feature.API_ACCESS]: true,
      [Feature.WEBHOOKS]: true,
      [Feature.USER_MANAGEMENT]: true,
      [Feature.COURSES]: true,
      [Feature.PROGRESS_TRACKING]: true,
    },
  },
  [PlanType.ENTERPRISE]: {
    type: PlanType.ENTERPRISE,
    name: 'Enterprise',
    description: 'Plano enterprise com suporte dedicado',
    limits: {
      maxUsers: -1,
      maxStorageGb: -1,
    },
    features: {
      [Feature.CONTENT_UPLOAD]: true,
      [Feature.CONTENT_MANAGEMENT]: true,
      [Feature.FORMS_CREATE]: true,
      [Feature.FORMS_RESPONSE]: true,
      [Feature.REPORTS_BASIC]: true,
      [Feature.REPORTS_ADVANCED]: true,
      [Feature.REPORTS_EXPORT]: true,
      [Feature.DASHBOARD_VIEW]: true,
      [Feature.DASHBOARD_CUSTOM]: true,
      [Feature.NOTIFICATIONS]: true,
      [Feature.MOODLE_INTEGRATION]: true,
      [Feature.API_ACCESS]: true,
      [Feature.WEBHOOKS]: true,
      [Feature.USER_MANAGEMENT]: true,
      [Feature.COURSES]: true,
      [Feature.PROGRESS_TRACKING]: true,
    },
  },
};
