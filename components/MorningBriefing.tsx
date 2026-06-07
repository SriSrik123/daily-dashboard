interface MorningBriefingProps {
  text: string;
  workoutPlan: string;
  notes: string;
}

export default function MorningBriefing({
  text,
  workoutPlan,
  notes,
}: MorningBriefingProps) {
  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div
          className="w-2 h-8 rounded-full"
          style={{ background: "linear-gradient(180deg, #00ff87, #00cc6a)" }}
        />
        <h2 className="text-lg font-bold tracking-tight" style={{ color: "#ffffff" }}>
          Morning Briefing
        </h2>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: "#aaaaaa" }}>
        {text}
      </p>

      <div className="flex flex-col gap-3">
        <div
          className="rounded-xl p-4"
          style={{
            background: "rgba(255, 107, 53, 0.08)",
            border: "1px solid rgba(255, 107, 53, 0.2)",
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "#ff6b35" }}
          >
            Today&apos;s Plan
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#cccccc" }}>
            {workoutPlan}
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "rgba(59, 130, 246, 0.08)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "#3b82f6" }}
          >
            Notes
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#cccccc" }}>
            {notes}
          </p>
        </div>
      </div>
    </div>
  );
}
