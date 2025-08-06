import { useState } from "react";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { ThemeSwitcher } from "~/components/theme-switcher";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <header className="py-6 w-full border-b border-border/10 bg-background fixed top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container max-w-3xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-lg font-semibold tracking-tight">
            <img 
              src="/dankopeng_logo_black.png" 
              alt="DankoPeng Logo" 
              className="w-8 h-8 block dark:hidden"
            />
            <img 
              src="/dankopeng_logo_white.png" 
              alt="DankoPeng Logo" 
              className="w-8 h-8 hidden dark:block"
            />
            <span>CodeWithDanko</span>
          </Link>
          
          {/* 桌面導航 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link to="#documentation" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
            <a href="https://github.com/dankopeng/codewithdanko" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              GitHub
            </a>
            <div className="ml-2">
              <ThemeSwitcher />
            </div>
          </nav>
          
          {/* 手機菜單按鈕 */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="px-0 hover:bg-transparent"
            >
              <span className="sr-only">菜單</span>
              {mobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* 手機下拉菜單 */}
      {mobileMenuOpen && (
        <div className="md:hidden py-4 border-t border-border/10 mt-2">
          <div className="container max-w-3xl mx-auto px-4 space-y-3 flex flex-col items-end">
            <Link 
              to="#features" 
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="#documentation" 
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Docs
            </Link>
            <a 
              href="https://github.com/dankopeng/codewithdanko" 
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              GitHub
            </a>
            <div className="py-2">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
