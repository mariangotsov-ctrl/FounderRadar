import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { StartupForm } from "@/components/admin/StartupForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "Edit Startup" };

export default async function EditStartupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [startup, categories, tags] = await Promise.all([
    db.startup.findUnique({
      where: { id },
      include: { tags: true },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!startup) notFound();

  const initialData = {
    id: startup.id,
    name: startup.name,
    slug: startup.slug,
    shortDescription: startup.shortDescription,
    description: startup.description,
    website: startup.website ?? "",
    logoUrl: startup.logoUrl ?? "",
    launchDate: startup.launchDate
      ? startup.launchDate.toISOString().split("T")[0]
      : "",
    status: startup.status,
    pricingModel: startup.pricingModel,
    categoryId: startup.categoryId ?? "",
    tagIds: startup.tags.map((t) => t.tagId),
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/startups" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back to startups
      </Link>
      <PageHeader title={`Edit: ${startup.name}`} />
      <StartupForm categories={categories} tags={tags} initialData={initialData} mode="edit" />
    </div>
  );
}
