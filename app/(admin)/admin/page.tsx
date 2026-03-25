import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { Rocket, Layers, Tag, Zap, Users, GitMerge } from "lucide-react";

export const metadata: Metadata = { title: "Admin Panel" };

export default async function AdminDashboardPage() {
  const [startups, categories, tags, signals, users, competitors] = await Promise.all([
    db.startup.count(),
    db.category.count(),
    db.tag.count(),
    db.signal.count(),
    db.user.count(),
    db.competitorRelation.count(),
  ]);

  const adminLinks = [
    { href: "/admin/startups", label: "Startups", icon: Rocket, count: startups, desc: "Create, edit & manage startups" },
    { href: "/admin/categories", label: "Categories", icon: Layers, count: categories, desc: "Manage startup categories" },
    { href: "/admin/tags", label: "Tags", icon: Tag, count: tags, desc: "Manage startup tags" },
    { href: "/admin/signals", label: "Signals", icon: Zap, count: signals, desc: "Add signals & activity" },
    { href: "/admin/competitors", label: "Competitors", icon: GitMerge, count: competitors, desc: "Define competitor relations" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Panel"
        description={`${users} registered users`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminLinks.map(({ href, label, icon: Icon, count, desc }) => (
          <Link key={href} href={href}>
            <Card className="hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-indigo-50 p-2">
                      <Icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <CardTitle className="text-base">{label}</CardTitle>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{count}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
