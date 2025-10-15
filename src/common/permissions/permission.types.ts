import { UserRole } from '../plans/plan.types';

/**
 * Interface de permissão
 */
export interface Permission {
  name: string;
  description: string;
  category: string;
  defaultRoles: UserRole[];
}

/**
 * Categorias de permissões
 */
export enum PermissionCategory {
  USERS = 'users',
  ORGANIZATIONS = 'organizations',
  CONTENT = 'content',
  FORMS = 'forms',
  REPORTS = 'reports',
  DASHBOARD = 'dashboard',
  NOTIFICATIONS = 'notifications',
  SETTINGS = 'settings',
  INTEGRATIONS = 'integrations',
}

/**
 * Permissões do sistema
 * Estas serão carregadas do banco, mas mantemos constantes para referência
 */
export const PERMISSIONS = {
  // Usuários
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  USERS_INVITE: 'users:invite',

  // Organizações
  ORG_VIEW: 'organizations:view',
  ORG_EDIT: 'organizations:edit',
  ORG_SETTINGS: 'organizations:settings',

  // Conteúdo
  CONTENT_VIEW: 'content:view',
  CONTENT_CREATE: 'content:create',
  CONTENT_EDIT: 'content:edit',
  CONTENT_DELETE: 'content:delete',
  CONTENT_PUBLISH: 'content:publish',

  // Formulários
  FORMS_VIEW: 'forms:view',
  FORMS_CREATE: 'forms:create',
  FORMS_EDIT: 'forms:edit',
  FORMS_DELETE: 'forms:delete',
  FORMS_RESPONSES: 'forms:responses',

  // Relatórios
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  REPORTS_CREATE: 'reports:create',

  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_EDIT: 'dashboard:edit',

  // Notificações
  NOTIFICATIONS_VIEW: 'notifications:view',
  NOTIFICATIONS_SEND: 'notifications:send',
  NOTIFICATIONS_MANAGE: 'notifications:manage',

  // Cursos
  COURSES_VIEW: 'courses:view',
  COURSES_CREATE: 'courses:create',
  COURSES_EDIT: 'courses:edit',
  COURSES_DELETE: 'courses:delete',
  COURSES_ENROLL: 'courses:enroll',

  // Progresso
  PROGRESS_VIEW_OWN: 'progress:view:own',
  PROGRESS_VIEW_ALL: 'progress:view:all',
  PROGRESS_EDIT: 'progress:edit',

  // Integrações
  INTEGRATIONS_VIEW: 'integrations:view',
  INTEGRATIONS_MANAGE: 'integrations:manage',

  // Webhooks
  WEBHOOKS_VIEW: 'webhooks:view',
  WEBHOOKS_MANAGE: 'webhooks:manage',
} as const;
