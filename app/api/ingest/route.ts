import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runIngestion } from "@/lib/ingestion";

/**
 * POST /api/ingest  — triggered manually from the admin UI
 * GET  /api/ingest  — triggered by Vercel Cron (sends a GET with Authorization header)
 *
 * Authorization:
 *   - Admin session cookie (browser), OR
 *   - Authorization: Bearer <INGEST_SECRET> header (cron / CI scripts)
 */

async function isAuthorized(req: Request): Promise<boolean> {
  const session = await auth();
  if (session?.user?.role === "ADMIN") return true;

  const secret = process.env.INGEST_SECRET;
  if (secret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader === `Bearer ${secret}`) return true;
  }

  return false;
}

async function handler(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await runIngestion();
    const totalNewStartups = results.reduce((s, r) => s + r.newStartups, 0);
    const totalNewSignals = results.reduce((s, r) => s + r.newSignals, 0);
    return NextResponse.json({ ok: true, results, totalNewStartups, totalNewSignals });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export { handler as GET, handler as POST };
