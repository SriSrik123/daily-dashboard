import Ring from "@/components/Ring";
import StatCard from "@/components/StatCard";
import MorningBriefing from "@/components/MorningBriefing";
import WorkoutCard from "@/components/WorkoutCard";
import WeeklyChart from "@/components/WeeklyChart";
import { fetchWhoopDashboard } from "@/lib/whoop";
import { loadTokens } from "@/lib/whoop";
import staticData from "@/data/dashboard.json";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function recoveryStatus(score: number): { label: string; text: string } {
  if (score >= 67) return { label: "Green — Ready to Train", text: "Your body is well-recovered and primed for high output." };
  if (score >= 34) return { label: "Yellow — Moderate", text: "Take it moderate today. Your body is still recovering." };
  return { label: "Red — Rest Day", text: "Prioritize recovery. Light activity or rest recommended." };
}

export default async function Home() {
  let data = staticData as typeof staticData;
  let isLive = false;

  try {
    const tokens = loadTokens();
    if (tokens) {
      const live = await fetchWhoopDashboard();
      data = live as typeof staticData;
      isLive = true;
    }
  } catch {
    // fall through to static data
  }

  const status = recoveryStatus(data.recovery.score);

  return (
    <div className="min-h-screen" style={{ background: "#080808" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-6 py-5 flex items-center justify-between"
        style={{
          background: "rgba(8,8,8,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(30,30,30,0.8)",
        }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#555555" }}>
            {formatDate(data.date)}
          </p>
          <h1 className="text-2xl font-bold mt-0.5" style={{ color: "#ffffff" }}>
            {getGreeting()} 👋
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {!isLive && (
            <Link
              href="/setup"
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: "rgba(255,107,53,0.15)", color: "#ff6b35", border: "1px solid rgba(255,107,53,0.3)" }}
            >
              Connect WHOOP
            </Link>
          )}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: isLive ? "rgba(0,255,135,0.1)" : "rgba(100,100,100,0.1)",
              border: `1px solid ${isLive ? "rgba(0,255,135,0.25)" : "rgba(100,100,100,0.25)"}`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: isLive ? "#00ff87" : "#666666",
                boxShadow: isLive ? "0 0 6px #00ff87" : "none",
              }}
            />
            <span className="text-xs font-semibold" style={{ color: isLive ? "#00ff87" : "#666666" }}>
              {isLive ? "LIVE" : "DEMO"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-12 pt-8 flex flex-col gap-6">
        {/* Recovery Status Banner */}
        <div
          className="rounded-2xl px-5 py-4 flex items-center gap-4"
          style={{
            background: data.recovery.score >= 67
              ? "linear-gradient(135deg, rgba(0,255,135,0.1) 0%, rgba(0,255,135,0.03) 100%)"
              : data.recovery.score >= 34
              ? "linear-gradient(135deg, rgba(255,200,0,0.1) 0%, rgba(255,200,0,0.03) 100%)"
              : "linear-gradient(135deg, rgba(255,60,60,0.1) 0%, rgba(255,60,60,0.03) 100%)",
            border: `1px solid ${data.recovery.score >= 67 ? "rgba(0,255,135,0.2)" : data.recovery.score >= 34 ? "rgba(255,200,0,0.2)" : "rgba(255,60,60,0.2)"}`,
          }}
        >
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{
              background: data.recovery.score >= 67 ? "#00ff87" : data.recovery.score >= 34 ? "#ffc800" : "#ff3c3c",
              boxShadow: `0 0 10px ${data.recovery.score >= 67 ? "rgba(0,255,135,0.8)" : data.recovery.score >= 34 ? "rgba(255,200,0,0.8)" : "rgba(255,60,60,0.8)"}`,
            }}
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: data.recovery.score >= 67 ? "#00ff87" : data.recovery.score >= 34 ? "#ffc800" : "#ff3c3c" }}>
              {status.label}
            </p>
            <p className="text-sm mt-0.5" style={{ color: "#aaaaaa" }}>
              {status.text}
            </p>
          </div>
        </div>

        {/* Three Rings */}
        <div className="glass-card rounded-3xl p-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-8 text-center" style={{ color: "#444444" }}>
            Today&apos;s Metrics
          </p>
          <div className="flex items-center justify-around flex-wrap gap-6">
            <Ring value={data.recovery.score} max={100} color="#00ff87" label="Recovery" sublabel="score" size={160} glowClass="ring-glow-recovery" />
            <Ring value={data.strain.score} max={21} color="#ff6b35" label="Strain" sublabel="/ 21" size={160} glowClass="ring-glow-strain" />
            <Ring value={data.sleep.performance} max={100} color="#3b82f6" label="Sleep" sublabel="perf" size={160} glowClass="ring-glow-sleep" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="HRV" value={data.recovery.hrv} unit="ms" icon="💚" accent="#00ff87" trend="up" />
          <StatCard label="Resting HR" value={data.recovery.restingHR} unit="bpm" icon="❤️" accent="#ff6b35" trend="down" />
          <StatCard label="SpO₂" value={`${data.recovery.spo2}%`} icon="🫁" accent="#3b82f6" trend="neutral" />
        </div>

        {/* Sleep Breakdown */}
        <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 rounded-full" style={{ background: "linear-gradient(180deg, #3b82f6, #1d4ed8)" }} />
            <h2 className="text-lg font-bold tracking-tight" style={{ color: "#ffffff" }}>Sleep Breakdown</h2>
            <div className="ml-auto flex flex-col items-end">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#666666" }}>Duration</span>
              <span className="text-xl font-bold" style={{ color: "#3b82f6" }}>{data.sleep.duration}</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Awake", value: data.sleep.stages.awake, color: "#888888" },
              { label: "Light", value: data.sleep.stages.light, color: "#60a5fa" },
              { label: "REM", value: data.sleep.stages.rem, color: "#818cf8" },
              { label: "Deep", value: data.sleep.stages.deep, color: "#3b82f6" },
            ].map((stage) => (
              <div
                key={stage.label}
                className="rounded-xl p-3 flex flex-col items-center gap-1"
                style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                <span className="text-xs font-bold" style={{ color: stage.color }}>{stage.value}</span>
                <span className="text-xs" style={{ color: "#555555" }}>{stage.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Morning Briefing */}
        <MorningBriefing
          text={data.morningBriefing.text}
          workoutPlan={data.morningBriefing.workoutPlan}
          notes={data.morningBriefing.notes}
        />

        {/* Today's Workouts */}
        <WorkoutCard workouts={data.strain.workouts} dayStrain={data.strain.dayStrain} />

        {/* Weekly Strain */}
        <WeeklyChart data={data.weeklyStrain} />
      </main>
    </div>
  );
}
