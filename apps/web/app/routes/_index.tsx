import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "CodeWithDanko - Modern Fullstack Template" },
    {
      name: "description",
      content:
        "A production-ready fullstack template with Remix, Cloudflare Workers, TypeScript, and Tailwind CSS. Build your next project faster with our modern tech stack.",
    },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
  ];
};

// 技术栈特性
const techStack = [
  { name: "Remix", description: "Full-stack React framework with server-side rendering and optimized data loading", icon: "⚡", color: "bg-blue-500" },
  { name: "Cloudflare Workers", description: "Edge computing platform for ultra-fast global deployment", icon: "☁️", color: "bg-orange-500" },
  { name: "TypeScript", description: "Type-safe development with enhanced developer experience", icon: "🔷", color: "bg-blue-600" },
  { name: "Tailwind CSS", description: "Utility-first CSS framework for rapid UI development", icon: "🎨", color: "bg-cyan-500" },
  { name: "Cloudflare D1", description: "Serverless SQL database at the edge for fast data access", icon: "🗄️", color: "bg-green-500" },
  { name: "Turborepo", description: "High-performance build system for monorepo development", icon: "🚀", color: "bg-purple-500" },
];

// 模板特性
const features = [
  { title: "Monorepo Architecture", description: "Organized codebase with separate frontend, backend, and shared packages managed by Turborepo", icon: "📦" },
  { title: "Full-Stack TypeScript", description: "End-to-end type safety from database to UI with shared types and utilities", icon: "🔒" },
  { title: "Edge-First Deployment", description: "Deploy globally on Cloudflare's edge network for maximum performance", icon: "🌍" },
  { title: "Modern UI Components", description: "Pre-built components using shadcn/ui and Radix UI primitives", icon: "🧩" },
  { title: "Authentication Ready", description: "Built-in user authentication with JWT and OAuth support", icon: "🔐" },
  { title: "Database Integration", description: "Seamless integration with Cloudflare D1 and R2 storage", icon: "💾" },
  { title: "SEO Optimized", description: "Server-side rendering with meta tags and structured data support", icon: "📈" },
  { title: "Developer Experience", description: "Hot reload, TypeScript, ESLint, Prettier, and comprehensive tooling", icon: "⚡" },
];

// 使用案例
const useCases = [
  { title: "SaaS Applications", description: "Build subscription-based software with user management and billing", examples: ["Dashboard apps", "Analytics platforms", "Project management tools"] },
  { title: "E-commerce Sites", description: "Create online stores with product catalogs and payment processing", examples: ["Online marketplaces", "Digital product stores", "Subscription commerce"] },
  { title: "Content Platforms", description: "Develop blogs, documentation sites, and content management systems", examples: ["Corporate blogs", "Documentation sites", "News platforms"] },
  { title: "Landing Pages", description: "Fast, SEO-optimized marketing pages and product showcases", examples: ["Product launches", "Marketing campaigns", "Portfolio sites"] },
];

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 py-20 dark:from-slate-900 dark:to-slate-800 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Build Modern Fullstack Apps Using{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CodeWithDanko</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 sm:text-xl">
              A production-ready template featuring Remix, Cloudflare Workers, TypeScript, and modern tooling. Skip the setup and start building your next great project today.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <a
                href="https://github.com/dankopeng/codewithdanko"
                className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get Started
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </a>
              <a
                href="https://github.com/dankopeng/codewithdanko/tree/main/docs"
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="bg-white py-16 dark:bg-gray-900 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Modern Tech Stack</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Built with the latest technologies for optimal performance and developer experience</p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {techStack.map((tech) => (
              <div key={tech.name} className="group relative overflow-hidden rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${tech.color} text-white`}>
                    <span className="text-2xl">{tech.icon}</span>
                  </div>
                  <h3 className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">{tech.name}</h3>
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-16 dark:bg-gray-800 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Everything You Need</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">A comprehensive template with all the features you need to build modern web applications</p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="relative rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:bg-gray-700">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-white py-16 dark:bg-gray-900 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Perfect For Any Project</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Whether you're building a SaaS app, e-commerce site, or content platform, this template has you covered</p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="rounded-lg border bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{useCase.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{useCase.description}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Examples:</h4>
                  <ul className="mt-2 space-y-1">
                    {useCase.examples.map((example) => (
                      <li key={example} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <svg className="mr-2 h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section id="documentation" className="bg-blue-600 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to Get Started?</h2>
            <p className="mt-4 text-lg text-blue-100">Clone the repository and start building your next project in minutes</p>
            <div className="mt-8">
              <div className="overflow-x-auto rounded-lg bg-gray-900 p-4">
                <code className="block whitespace-nowrap text-sm text-green-400 sm:text-base">git clone https://github.com/dankopeng/codewithdanko your-project</code>
              </div>
            </div>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <a
                href="https://github.com/dankopeng/codewithdanko"
                className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-gray-50"
              >
                View on GitHub
                <svg className="ml-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://github.com/dankopeng/codewithdanko/tree/main/docs" className="inline-flex items-center rounded-lg border border-white/20 bg-transparent px-6 py-3 text-base font-semibold text-white hover:bg-white/10">
                Documentation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16 dark:bg-gray-800 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl leading-tight font-bold text-gray-900 dark:text-white sm:text-3xl md:text-4xl">99.9%</div>
              <div className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl leading-tight font-bold text-gray-900 dark:text-white sm:text-3xl md:text-4xl">&lt;100ms</div>
              <div className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl leading-tight font-bold text-gray-900 dark:text-white sm:text-3xl md:text-4xl">100+</div>
              <div className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">Edge Locations</div>
            </div>
            <div className="text-center">
              <div className="break-all text-2xl leading-tight font-bold text-gray-900 dark:text-white sm:text-3xl md:text-4xl">TypeScript</div>
              <div className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">First</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
