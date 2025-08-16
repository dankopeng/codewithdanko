/**
 * 認證相關的工具函數和類型定義
 */

// 認證相關類型
export interface SignupRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthResponse {
  id: number;
  email: string;
  token: string;
  expiresIn: number;
}

export interface User {
  id: number;
  email: string;
  [key: string]: unknown;
}

// Token 存儲的 key
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

/**
 * 伺服器端認證函數
 */

/**
 * 從請求中獲取認證令牌
 * 僅在伺服器端使用
 */
export async function getAuthToken(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(cookie => {
      const [name, value] = cookie.split('=');
      return [name, decodeURIComponent(value)];
    })
  );
  
  return cookies[TOKEN_KEY] || null;
}

/**
 * 從請求中獲取用戶信息
 * 僅在伺服器端使用
 */
export async function getUserFromRequest(request: Request): Promise<User | null> {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(cookie => {
      const [name, value] = cookie.split('=');
      return [name, decodeURIComponent(value)];
    })
  );
  
  const userStr = cookies[USER_KEY];
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * 設置認證令牌到響應頭
 * 僅在伺服器端使用
 */
export function setAuthCookie(
  response: Response, 
  token: string, 
  user: User, 
  expiresIn: number
): Response {
  const expires = new Date(Date.now() + expiresIn * 1000);
  const cookieDomain = process.env.COOKIE_DOMAIN || 'localhost';
  
  // 設置 token cookie
  response.headers.append(
    'Set-Cookie',
    `${TOKEN_KEY}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=${cookieDomain}; Expires=${expires.toUTCString()}`
  );
  
  // 設置 user cookie
  response.headers.append(
    'Set-Cookie',
    `${USER_KEY}=${encodeURIComponent(JSON.stringify(user))}; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=${cookieDomain}; Expires=${expires.toUTCString()}`
  );
  
  // 設置 expiry cookie
  response.headers.append(
    'Set-Cookie',
    `${TOKEN_EXPIRY_KEY}=${expires.getTime()}; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=${cookieDomain}; Expires=${expires.toUTCString()}`
  );
  
  return response;
}

/**
 * 清除認證令牌
 * 僅在伺服器端使用
 */
export function clearAuthCookie(response: Response): Response {
  const cookieDomain = process.env.COOKIE_DOMAIN || 'localhost';
  
  // 清除 token cookie
  response.headers.append(
    'Set-Cookie',
    `${TOKEN_KEY}=; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=${cookieDomain}; Max-Age=0`
  );
  
  // 清除 user cookie
  response.headers.append(
    'Set-Cookie',
    `${USER_KEY}=; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=${cookieDomain}; Max-Age=0`
  );
  
  // 清除 expiry cookie
  response.headers.append(
    'Set-Cookie',
    `${TOKEN_EXPIRY_KEY}=; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=${cookieDomain}; Max-Age=0`
  );
  
  return response;
}

/**
 * 客戶端認證函數
 */

/**
 * 獲取存儲的令牌
 * 僅在客戶端使用
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 獲取存儲的用戶信息
 * 僅在客戶端使用
 */
export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * 存儲認證信息
 * 僅在客戶端使用
 */
export function storeAuth(token: string, user: User, expiresIn: number): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_EXPIRY_KEY, (Date.now() + expiresIn * 1000).toString());
}

/**
 * 清除認證信息
 * 僅在客戶端使用
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

/**
 * 檢查是否已認證
 * 僅在客戶端使用
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem(TOKEN_KEY);
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (!token || !expiryStr) return false;
  
  const expiry = parseInt(expiryStr, 10);
  return !isNaN(expiry) && expiry > Date.now();
}
