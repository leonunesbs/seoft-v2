"use client";

import { useRouter } from "next/navigation";
import { MdCancel } from "react-icons/md";
import { toast } from "~/hooks/use-toast";
import { Button } from "../ui/button";

export function RemoveEvaluationButton({
  evaluationId,
  patientName,
}: {
  evaluationId: string;
  patientName: string;
}) {
  const router = useRouter();
  const handleRemoveEvaluation = async () => {
    const response = await fetch(
      `/api/v1/evaluation?evaluationId=${evaluationId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.ok) {
      toast({
        title: "Sucesso!",
        description: `Avaliação de ${patientName} removida.`,
        variant: "default",
      });

      router.push(`/`);
    } else {
      toast({
        title: "Erro!",
        description: "Não foi possível remover a avaliação.",
        variant: "destructive",
      });
    }
  };
  return (
    <Button
      type="button"
      variant={"destructive"}
      aria-label={`Cancelar avaliação de ${patientName}`}
      onClick={handleRemoveEvaluation}
    >
      <MdCancel size={18} />
      <span className="hidden md:block">Cancelar</span>
    </Button>
  );
}
