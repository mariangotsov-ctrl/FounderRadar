"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { tagSchema, type TagInput } from "@/lib/validations/startup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";

export function CreateTagForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TagInput>({
    resolver: zodResolver(tagSchema),
  });

  async function onSubmit(data: TagInput) {
    const res = await fetch("/api/admin/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast({ title: json.error ?? "Create failed", variant: "destructive" });
      return;
    }
    toast({ title: `Tag "${data.name}" created` });
    reset();
    router.refresh();
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Create Tag</CardTitle></CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                {...register("name")}
                placeholder="LLM"
                onChange={(e) => {
                  setValue("name", e.target.value);
                  setValue("slug", slugify(e.target.value));
                }}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input {...register("slug")} placeholder="llm" />
              {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
            </div>
          </div>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            Create tag
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
