/**
 * Proxies GET /api/lumber/health → Render backend /health.
 * Called on page load to pre-warm the Render free-tier service before
 * the user asks their first question. Render sleeps after 15 min idle
 * and takes ~30-60s to wake — this hides that latency behind page load time.
 */

import { NextResponse } from "next/server";

const BACKEND = process.env.LUMBER_API_URL;

export async function GET() {
  if (!BACKEND) {
    return NextResponse.json({ status: "unconfigured" });
  }

  try {
    const upstream = await fetch(`${BACKEND}/health`, {
      signal: AbortSignal.timeout(60_000), // give it up to 60s to wake
    });
    const data = await upstream.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: "unavailable" });
  }
}
