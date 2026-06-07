"use client";

interface RingProps {
  value: number;
  max: number;
  color: string;
  label: string;
  sublabel?: string;
  size?: number;
  glowClass?: string;
}

export default function Ring({
  value,
  max,
  color,
  label,
  sublabel,
  size = 160,
  glowClass = "",
}: RingProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  const displayValue =
    max === 21
      ? value.toFixed(1)
      : `${Math.round(value)}%`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={glowClass}
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.12"
          />
          {/* Progress arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="ring-animate"
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </svg>
        {/* Center text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ color }}
        >
          <span
            className="font-bold leading-none"
            style={{ fontSize: max === 21 ? "1.6rem" : "1.8rem", color }}
          >
            {displayValue}
          </span>
          {sublabel && (
            <span
              className="text-xs mt-1 font-medium tracking-wide uppercase"
              style={{ color: "#888888" }}
            >
              {sublabel}
            </span>
          )}
        </div>
      </div>
      <div className="text-center">
        <p
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: "#aaaaaa" }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
