import { type ReactNode } from "react";

export function StepShell({ stepKey, children }: { stepKey: string | number; children: ReactNode }) {
  return (
    <div
      key={stepKey}
      className="animate-in fade-in slide-in-from-right-4 duration-300"
    >
      {children}
    </div>
  );
}
