import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accent?: "indigo" | "emerald" | "amber" | "rose";
}

const ACCENT_MAP = {
  indigo: {
    icon: "text-indigo-400 bg-indigo-500/10",
    trend: "text-indigo-400",
  },
  emerald: {
    icon: "text-emerald-400 bg-emerald-500/10",
    trend: "text-emerald-400",
  },
  amber: {
    icon: "text-amber-400 bg-amber-500/10",
    trend: "text-amber-400",
  },
  rose: {
    icon: "text-rose-400 bg-rose-500/10",
    trend: "text-rose-400",
  },
};

export function MetricCard({ label, value, sub, icon: Icon, trend, accent = "indigo" }: MetricCardProps) {
  const colors = ACCENT_MAP[accent];

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
            <span className="text-2xl font-bold tabular-nums text-slate-100">{value}</span>
            {sub && <span className="text-xs text-slate-500">{sub}</span>}
          </div>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colors.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && (
          <div className={cn("mt-3 flex items-center gap-1 text-xs font-medium", colors.trend)}>
            <span>{trend.value > 0 ? "+" : ""}{trend.value}%</span>
            <span className="text-slate-500 font-normal">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
