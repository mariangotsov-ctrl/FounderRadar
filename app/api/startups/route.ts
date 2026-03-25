import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStartups } from "@/lib/queries/startups";
import type { PricingModel, StartupStatus } from "@prisma/client";
import type { StartupFilters } from "@/types";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const filters: StartupFilters = {
    q: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    pricingModel: (searchParams.get("pricingModel") as PricingModel) ?? undefined,
    status: (searchParams.get("status") as StartupStatus) ?? undefined,
    sort: (searchParams.get("sort") as StartupFilters["sort"]) ?? "trendingScore",
    order: "desc",
    page: parseInt(searchParams.get("page") ?? "1", 10),
    limit: parseInt(searchParams.get("limit") ?? "20", 10),
  };

  const result = await getStartups(filters);
  return NextResponse.json(result);
}
