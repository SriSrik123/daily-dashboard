export default function SetupPage() {
  const clientId = process.env.WHOOP_CLIENT_ID!;
  const redirectUri = process.env.WHOOP_REDIRECT_URI!;
  const scopes = [
    "read:recovery",
    "read:cycles",
    "read:sleep",
    "read:workout",
    "read:body_measurement",
    "read:profile",
    "offline",
  ].join(" ");

  const authUrl =
    `https://api.prod.whoop.com/oauth/oauth2/auth` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes)}`;

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#080808" }}
    >
      <div
        className="rounded-3xl p-10 max-w-md w-full flex flex-col items-center gap-6 text-center"
        style={{ background: "#111111", border: "1px solid #1e1e1e" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{ background: "rgba(0,255,135,0.1)", border: "1px solid rgba(0,255,135,0.2)" }}
        >
          🔗
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Connect WHOOP</h1>
          <p className="text-sm" style={{ color: "#666666" }}>
            Authorize your dashboard to read your WHOOP recovery, sleep, strain, and workout data.
          </p>
        </div>
        <a
          href={authUrl}
          className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all"
          style={{
            background: "linear-gradient(135deg, #00ff87, #00cc6a)",
            color: "#000000",
          }}
        >
          Connect WHOOP →
        </a>
        <p className="text-xs" style={{ color: "#444444" }}>
          You&apos;ll be redirected to WHOOP to authorize, then brought back here automatically.
        </p>
      </div>
    </div>
  );
}
