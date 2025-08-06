import { Navbar } from "~/components/navbar";
import { Footer } from "~/components/footer";
import { Link } from "@remix-run/react";

export default function BadGateway() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="container max-w-screen-xl py-16 text-center">
          <h1 className="mb-4 text-6xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
            502
          </h1>
          <h2 className="mb-6 text-2xl font-semibold text-gray-700 dark:text-gray-300 sm:text-3xl">
            閘道錯誤
          </h2>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            伺服器作為閘道或代理時，從上游伺服器接收到無效的回應。
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/"
              className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              返回首頁
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-gray-100 px-6 py-3 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              重新整理
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
