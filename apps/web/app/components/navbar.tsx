import * as React from "react";
import { useLocation } from "@remix-run/react";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "~/components/ui/button";
import { ThemeToggle } from "~/components/theme-toggle";
import { cn } from "~/lib/utils";

const links = [
  { href: "/", label: "Features" },
  { href: "https://github.com/dankopeng/codewithdanko/tree/main/docs", label: "Docs" },
  { href: "https://github.com/dankopeng/codewithdanko", label: "GitHub" },
];

export function Navbar({ rightSlot }: { rightSlot?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  // Close menu on route change
  React.useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash, location.search]);

  // Close on ESC
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  
  // Handle body scroll lock when menu is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  
  return (
    <header className={cn(
      "sticky top-0 z-30 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950",
      open && "border-b-0"
    )}>
      <div className="mx-auto relative flex h-16 items-center justify-between max-w-7xl px-6 sm:px-8 lg:grid lg:grid-cols-3 lg:items-center">
        <a href="/" className="flex h-16 items-center gap-3 text-lg font-bold text-gray-900 dark:text-white">
          <img src="/dankopeng_logo_black.png" alt="CodeWithDanko" className="block h-10 w-auto dark:hidden" />
          <img src="/dankopeng_logo_white.png" alt="CodeWithDanko" className="hidden h-10 w-auto dark:block" />
          <span className="text-xl">CodeWithDanko</span>
        </a>
        <nav className="hidden items-center justify-center gap-2 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={buttonVariants({ variant: "ghost", size: "sm" }) +
                " text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center justify-end gap-2 lg:flex">
          <ThemeToggle iconsOnly />
          {rightSlot}
        </div>
        {/* Mobile hamburger */}
        <button
          className={buttonVariants({ variant: "ghost", size: "sm" }) + " lg:hidden absolute right-6 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900 dark:text-gray-300"}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {/* Mobile menu overlay */}
      {open && <MobileOverlay onClose={() => setOpen(false)} rightSlot={rightSlot} />}
    </header>
  );
}

function MobileOverlay({ onClose, rightSlot }: { onClose: () => void; rightSlot?: React.ReactNode }) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  // Animate in on mount
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Focus trap inside panel
  React.useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const focusables = el.querySelectorAll<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    focusables[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-150 ease-out"
      onClick={onClose}
      aria-hidden="true"
      style={{ paddingRight: "env(safe-area-inset-right)" }}
    >
      <div
        ref={panelRef}
        role="menu"
        aria-orientation="vertical"
        aria-label="Mobile navigation"
        className={cn(
          "fixed top-16 left-0 right-0 w-full bg-white p-4 shadow-lg transition-all duration-300 ease-out dark:bg-gray-950",
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-start gap-3 max-w-7xl mx-auto">
          {links.map((l, index) => (
            <a
              key={l.href}
              href={l.href}
              role="menuitem"
              className={
                "block w-full py-3 px-2 text-lg font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-100 rounded-md transition-colors"
              }
              onClick={onClose}
            >
              {l.label}
            </a>
          ))}
        </div>
        
        <div className="mt-4 pt-4 flex flex-wrap items-center gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
          
          {rightSlot ? (
            <div className="flex items-center gap-2 ml-auto">
              {rightSlot}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
