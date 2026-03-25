"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { competitorSchema, type CompetitorInput } from "@/lib/validations/startup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface CreateCompetitorFormProps {
  startups: Array<{ id: string; name: string }>;
}

export function CreateCompetitorForm({ startups }: CreateCompetitorFormProps) {
  const router = useRouter();
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } =
    useForm<CompetitorInput>({ resolver: zodResolver(competitorSchema) });

  async function onSubmit(data: CompetitorInput) {
    const res = await fetch("/api/admin/competitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast({ title: json.error ?? "Create failed", variant: "destructive" });
      return;
    }
    toast({ title: "Competitor relation created" });
    reset();
    router.refresh();
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Add Competitor Relation</CardTitle></CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Startup A *</Label>
              <Select onValueChange={(v) => setValue("startupAId", v)}>
                <SelectTrigger><SelectValue placeholder="Select startup" /></SelectTrigger>
                <SelectContent>
                  {startups.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.startupAId && <p className="text-sm text-red-500">{errors.startupAId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Startup B *</Label>
              <Select onValueChange={(v) => setValue("startupBId", v)}>
                <SelectTrigger><SelectValue placeholder="Select startup" /></SelectTrigger>
                <SelectContent>
                  {startups.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.startupBId && <p className="text-sm text-red-500">{errors.startupBId.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Note</Label>
            <Input {...register("note")} placeholder="Both compete in the AI coding assistant space" />
          </div>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            Add relation
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
