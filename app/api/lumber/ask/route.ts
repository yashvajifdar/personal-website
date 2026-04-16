/**
 * Next.js API proxy for the Lumber AI Analytics backend.
 *
 * All requests from /demos/lumber go through here so:
 *  - The backend URL (Railway/Render) is never exposed to the browser
 *  - CORS is handled server-side
 *  - Environment variable LUMBER_API_URL is kept on Vercel
 *
 * Set LUMBER_API_URL in Vercel → Settings → Environment Variables.
 * Example value: https://lumber-ai.railway.app
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.LUMBER_API_URL;

export async function POST(req: NextRequest) {
  if (!BACKEND) {
    return NextResponse.json(
      {
        text: "The Lumber AI backend is not configured yet. Check back soon — or reach out if you want a live walkthrough.",
        follow_ups: [],
        chart_spec: null,
        chart_data: null,
        kpi_called: null,
        error: "LUMBER_API_URL not set",
      },
      { status: 200 } // 200 so the frontend renders the message, not an error banner
    );
  }

  try {
    const body = await req.json();
    const upstream = await fetch(`${BACKEND}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // 30-second timeout — the two-turn LLM flow can take ~5–10s
      signal: AbortSignal.timeout(30_000),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(
        { error: data?.detail ?? "Backend error" },
        { status: upstream.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
