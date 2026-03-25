"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface WatchlistButtonProps {
  startupId: string;
  initialWatched: boolean;
  size?: "default" | "sm" | "lg" | "icon";
}

export function WatchlistButton({
  startupId,
  initialWatched,
  size = "default",
}: WatchlistButtonProps) {
  const [watched, setWatched] = useState(initialWatched);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const prev = watched;
    setWatched(!prev); // optimistic
    startTransition(async () => {
      try {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startupId }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setWatched(data.added);
        toast({
          title: data.added ? "Added to watchlist" : "Removed from watchlist",
        });
      } catch {
        setWatched(prev); // revert on error
        toast({ title: "Something went wrong", variant: "destructive" });
      }
    });
  };

  return (
    <Button
      variant={watched ? "default" : "outline"}
      size={size}
      onClick={toggle}
      disabled={isPending}
      className={watched ? "bg-indigo-600 hover:bg-indigo-700" : ""}
    >
      {watched ? (
        <BookmarkCheck className="h-4 w-4 mr-2" />
      ) : (
        <Bookmark className="h-4 w-4 mr-2" />
      )}
      {watched ? "Watching" : "Watch"}
    </Button>
  );
}
