import { PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "No results found",
  description = "Try adjusting your search or filter to find what you're looking for.",
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        {icon ?? <PackageSearch className="h-7 w-7 text-slate-400" />}
      </div>
      <h3 className="mb-1 text-base font-semibold text-slate-800">{title}</h3>
      <p className="mb-4 max-w-sm text-sm text-slate-500">{description}</p>
      {action}
    </div>
  );
}
