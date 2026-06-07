import { NextRequest, NextResponse } from "next/server";
import { loadTokens } from "@/lib/whoop";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const tokens = await loadTokens();

  if (!tokens) {
    return NextResponse.json({ status: "no_tokens", cookies: req.cookies.getAll() });
  }

  // Try hitting the WHOOP API
  try {
    const res = await fetch("https://api.prod.whoop.com/developer/v1/recovery?limit=1", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: "no-store",
    });
    const body = await res.json();
    return NextResponse.json({
      status: "ok",
      token_expires_at: new Date(tokens.expires_at).toISOString(),
      token_expired: Date.now() >= tokens.expires_at,
      whoop_status: res.status,
      whoop_response: body,
    });
  } catch (e) {
    return NextResponse.json({ status: "api_error", error: String(e) });
  }
}
