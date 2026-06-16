import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepProgress({
  current,
  labels,
}: {
  current: number;
  labels: string[];
}) {
  const total = labels.length;
  const pct = ((current - 1) / (total - 1)) * 100;
  return (
    <div className="w-full">
      <div className="relative mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${Math.max(8, pct)}%` }}
        />
      </div>
      <ol className="flex items-center justify-between gap-2">
        {labels.map((label, i) => {
          const step = i + 1;
          const done = step < current;
          const active = step === current;
          return (
            <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition",
                  done && "bg-primary text-primary-foreground",
                  active && "bg-primary text-primary-foreground ring-4 ring-primary/15",
                  !done && !active && "bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : step}
              </span>
              <span
                className={cn(
                  "hidden truncate text-xs font-medium sm:inline",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
