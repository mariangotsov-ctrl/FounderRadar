import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { startupSchema } from "@/lib/validations/startup";
import { recalculateTrendingScore } from "@/lib/queries/startups";

async function requireAdmin() {
  const session = await auth();
  if (!session) return null;
  if (session.user.role !== "ADMIN") return null;
  return session;
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const parsed = startupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    );
  }

  const { tagIds, launchDate, website, logoUrl, categoryId, ...data } = parsed.data;

  const startup = await db.startup.create({
    data: {
      ...data,
      website: website || null,
      logoUrl: logoUrl || null,
      categoryId: categoryId || null,
      launchDate: launchDate ? new Date(launchDate) : null,
      tags: tagIds?.length
        ? { create: tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
  });

  return NextResponse.json(startup, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const startups = await db.startup.findMany({
    include: {
      category: true,
      tags: { include: { tag: true } },
      _count: { select: { signals: true, watchlistItems: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(startups);
}
