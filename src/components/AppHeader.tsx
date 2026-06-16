import { SidebarTrigger } from "@/components/ui/sidebar";
import { DisclaimerBadge } from "./DisclaimerBadge";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="shrink-0" />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-bold leading-tight md:text-lg">PhandaSmart</h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          Your AI Job Hustle Partner
        </p>
      </div>
      <DisclaimerBadge />
    </header>
  );
}
