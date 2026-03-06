import type { ReactNode } from "react";

interface AppFooterProps {
  children: ReactNode;
}

/**
 * Footer bar wrapper shown at the bottom of every page.
 * Composable — place content like VersionInfo inside.
 */
export function AppFooter({ children }: AppFooterProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 border-t border-[var(--border)] bg-[var(--bg-panel)] shrink-0">
      {children}
    </div>
  );
}
