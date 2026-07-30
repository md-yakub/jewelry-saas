import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export function Card({
  title,
  subtitle,
  className,
  children,
}: {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-panel border border-slate-200 bg-white p-4 shadow-panel",
        className,
      )}
    >
      {(title || subtitle) && (
        <div className="mb-3">
          {title ? (
            <h3 className="font-heading text-lg text-slate-900">{title}</h3>
          ) : null}
          {subtitle ? (
            <p className="text-sm text-slate-500">{subtitle}</p>
          ) : null}
        </div>
      )}
      {children}
    </div>
  );
}
