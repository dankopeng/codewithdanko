import * as React from "react";
import { Link, useNavigate, useSearchParams } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/cloudflare";
import { buttonVariants } from "~/components/ui/button";
import type { LoginRequest } from "~/lib/auth";
import { useAuth } from "~/lib/useAuth";

export const meta: MetaFunction = () => [
  { title: "Login • CodeWithDanko" },
  { name: "description", content: "Login to your CodeWithDanko account" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const remember = form.get("remember") === "on";
    if (!email || !password) {
      setFormError("Email and password are required");
      setIsSubmitting(false);
      return;
    }
    try {
      const data: LoginRequest = { email, password, remember };
      await login(data);
      // 若有 redirectTo，優先導航到目標頁
      if (redirectTo && redirectTo !== '/dashboard') {
        navigate(redirectTo);
      }
    } catch (err: any) {
      setFormError(typeof err?.message === 'string' ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-10 sm:px-8">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">Login</h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        <Link to="/signup" className="underline">Create an account</Link>
      </p>

      {formError ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {formError}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-800 dark:text-gray-200">
              Password
            </label>
            <button
              type="button"
              className="text-xs text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setShow((v) => !v)}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="pt-2">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" name="remember" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Remember me
          </label>
        </div>

        <button
          type="submit"
          className={buttonVariants({ variant: "default" }) + " w-full"}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
