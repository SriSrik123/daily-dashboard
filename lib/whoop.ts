import { cookies } from "next/headers";

const WHOOP_API = "https://api.prod.whoop.com/developer/v1";
const TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";

export interface WhoopTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export async function loadTokens(): Promise<WhoopTokens | null> {
  try {
    const store = await cookies();
    const raw = store.get("whoop_tokens")?.value;
    if (!raw) return null;
    return JSON.parse(decodeURIComponent(raw)) as WhoopTokens;
  } catch {
    return null;
  }
}

export function saveTokensHeader(tokens: WhoopTokens): string {
  return `whoop_tokens=${encodeURIComponent(JSON.stringify(tokens))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`;
}

export async function refreshAccessToken(refreshToken: string): Promise<WhoopTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.WHOOP_CLIENT_ID!,
      client_secret: process.env.WHOOP_CLIENT_SECRET!,
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`);
  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refreshToken,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

export async function getValidToken(): Promise<{ token: string; newTokens?: WhoopTokens }> {
  const tokens = await loadTokens();
  if (!tokens) throw new Error("Not authenticated");
  if (Date.now() >= tokens.expires_at - 60_000) {
    const newTokens = await refreshAccessToken(tokens.refresh_token);
    return { token: newTokens.access_token, newTokens };
  }
  return { token: tokens.access_token };
}

async function whoopFetch(path: string, token: string) {
  const res = await fetch(`${WHOOP_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`WHOOP API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function fetchWhoopDashboard(): Promise<{ data: ReturnType<typeof buildDashboard> extends Promise<infer T> ? T : never; newTokens?: WhoopTokens }> {
  const { token, newTokens } = await getValidToken();

  const [recoveryRes, sleepRes, workoutsRes, cycleRes] = await Promise.all([
    whoopFetch("/recovery?limit=1", token),
    whoopFetch("/activity/sleep?limit=1", token),
    whoopFetch("/activity/workout?limit=5", token),
    whoopFetch("/cycle?limit=1", token),
  ]);

  const weeklyCyclesRes = await whoopFetch("/cycle?limit=7", token);
  const data = await buildDashboard(recoveryRes, sleepRes, workoutsRes, cycleRes, weeklyCyclesRes);
  return { data, newTokens };
}

async function buildDashboard(
  recoveryRes: Record<string, unknown>,
  sleepRes: Record<string, unknown>,
  workoutsRes: Record<string, unknown>,
  cycleRes: Record<string, unknown>,
  weeklyCyclesRes: Record<string, unknown>
) {
  const recovery = (recoveryRes.records as Record<string, unknown>[])?.[0];
  const sleep = (sleepRes.records as Record<string, unknown>[])?.[0];
  const cycle = (cycleRes.records as Record<string, unknown>[])?.[0];

  const fmtMs = (ms: number) => {
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const sleepScore = sleep?.score as Record<string, unknown> | undefined;
  const sleepMs = (sleepScore?.stage_summary as Record<string, unknown>)?.total_in_bed_time_milli as number ?? 0;
  const sleepHours = Math.floor(sleepMs / 3_600_000);
  const sleepMins = Math.floor((sleepMs % 3_600_000) / 60_000);
  const stageSummary = sleepScore?.stage_summary as Record<string, number> | undefined;

  const workouts = ((workoutsRes.records as Record<string, unknown>[]) ?? []).slice(0, 3).map((w) => {
    const score = w.score as Record<string, unknown> | undefined;
    const startStr = typeof w.start === "string" ? w.start : "";
    const endStr = typeof w.end === "string" ? w.end : "";
    const durationMin = startStr && endStr
      ? Math.round((new Date(endStr).getTime() - new Date(startStr).getTime()) / 60_000)
      : 0;
    return {
      name: sportName(w.sport_id as number),
      duration: `${durationMin} min`,
      strain: typeof score?.strain === "number" ? Math.round(score.strain * 10) / 10 : 0,
      calories: typeof score?.kilojoule === "number" ? Math.round((score.kilojoule as number) * 0.239) : 0,
    };
  });

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyStrain = ((weeklyCyclesRes.records as Record<string, unknown>[]) ?? [])
    .reverse()
    .map((c) => {
      const score = c.score as Record<string, unknown> | undefined;
      const d = new Date(typeof c.start === "string" ? c.start : "");
      return {
        day: days[d.getDay()],
        strain: typeof score?.strain === "number" ? Math.round(score.strain * 10) / 10 : 0,
      };
    });

  const recoveryScore = recovery?.score as Record<string, unknown> | undefined;
  const cycleScore = cycle?.score as Record<string, unknown> | undefined;
  const score = typeof recoveryScore?.recovery_score === "number" ? recoveryScore.recovery_score : 0;

  return {
    date: new Date().toISOString().split("T")[0],
    recovery: {
      score: Math.round(score),
      hrv: Math.round(typeof recoveryScore?.hrv_rmssd_milli === "number" ? recoveryScore.hrv_rmssd_milli : 0),
      restingHR: Math.round(typeof recoveryScore?.resting_heart_rate === "number" ? recoveryScore.resting_heart_rate : 0),
      spo2: Math.round(typeof recoveryScore?.spo2_percentage === "number" ? recoveryScore.spo2_percentage : 0),
    },
    strain: {
      score: Math.round((typeof cycleScore?.strain === "number" ? cycleScore.strain : 0) * 10) / 10,
      dayStrain: Math.round((typeof cycleScore?.strain === "number" ? cycleScore.strain : 0) * 10) / 10,
      workouts,
    },
    sleep: {
      performance: Math.round(typeof sleepScore?.sleep_performance_percentage === "number" ? sleepScore.sleep_performance_percentage : 0),
      duration: `${sleepHours}h ${sleepMins}m`,
      quality: sleepQuality(typeof sleepScore?.sleep_performance_percentage === "number" ? sleepScore.sleep_performance_percentage : 0),
      stages: {
        awake: fmtMs(stageSummary?.total_awake_time_milli ?? 0),
        light: fmtMs(stageSummary?.total_light_sleep_time_milli ?? 0),
        rem: fmtMs(stageSummary?.total_rem_sleep_time_milli ?? 0),
        deep: fmtMs(stageSummary?.total_slow_wave_sleep_time_milli ?? 0),
      },
    },
    morningBriefing: buildBriefing(Math.round(score), typeof cycleScore?.strain === "number" ? cycleScore.strain : 0),
    weeklyStrain,
  };
}

function sleepQuality(perf: number): string {
  if (perf >= 85) return "Excellent";
  if (perf >= 70) return "Good";
  if (perf >= 50) return "Fair";
  return "Poor";
}

function buildBriefing(recovery: number, strain: number) {
  const status =
    recovery >= 67 ? "green light to train hard" :
    recovery >= 34 ? "moderate training recommended" :
    "rest or light activity recommended";
  return {
    text: `Recovery score: ${recovery}%. Your body is ${status} today. Current day strain: ${strain.toFixed(1)}.`,
    workoutPlan: "Check your WHOOP app for coach recommendations based on today's recovery.",
    notes: "Stay consistent with your sleep schedule for optimal HRV trending.",
  };
}

function sportName(id: number): string {
  const sports: Record<number, string> = {
    0: "Activity", 1: "Running", 2: "Cycling", 3: "Baseball", 4: "Basketball",
    5: "Rowing", 6: "Fencing", 7: "Field Hockey", 8: "Football", 9: "Golf",
    10: "Ice Hockey", 11: "Lacrosse", 12: "Rugby", 13: "Sailing", 14: "Skiing",
    15: "Soccer", 16: "Softball", 17: "Squash", 18: "Swimming", 19: "Tennis",
    20: "Track & Field", 21: "Volleyball", 22: "Water Polo", 23: "Wrestling",
    24: "Boxing", 25: "Dance", 26: "Pilates", 27: "Yoga", 28: "Weightlifting",
    230: "Functional Fitness", 231: "Duathlon", 232: "Gymnastics", 233: "Hiking",
    234: "Horse Racing", 235: "Kayaking", 236: "Martial Arts", 237: "Mountain Biking",
    238: "Paddle Tennis", 239: "Obstacle Course Racing", 240: "Olympic Weightlifting",
    241: "Paddle Boarding", 242: "PowerLifting", 243: "Rock Climbing",
    244: "Skateboarding", 245: "Snowboarding", 246: "Snowshoeing", 247: "Spin",
    248: "Stairmaster", 249: "Surfing", 250: "Swimming", 251: "Table Tennis",
    252: "Triathlon", 253: "Walking", 254: "Disc Golf", 255: "HIIT",
    257: "Meditation", 258: "Other", 259: "Pickleball", 260: "Racquetball",
    261: "Virtual Cycling",
  };
  return sports[id] ?? "Workout";
}
