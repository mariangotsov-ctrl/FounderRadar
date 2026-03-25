import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const startup = await db.startup.findUnique({
    where: { id },
    include: {
      category: true,
      tags: { include: { tag: true } },
      signals: { orderBy: { occurredAt: "desc" } },
      _count: { select: { watchlistItems: true } },
    },
  });

  if (!startup) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(startup);
}
