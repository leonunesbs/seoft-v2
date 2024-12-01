"use client";

import { type Prisma } from "@prisma/client";
import { useRouter } from "next/navigation";
import { MdEdit } from "react-icons/md";

import { Button } from "~/components/ui/button";
import { toast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

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
  }>;
}

export function ReopenEvaluationButton({
  evaluation,
}: ReopenEvaluationButtonProps) {
  const router = useRouter();

  const reopenEvaluation = api.evaluation.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Avaliação reaberta",
        description: "A avaliação foi reaberta com sucesso.",
        variant: "default",
      });
      router.push(`/evaluations/${evaluation.id}`);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao reabrir a avaliação.",
        variant: "destructive",
      });
    },
  });

  const handleReopenEvaluation = () => {
    reopenEvaluation.mutate({
      id: evaluation.id,
      patientId: evaluation.patient.id,
      collaboratorId: evaluation.collaborator.id,
      clinicId: evaluation.clinic?.id ?? undefined,
      rightEyeId: evaluation.eyes?.rightEyeId,
      leftEyeId: evaluation.eyes?.leftEyeId,
      done: false, // Marca a avaliação como "não concluída"
    });
  };

  return (
    <Button
      type="button"
      onClick={handleReopenEvaluation}
      variant="outline"
      disabled={reopenEvaluation.isPending}
    >
      <MdEdit size={18} />
      <span className="hidden sm:block">
        {reopenEvaluation.isPending ? "Reabrindo..." : "Reabrir"}
      </span>
    </Button>
  );
}
