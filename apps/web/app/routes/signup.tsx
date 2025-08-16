import * as React from "react";
import { Form, useActionData, useNavigation, Link } from "@remix-run/react";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { buttonVariants } from "~/components/ui/button";
import { createServerAuth } from "~/lib/serverAuth";
import type { SignupRequest } from "~/lib/auth";

export const meta: MetaFunction = () => [
  { title: "Sign up • CodeWithDanko" },
  { name: "description", content: "Create your CodeWithDanko account" },
];

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");

  if (!email || !password) {
    return json({ ok: false, formError: "Email and password are required" }, { status: 400 });
  }

  try {
    const data: SignupRequest = { email, password };
    const auth = createServerAuth(request);
    await auth.signup(data);
    // After signup, redirect to login
    return redirect(`/login`);
  } catch (err: any) {
    const status = typeof err?.status === "number" ? err.status : 500;
    const message = typeof err?.message === "string" ? err.message : "Signup failed";
    return json({ ok: false, formError: message }, { status });
  }
}

export default function SignupPage() {
  const actionData = useActionData<typeof action>();
  const nav = useNavigation();
  const isSubmitting = nav.state === "submitting";
  const [show, setShow] = React.useState(false);

  return (
    <div className="mx-auto max-w-md px-6 py-10 sm:px-8">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">Create account</h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        <Link to="/login" className="underline">Already have an account? Sign in</Link>
      </p>

      {actionData && (actionData as any).formError ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {(actionData as any).formError}
        </div>
      ) : null}

      <Form method="post" className="space-y-4" replace>
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
            autoComplete="new-password"
            required
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>

        <button
          type="submit"
          className={buttonVariants({ variant: "default" }) + " w-full"}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating…" : "Create account"}
        </button>
      </Form>
    </div>
  );
}
