interface DayStrain {
  day: string;
  strain: number;
}

interface WeeklyChartProps {
  data: DayStrain[];
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const maxStrain = 21;
  const chartHeight = 80;
  const barWidth = 28;
  const gap = 12;
  const totalWidth = data.length * (barWidth + gap) - gap;

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div
          className="w-2 h-8 rounded-full"
          style={{ background: "linear-gradient(180deg, #ff6b35, #cc4a1a)" }}
        />
        <h2 className="text-lg font-bold tracking-tight" style={{ color: "#ffffff" }}>
          Weekly Strain
        </h2>
      </div>

      <div className="flex items-end justify-center" style={{ gap: gap }}>
        {data.map((item, i) => {
          const barH = item.strain > 0 ? Math.max((item.strain / maxStrain) * chartHeight, 4) : 4;
          const isToday = i === 4; // Friday = today
          const isEmpty = item.strain === 0;

          return (
            <div key={i} className="flex flex-col items-center" style={{ gap: 6 }}>
              {/* Strain label */}
              <span
                className="text-xs font-semibold"
                style={{ color: isEmpty ? "transparent" : isToday ? "#ff6b35" : "#888888" }}
              >
                {item.strain > 0 ? item.strain.toFixed(1) : ""}
              </span>

              {/* Bar */}
              <svg width={barWidth} height={chartHeight} style={{ display: "block" }}>
                {/* Background bar */}
                <rect
                  x="0"
                  y="0"
                  width={barWidth}
                  height={chartHeight}
                  rx="6"
                  fill="rgba(255,107,53,0.08)"
                />
                {/* Fill bar */}
                {item.strain > 0 && (
                  <rect
                    x="0"
                    y={chartHeight - barH}
                    width={barWidth}
                    height={barH}
                    rx="6"
                    fill={isToday ? "#ff6b35" : "rgba(255,107,53,0.45)"}
                    style={{
                      filter: isToday
                        ? "drop-shadow(0 0 6px rgba(255,107,53,0.7))"
                        : "none",
                    }}
                  />
                )}
              </svg>

              {/* Day label */}
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: isToday ? "#ff6b35" : "#555555" }}
              >
                {item.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scale labels */}
      <div className="flex justify-between mt-1">
        <span className="text-xs" style={{ color: "#444444" }}>0</span>
        <span className="text-xs" style={{ color: "#444444" }}>21 max</span>
      </div>
    </div>
  );
}
