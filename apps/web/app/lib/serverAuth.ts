/**
 * 服務器端認證服務
 * 提供在 Remix 服務器端使用的認證方法
 */

import { serverFetch } from "./api";
import { SignupRequest, LoginRequest, getUserFromRequest } from "./auth";

/**
 * 創建服務器端認證服務
 * @param request 當前請求對象
 * @returns 服務器端認證服務對象
 */
export function createServerAuth(request: Request) {
  return {
    /**
     * 服務器端註冊
     * @param data 註冊數據
     * @returns 註冊響應
     */
    async signup(data: SignupRequest) {
      try {
        return await serverFetch("/api/auth/signup", request, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
      } catch (e: any) {
        // 兼容部分後端實作使用 /api/auth/register
        if (typeof e?.status === 'number' && e.status === 404) {
          return await serverFetch("/api/auth/register", request, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });
        }
        throw e;
      }
    },

    /**
     * 服務器端登入
     * @param data 登入數據
     * @returns 登入響應
     */
    async login(data: LoginRequest) {
      return await serverFetch("/api/auth/login", request, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    },

    /**
     * 服務器端登出
     * @returns 登出響應
     */
    async logout() {
      return await serverFetch("/api/auth/logout", request, {
        method: "POST"
      });
    },

    /**
     * 獲取當前用戶
     * @returns 當前用戶信息
     */
    async getUser() {
      return await getUserFromRequest(request);
    }
  };
}
