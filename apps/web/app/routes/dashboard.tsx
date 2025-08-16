import * as React from "react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { buttonVariants } from "~/components/ui/button";
import { useAuth, withAuth } from "~/lib/useAuth";

export const meta: MetaFunction = () => [
  { title: "Dashboard • CodeWithDanko" },
];

// 服務端無法讀取 localStorage 中的令牌，僅返回空數據。
// 實際的保護與用戶顯示由 withAuth 與客戶端狀態完成。
export async function loader({ request }: LoaderFunctionArgs) {
  return json({});
}

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 min-h-[calc(100vh-16rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        {user ? (
          <p className="text-sm text-gray-700 dark:text-gray-300">Welcome, <strong>{user.email}</strong></p>
        ) : null}
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">This is your protected dashboard. Only authenticated users can see this page.</p>
        <div className="mt-6 space-y-6">
          <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-700 dark:text-blue-200">Authentication is working correctly. This page is protected.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Link to="/" className={buttonVariants({ variant: "default", size: "sm" })}>Go to landing</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
// 使用高階組件包裝儀表板頁面，確保只有已認證的用戶可以訪問
export default withAuth(DashboardPage);
