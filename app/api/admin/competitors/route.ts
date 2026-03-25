import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { competitorSchema } from "@/lib/validations/startup";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const parsed = competitorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  if (parsed.data.startupAId === parsed.data.startupBId) {
    return NextResponse.json({ error: "A startup cannot compete with itself" }, { status: 400 });
  }

  const existing = await db.competitorRelation.findFirst({
    where: {
      OR: [
        { startupAId: parsed.data.startupAId, startupBId: parsed.data.startupBId },
        { startupAId: parsed.data.startupBId, startupBId: parsed.data.startupAId },
      ],
    },
  });
  if (existing) {
    return NextResponse.json({ error: "Competitor relation already exists" }, { status: 409 });
  }

  const relation = await db.competitorRelation.create({ data: parsed.data });
  return NextResponse.json(relation, { status: 201 });
}

export async function GET(_req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const relations = await db.competitorRelation.findMany({
    include: {
      startupA: { select: { id: true, name: true, slug: true } },
      startupB: { select: { id: true, name: true, slug: true } },
    },
  });
  return NextResponse.json(relations);
}
