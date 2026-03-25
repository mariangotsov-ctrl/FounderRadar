"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface DeleteStartupButtonProps {
  startupId: string;
  startupName: string;
}

export function DeleteStartupButton({ startupId, startupName }: DeleteStartupButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete "${startupName}"? This cannot be undone.`)) return;

    startTransition(async () => {
      const res = await fetch(`/api/admin/startups/${startupId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({ title: `"${startupName}" deleted` });
        router.refresh();
      } else {
        toast({ title: "Delete failed", variant: "destructive" });
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
