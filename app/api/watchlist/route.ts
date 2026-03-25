import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleWatchlist } from "@/lib/queries/watchlist";
import { z } from "zod";

const schema = z.object({ startupId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const result = await toggleWatchlist(session.user.id, parsed.data.startupId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
