import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { clearAuthCookie } from "~/lib/auth";
import { createServerAuth } from "~/lib/serverAuth";

export async function action({ request }: ActionFunctionArgs) {
  try {
    // 使用統一服務層登出
    const auth = createServerAuth(request);
    await auth.logout();
  } catch (error) {
    console.error("Logout error:", error);
    // 即使 API 調用失敗，也繼續本地登出
  }
  
  // 創建重定向響應並清除認證 Cookie
  const response = redirect("/login");
  return clearAuthCookie(response);
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // 如果用戶直接訪問此路由，先執行登出操作
    const auth = createServerAuth(request);
    await auth.logout();
  } catch (error) {
    console.error("Logout error:", error);
    // 即使 API 調用失敗，也繼續本地登出
  }
  
  // 創建重定向響應並清除認證 Cookie
  const response = redirect("/login");
  return clearAuthCookie(response);
}
