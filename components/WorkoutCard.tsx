interface Workout {
  name: string;
  duration: string;
  strain: number;
  calories: number;
}

interface WorkoutCardProps {
  workouts: Workout[];
  dayStrain: number;
}

export default function WorkoutCard({ workouts, dayStrain }: WorkoutCardProps) {
  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-8 rounded-full"
            style={{ background: "linear-gradient(180deg, #ff6b35, #cc4a1a)" }}
          />
          <h2 className="text-lg font-bold tracking-tight" style={{ color: "#ffffff" }}>
            Today&apos;s Workouts
          </h2>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#666666" }}>
            Day Strain
          </span>
          <span className="text-xl font-bold" style={{ color: "#ff6b35" }}>
            {dayStrain.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {workouts.map((workout, i) => (
          <div
            key={i}
            className="rounded-xl p-4 flex items-center justify-between"
            style={{
              background: "rgba(255, 107, 53, 0.06)",
              border: "1px solid rgba(255, 107, 53, 0.15)",
            }}
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold" style={{ color: "#ffffff" }}>
                {workout.name}
              </span>
              <span className="text-xs" style={{ color: "#888888" }}>
                {workout.duration} &middot; {workout.calories} kcal
              </span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#666666" }}
              >
                Strain
              </span>
              <span className="text-lg font-bold" style={{ color: "#ff6b35" }}>
                {workout.strain.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
