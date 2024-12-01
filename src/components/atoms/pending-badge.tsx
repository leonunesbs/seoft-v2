"use client";

import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton"; // Import Skeleton for placeholder
import { api } from "~/trpc/react";

export function PendingBadge({ collaboratorId }: { collaboratorId: string }) {
  const { data: pendingEvaluations, isLoading } =
    api.evaluation.pendingEvaluations.useQuery(collaboratorId);

  return isLoading ? (
    <Skeleton className="h-4 w-4 rounded-full" /> // Placeholder while loading
  ) : (
    <Badge
      variant={
        pendingEvaluations
          ? pendingEvaluations > 0
            ? "default"
            : "outline"
          : "outline"
      }
      className="flex size-4 justify-center px-0 text-center"
    >
      {pendingEvaluations}
    </Badge>
  );
}
