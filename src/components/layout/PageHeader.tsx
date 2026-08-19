import type { ReactNode } from "react";

import { AppMenu } from "@/components/layout/AppMenu";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 -mx-3 mb-4 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 bg-card/90 px-3 py-2.5 shadow-sm backdrop-blur-sm sm:mx-0 sm:rounded-lg sm:px-4">
      <AppMenu />
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
    </header>
  );
}
