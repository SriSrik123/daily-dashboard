import { NextRequest, NextResponse } from "next/server";
import { saveTokens } from "@/lib/whoop";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "No code in callback" }, { status: 400 });
  }

  const res = await fetch("https://api.prod.whoop.com/oauth/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.WHOOP_CLIENT_ID!,
      client_secret: process.env.WHOOP_CLIENT_SECRET!,
      redirect_uri: process.env.WHOOP_REDIRECT_URI!,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: "Token exchange failed", detail: text }, { status: 500 });
  }

  const data = await res.json();
  saveTokens({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  });

  return NextResponse.redirect(new URL("/", req.url));
}
