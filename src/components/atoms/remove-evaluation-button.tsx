"use client";

import { Button } from "../ui/button";
import { MdCancel } from "react-icons/md";
import { api } from "~/trpc/react";
import { toast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";

export function RemoveEvaluationButton({
  evaluationId,
  patientName,
}: {
  evaluationId: string;
  patientName: string;
}) {
  const router = useRouter();
  const deleteEvaluation = api.evaluation.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: `Avaliação de ${patientName} removida.`,
        variant: "default",
      });
      router.push(`/`);
    },
    onError: () => {
      toast({
        title: "Erro!",
        description: "Não foi possível remover a avaliação.",
        variant: "destructive",
      });
    },
  });

  const handleRemoveEvaluation = async () => {
    await deleteEvaluation.mutateAsync(evaluationId);
  };
  return (
    <Button
      type="button"
      variant={"destructive"}
      aria-label={`Cancelar avaliação de ${patientName}`}
      onClick={handleRemoveEvaluation}
      disabled={deleteEvaluation.isPending}
    >
      <MdCancel size={18} />
      <span className="hidden md:block">
        {deleteEvaluation.isPending ? "Cancelando..." : "Cancelar"}
      </span>
    </Button>
  );
}
