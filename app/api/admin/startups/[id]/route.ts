import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { startupSchema } from "@/lib/validations/startup";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const startup = await db.startup.findUnique({
    where: { id },
    include: { category: true, tags: { include: { tag: true } } },
  });
  if (!startup) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(startup);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = startupSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const { tagIds, launchDate, website, logoUrl, categoryId, ...data } = parsed.data;

  const startup = await db.startup.update({
    where: { id },
    data: {
      ...data,
      ...(website !== undefined && { website: website || null }),
      ...(logoUrl !== undefined && { logoUrl: logoUrl || null }),
      ...(categoryId !== undefined && { categoryId: categoryId || null }),
      ...(launchDate !== undefined && { launchDate: launchDate ? new Date(launchDate) : null }),
      ...(tagIds !== undefined && {
        tags: {
          deleteMany: {},
          create: tagIds.map((tagId) => ({ tagId })),
        },
      }),
    },
  });

  return NextResponse.json(startup);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await db.startup.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
