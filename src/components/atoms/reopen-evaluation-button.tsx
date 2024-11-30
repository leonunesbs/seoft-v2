// components/ReopenEvaluationButton.tsx

"use client";

import { type Prisma } from "@prisma/client/edge";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MdEdit } from "react-icons/md";

import { Button } from "~/components/ui/button";

interface ReopenEvaluationButtonProps {
  evaluation: Prisma.EvaluationGetPayload<{
    include: {
      patient: true;
      collaborator: true;
      clinic: true;
      eyes: {
        include: {
          rightEye: true;
          leftEye: true;
        };
      };
    };
  }>; // Adjust the type as needed
}

export function ReopenEvaluationButton({
  evaluation,
}: ReopenEvaluationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Function to reopen the evaluation
  const handleReopenEvaluation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/evaluation`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: evaluation.id || undefined,
          patientId: evaluation.patient.id,
          collaboratorId: evaluation.collaborator.id,
          clinicId: evaluation.clinic?.id,
          rightEyeId: evaluation.eyes?.rightEyeId,
          leftEyeId: evaluation.eyes?.leftEyeId,
          done: false,
        }),
      });

      if (!response.ok) throw new Error("Erro ao reabrir a avaliação.");

      // Optionally refresh the page or redirect
      router.push(`/evaluation/${evaluation.id}`);
    } catch (error) {
      console.error("Erro ao reabrir a avaliação:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleReopenEvaluation}
      variant="outline"
      disabled={isLoading}
    >
      <MdEdit size={18} />
      <span className="hidden sm:block">
        {isLoading ? "Reabrindo..." : "Reabrir"}
      </span>
    </Button>
  );
}
