"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { signalSchema, type SignalInput } from "@/lib/validations/startup";
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
import { SIGNAL_TYPE_LABELS, SIGNAL_WEIGHTS } from "@/lib/utils";
import type { SignalType } from "@prisma/client";

interface CreateSignalFormProps {
  startups: Array<{ id: string; name: string }>;
}

export function CreateSignalForm({ startups }: CreateSignalFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignalInput>({
    resolver: zodResolver(signalSchema),
    defaultValues: {
      weight: 1.0,
      occurredAt: new Date().toISOString().split("T")[0],
    },
  });

  async function onSubmit(data: SignalInput) {
    const res = await fetch("/api/admin/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast({ title: json.error ?? "Create failed", variant: "destructive" });
      return;
    }
    toast({ title: "Signal created & trending score updated" });
    reset({ weight: 1.0, occurredAt: new Date().toISOString().split("T")[0] });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Create Signal</CardTitle></CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Startup *</Label>
              <Select onValueChange={(v) => setValue("startupId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select startup" />
                </SelectTrigger>
                <SelectContent>
                  {startups.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.startupId && <p className="text-sm text-red-500">{errors.startupId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Signal type *</Label>
              <Select
                onValueChange={(v) => {
                  setValue("type", v as SignalType);
                  setValue("weight", SIGNAL_WEIGHTS[v as SignalType] ?? 1.0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SIGNAL_TYPE_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Title *</Label>
            <Input {...register("title")} placeholder="Raised $5M seed round" />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...register("description")} rows={2} placeholder="Additional context..." />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" {...register("occurredAt")} />
              {errors.occurredAt && <p className="text-sm text-red-500">{errors.occurredAt.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Weight (0.1–10)</Label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                {...register("weight", { valueAsNumber: true })}
              />
              {errors.weight && <p className="text-sm text-red-500">{errors.weight.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Source URL</Label>
              <Input {...register("sourceUrl")} placeholder="https://..." />
              {errors.sourceUrl && <p className="text-sm text-red-500">{errors.sourceUrl.message}</p>}
            </div>
          </div>

          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            Create signal
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
