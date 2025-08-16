/**
 * API 請求相關的工具函數和類型定義
 */

import { getAuthToken, getToken } from './auth';

// API 錯誤類
export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number = 500,
    code: string = 'unknown_error',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// 安全解析 JSON
export function safeParseJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return text;
  }
}

/**
 * 伺服器端 API 請求函數
 */

/**
 * 伺服器端 API 請求
 * @param path API 路徑
 * @param request 原始請求對象
 * @param options 請求選項
 * @returns 響應數據
 */
export async function serverFetch<T = any>(
  path: string,
  request: Request,
  options: RequestInit = {}
): Promise<T> {
  const url = buildApiUrl(path);
  const headers = new Headers(options.headers || {});
  
  // 設置默認頭部
  headers.set('accept', headers.get('accept') || 'application/json');
  if (options.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  
  // 添加認證令牌
  const token = await getAuthToken(request);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // 請求配置
  const reqInit: RequestInit = {
    method: options.method || (options.body ? 'POST' : 'GET'),
    headers,
    body: options.body,
    redirect: 'manual',
  };
  
  try {
    // 在 Worker 環境中使用服務綁定
    let res: Response;
    
    // 在 Worker 環境中使用 API 服務綁定
    if (typeof (globalThis as any).API !== 'undefined') {
      // API Worker 的內部路由即使用 '/api/*' 前綴，此處保持一致
      const relativePath = buildApiUrl(path);
      // 某些情況下 Service Binding 需要絕對 URL；主機名不重要，僅用於構造
      const absoluteUrl = new URL(relativePath, 'https://service.binding').toString();
      console.log('使用 API 服務綁定發送請求:', absoluteUrl);
      res = await (globalThis as any).API.fetch(absoluteUrl, reqInit);
    } else if (typeof (globalThis as any).API_BASE_URL === 'string' && (globalThis as any).API_BASE_URL) {
      // 無服務綁定時，優先使用後端完整域名，避免打到自身 Worker 導致 404
      const base = (globalThis as any).API_BASE_URL.replace(/\/$/, '');
      const fullUrl = `${base}${url}`;
      console.log('使用 API_BASE_URL 發送請求:', fullUrl);
      res = await fetch(fullUrl, reqInit);
    } else {
      // 在非 Worker 綁定環境中使用標準 fetch
      // 若為相對路徑，需補全為絕對 URL（使用當前請求的 origin）
      let fetchUrl = url;
      if (url.startsWith('/')) {
        const origin = new URL(request.url).origin;
        fetchUrl = `${origin}${url}`;
      }
      console.log('非 Worker 環境中使用 URL:', fetchUrl);
      res = await fetch(fetchUrl, reqInit);
    }
    
    // 讀取響應文本
    const respText = await res.clone().text();
    
    // 解析響應體
    const contentType = res.headers.get('content-type') || '';
    const maybeJson = contentType.includes('application/json');
    const respBody = maybeJson ? safeParseJSON(respText) : respText;
    
    if (!res.ok) {
      throw new ApiError(
        respBody.message || `API request failed with status ${res.status}`,
        res.status,
        respBody.code || 'api_error',
        respBody.details
      );
    }
    
    return respBody as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      `API request failed: ${error instanceof Error ? error.message : String(error)}`,
      522, // 使用 Cloudflare 的 522 錯誤代碼表示連接超時
      'api_connection_error',
      { url, method: reqInit.method }
    );
  }
}

/**
 * 客戶端 API 請求函數
 */

/**
 * 客戶端 API 請求
 * @param path API 路徑
 * @param options 請求選項
 * @returns 響應數據
 */
export async function clientFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  console.log('clientFetch 原始路徑:', path);
  
  // 構建 API URL
  let url = buildApiUrl(path);
  console.log('buildApiUrl 處理後:', url);
  
  // 在瀏覽器環境中，確保 URL 是完整的
  if (typeof window !== 'undefined') {
    // 如果 URL 是相對路徑，添加當前域名作為基礎 URL
    if (url.startsWith('/')) {
      const baseUrl = window.location.origin;
      url = `${baseUrl}${url}`;
      console.log('添加域名後的完整 URL:', url);
    } else {
      console.log('URL 已經是完整路徑或非相對路徑');
    }
  }
  
  const headers = new Headers(options.headers || {});
  
  // 設置默認頭部
  headers.set('accept', headers.get('accept') || 'application/json');
  if (options.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  
  // 添加認證令牌
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // 請求配置
  const reqInit: RequestInit = {
    method: options.method || (options.body ? 'POST' : 'GET'),
    headers,
    body: options.body,
    credentials: 'include',
  };
  
  try {
    const res = await fetch(url, reqInit);
    
    // 讀取響應文本
    const respText = await res.clone().text();
    
    // 解析響應體
    const contentType = res.headers.get('content-type') || '';
    const maybeJson = contentType.includes('application/json');
    const respBody = maybeJson ? safeParseJSON(respText) : respText;
    
    if (!res.ok) {
      throw new ApiError(
        respBody.message || `API request failed with status ${res.status}`,
        res.status,
        respBody.code || 'api_error',
        respBody.details
      );
    }
    
    return respBody as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      `API request failed: ${error instanceof Error ? error.message : String(error)}`,
      522, // 使用 Cloudflare 的 522 錯誤代碼表示連接超時
      'api_connection_error',
      { url, method: reqInit.method }
    );
  }
}

/**
 * 構建 API URL
 * @param path API 路徑
 * @returns 完整的 API URL
 */
function buildApiUrl(path: string): string {
  // 確保路徑以 / 開頭
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  console.log('buildApiUrl 輸入路徑:', normalizedPath);
  
  // 檢查路徑是否已經包含 /api 前綴
  if (normalizedPath.startsWith('/api/')) {
    console.log('buildApiUrl 已有API前綴路徑:', normalizedPath);
    return normalizedPath;
  }
  
  // 特別處理認證相關路徑
  if (normalizedPath.startsWith('/auth/')) {
    // 對所有認證路徑統一添加 /api 前綴
    const result = `/api${normalizedPath}`;
    console.log('buildApiUrl 認證路徑輸出:', result);
    return result;
  }
  
  // 其他路徑直接返回
  console.log('buildApiUrl 其他路徑輸出:', normalizedPath);
  return normalizedPath;
}
