// Shared TypeScript types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'editor' | 'user';
  avatar_url?: string;
  site_id: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  published: boolean;
  featured: boolean;
  author_id: string;
  category_id?: string;
  site_id: string;
  tags: string[];
  image_url?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}