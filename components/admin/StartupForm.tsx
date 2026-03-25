"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { startupSchema, type StartupInput } from "@/lib/validations/startup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { PRICING_MODEL_LABELS, STATUS_LABELS } from "@/lib/utils";
import { PricingModel, StartupStatus } from "@prisma/client";
import type { Category, Tag } from "@prisma/client";

interface StartupFormProps {
  categories: Category[];
  tags: Tag[];
  initialData?: Partial<StartupInput> & { id?: string };
  mode: "create" | "edit";
}

export function StartupForm({ categories, tags, initialData, mode }: StartupFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StartupInput>({
    resolver: zodResolver(startupSchema),
    defaultValues: {
      status: StartupStatus.ACTIVE,
      pricingModel: PricingModel.UNKNOWN,
      tagIds: [],
      ...initialData,
    },
  });

  const selectedTags = watch("tagIds") ?? [];

  const toggleTag = (tagId: string) => {
    const current = selectedTags;
    setValue(
      "tagIds",
      current.includes(tagId) ? current.filter((t) => t !== tagId) : [...current, tagId]
    );
  };

  async function onSubmit(data: StartupInput) {
    const url = mode === "create" ? "/api/admin/startups" : `/api/admin/startups/${initialData?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      toast({ title: json.error ?? "Save failed", variant: "destructive" });
      return;
    }

    toast({ title: mode === "create" ? "Startup created" : "Startup updated" });
    router.push("/admin/startups");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register("name")} placeholder="Acme AI" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" {...register("slug")} placeholder="acme-ai" />
              {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short description * (max 200 chars)</Label>
            <Input id="shortDescription" {...register("shortDescription")} placeholder="One-line description" />
            {errors.shortDescription && <p className="text-sm text-red-500">{errors.shortDescription.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full description *</Label>
            <Textarea id="description" {...register("description")} rows={5} placeholder="Detailed description..." />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input id="website" {...register("website")} placeholder="https://example.com" />
              {errors.website && <p className="text-sm text-red-500">{errors.website.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" {...register("logoUrl")} placeholder="https://..." />
              {errors.logoUrl && <p className="text-sm text-red-500">{errors.logoUrl.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="launchDate">Launch date</Label>
            <Input id="launchDate" type="date" {...register("launchDate")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Classification</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                defaultValue={initialData?.status ?? StartupStatus.ACTIVE}
                onValueChange={(v) => setValue("status", v as StartupStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pricing model *</Label>
              <Select
                defaultValue={initialData?.pricingModel ?? PricingModel.UNKNOWN}
                onValueChange={(v) => setValue("pricingModel", v as PricingModel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRICING_MODEL_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              defaultValue={initialData?.categoryId ?? "none"}
              onValueChange={(v) => setValue("categoryId", v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {tags.map((tag) => {
                const active = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
              {tags.length === 0 && (
                <p className="text-sm text-gray-400">No tags yet. Create some in the Tags section.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create startup" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/startups")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
