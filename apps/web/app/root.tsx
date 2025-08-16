import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  Link,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Navbar } from "~/components/navbar";
import { ThemeToggle } from "~/components/theme-toggle";
import { Footer } from "~/components/footer";
import { buttonVariants } from "~/components/ui/button";
import { AuthProvider, useAuth } from "~/lib/useAuth";
import { getUserFromRequest } from "~/lib/auth";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "icon", href: "/favicon.ico" },
];

// 加載用戶信息
export async function loader({ request }: LoaderFunctionArgs) {
  // 使用新的服務層獲取用戶信息
  const user = await getUserFromRequest(request);
  return json({ user });
}

function NavAuthSlot() {
  const { user, logout, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
          {user.email}
        </Link>
        <button onClick={logout} className={buttonVariants({ variant: "secondary", size: "sm" })}>Logout</button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Link to="/login" className={buttonVariants({ variant: "secondary", size: "sm" })}>Login</Link>
      <Link to="/signup" className={buttonVariants({ variant: "default", size: "sm" })}>Signup</Link>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  useLoaderData<typeof loader>();
  
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* Theme init to avoid FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const t = localStorage.getItem('theme'); const m = window.matchMedia('(prefers-color-scheme: dark)'); const useDark = t === 'dark' || (t === 'system' && m.matches) || (!t && m.matches); const r = document.documentElement.classList; useDark ? r.add('dark') : r.remove('dark'); } catch (_) {} })();`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <Navbar rightSlot={<NavAuthSlot />} />
          <main className="flex-grow">{children}</main>
        </AuthProvider>
        <Footer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useLoaderData<typeof loader>();
  return <Outlet />;
}
