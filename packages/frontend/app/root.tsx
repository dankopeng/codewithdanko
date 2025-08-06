import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";

import "./tailwind.css";

export const meta: MetaFunction = () => {
  return [
    { title: "CodeWithDanko - Modern Fullstack Template" },
    { name: "description", content: "A modern fullstack template with Remix, Cloudflare Workers, TypeScript, and Tailwind CSS. Build your next project faster with our production-ready template." },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
    { charSet: "utf-8" },
  ];
};

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;600;700;800&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant" className="scroll-smooth">
      <head>
        <Meta />
        <Links />
        <style dangerouslySetInnerHTML={{ __html: `
          /* Hide all content until fonts are loaded */
          html.font-loading {
            visibility: hidden;
          }
          html.fonts-loaded {
            visibility: visible;
          }
          /* Add a loading spinner that shows only during font loading */
          .font-loading-spinner {
            display: none;
          }
          html.font-loading .font-loading-spinner {
            display: block;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: #000;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: translate(-50%, -50%) rotate(360deg); }
          }
        `}} />
        <script dangerouslySetInnerHTML={{ __html: `
          // Add font loading class immediately
          document.documentElement.classList.add('font-loading');
          
          // Create and append loading spinner
          const spinner = document.createElement('div');
          spinner.className = 'font-loading-spinner';
          document.head.appendChild(spinner);
          
          // Function to remove loading state
          function removeFontLoading() {
            document.documentElement.classList.remove('font-loading');
            document.documentElement.classList.add('fonts-loaded');
            if (spinner && spinner.parentNode) {
              spinner.parentNode.removeChild(spinner);
            }
          }
          
          // Use requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            if ("fonts" in document) {
              // Use a timeout as a fallback in case font loading takes too long
              const timeoutId = setTimeout(removeFontLoading, 2000);
              
              Promise.all([
                document.fonts.load('300 1em "Noto Sans TC"'),
                document.fonts.load('400 1em "Noto Sans TC"'),
                document.fonts.load('500 1em "Noto Sans TC"'),
                document.fonts.load('600 1em "Noto Sans TC"'),
                document.fonts.load('700 1em "Noto Sans TC"'),
                document.fonts.load('800 1em "Noto Sans TC"'),
                document.fonts.load('400 1em "Inter"'),
                document.fonts.load('500 1em "Inter"'),
                document.fonts.load('600 1em "Inter"'),
                document.fonts.load('700 1em "Inter"')
              ])
              .then(() => {
                clearTimeout(timeoutId);
                removeFontLoading();
              })
              .catch(err => {
                console.error('Font loading failed:', err);
                clearTimeout(timeoutId);
                removeFontLoading();
              });
            } else {
              // Fallback for browsers that don't support the Font Loading API
              removeFontLoading();
            }
          });
        `}} />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
