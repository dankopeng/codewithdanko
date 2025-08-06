import { Navbar } from "~/components/navbar";
import { Footer } from "~/components/footer";
import { Link } from "@remix-run/react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="container max-w-screen-xl py-16 text-center">
          <h1 className="mb-4 text-6xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
            404
          </h1>
          <h2 className="mb-6 text-2xl font-semibold text-gray-700 dark:text-gray-300 sm:text-3xl">
            頁面未找到
          </h2>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            抱歉，我們找不到您要訪問的頁面。
          </p>
          <div className="flex justify-center">
            <Link
              to="/"
              className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              返回首頁
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
