import { NextRequest, NextResponse } from "next/server";
import { loadTokens } from "@/lib/whoop";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const tokens = await loadTokens();

  if (!tokens) {
    return NextResponse.json({ status: "no_tokens", cookies: req.cookies.getAll() });
  }

  const endpoints = [
    "https://api.prod.whoop.com/developer/v1/recovery?limit=1",
    "https://api.prod.whoop.com/developer/v1/recovery/collection?limit=1",
    "https://api.prod.whoop.com/developer/v1/activity/sleep?limit=1",
    "https://api.prod.whoop.com/developer/v1/activity/workout?limit=1",
    "https://api.prod.whoop.com/developer/v1/cycle?limit=1",
  ];

  const results: Record<string, unknown> = {
    token_expires_at: new Date(tokens.expires_at).toISOString(),
    token_expired: Date.now() >= tokens.expires_at,
  };

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
        cache: "no-store",
      });
      const text = await res.text();
      results[url] = { status: res.status, body: text.slice(0, 500) };
    } catch (e) {
      results[url] = { error: String(e) };
    }
  }

  return NextResponse.json(results);
}
