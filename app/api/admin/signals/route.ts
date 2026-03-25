import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { signalSchema } from "@/lib/validations/startup";
import { recalculateTrendingScore } from "@/lib/queries/startups";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const parsed = signalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const { sourceUrl, ...data } = parsed.data;

  const signal = await db.signal.create({
    data: {
      ...data,
      sourceUrl: sourceUrl || null,
      occurredAt: new Date(data.occurredAt),
    },
  });

  // Recalculate trending score
  await recalculateTrendingScore(signal.startupId);

  return NextResponse.json(signal, { status: 201 });
}

export async function GET(_req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const signals = await db.signal.findMany({
    include: {
      startup: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { occurredAt: "desc" },
    take: 100,
  });

  return NextResponse.json(signals);
}
