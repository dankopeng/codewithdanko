// Shared constants
export const SITE_CONFIG = {
  SITE_ZH: 'site_zh',
  SITE_EN: 'site_en'
} as const;

export const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  USER: 'user'
} as const;

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  POSTS: '/api/posts',
  USERS: '/api/users'
} as const;