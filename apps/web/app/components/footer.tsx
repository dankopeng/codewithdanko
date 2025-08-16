import * as React from "react";
import { Github, BookOpenText, MessageSquare } from "lucide-react";
import { buttonVariants } from "~/components/ui/button";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 py-10 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col">
            <p>© {new Date().getFullYear()} DANKO AI LIMITED.</p>
            <p>Built with ❤️ for developers.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              className={buttonVariants({ variant: "ghost", size: "sm" })}
              href="https://github.com/dankopeng/codewithdanko"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="mr-2 h-4 w-4" /> Repo
            </a>
            <a
              className={buttonVariants({ variant: "ghost", size: "sm" })}
              href="https://github.com/dankopeng/codewithdanko/tree/main/docs"
              target="_blank"
              rel="noreferrer"
            >
              <BookOpenText className="mr-2 h-4 w-4" /> Docs
            </a>
            <a
              className={buttonVariants({ variant: "ghost", size: "sm" })}
              href="mailto:hello@dankopeng.com"
              target="_blank"
              rel="noreferrer"
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Feedback
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
