import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatCurrency, getChangeColor } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  isCurrency?: boolean;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  children?: React.ReactNode;
  className?: string;
}

export function StatCard({
  title, value, isCurrency = false, change, changeLabel = "vs yesterday",
  icon, iconBg = "bg-amber-50", children, className,
}: StatCardProps) {
  const displayValue = isCurrency ? formatCurrency(Number(value)) : value;
  const changeColor = change !== undefined ? getChangeColor(change) : "";

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{title}</p>
            <p className="mt-1.5 text-2xl font-bold text-slate-900 truncate">{displayValue}</p>
            {change !== undefined && (
              <div className={cn("mt-1 flex items-center gap-1 text-xs font-medium", changeColor)}>
                {change > 0 ? <TrendingUp className="h-3 w-3" /> : change < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                <span>{Math.abs(change).toFixed(1)}% {changeLabel}</span>
              </div>
            )}
            {children}
          </div>
          {icon && (
            <div className={cn("ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full", iconBg)}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
