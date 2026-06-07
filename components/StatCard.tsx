interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  accent?: string;
  trend?: "up" | "down" | "neutral";
}

export default function StatCard({
  label,
  value,
  unit,
  icon,
  accent = "#888888",
  trend,
}: StatCardProps) {
  const trendArrow = trend === "up" ? "↑" : trend === "down" ? "↓" : null;
  const trendColor =
    trend === "up" ? "#00ff87" : trend === "down" ? "#ff6b35" : "#888888";

  return (
    <div
      className="stat-card rounded-2xl p-4 flex flex-col gap-1"
      style={{ minWidth: 0 }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "#666666" }}
        >
          {label}
        </span>
        {icon && <span className="text-base">{icon}</span>}
      </div>
      <div className="flex items-end gap-1 mt-1">
        <span
          className="text-2xl font-bold leading-none"
          style={{ color: accent }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-sm font-medium mb-0.5"
            style={{ color: "#666666" }}
          >
            {unit}
          </span>
        )}
        {trendArrow && (
          <span
            className="text-xs font-bold mb-0.5 ml-1"
            style={{ color: trendColor }}
          >
            {trendArrow}
          </span>
        )}
      </div>
    </div>
  );
}
