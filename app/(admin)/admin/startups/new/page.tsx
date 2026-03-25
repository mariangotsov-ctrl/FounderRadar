import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { StartupForm } from "@/components/admin/StartupForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "New Startup" };

export default async function NewStartupPage() {
  const [categories, tags] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/admin/startups" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back to startups
      </Link>
      <PageHeader title="New Startup" description="Add a new startup to the database" />
      <StartupForm categories={categories} tags={tags} mode="create" />
    </div>
  );
}
