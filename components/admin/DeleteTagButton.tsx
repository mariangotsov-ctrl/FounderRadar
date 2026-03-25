"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function DeleteTagButton({ tagId, tagName }: { tagId: string; tagName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete tag "${tagName}"?`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/tags/${tagId}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: `Tag "${tagName}" deleted` });
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
