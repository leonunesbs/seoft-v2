"use client";

import { useRouter } from "next/navigation";
import { MdOutlineUploadFile } from "react-icons/md";
import { toast } from "~/hooks/use-toast";
import { Button } from "../ui/button";

export function AddEvaluationButton({
  patientId,
  patientName,
}: {
  patientId: string;
  patientName: string;
}) {
  const router = useRouter();
  const handleAddEvaluation = async () => {
    const collaboratorId = await fetch("/api/v1/collaborator-switcher")
      .then((res) => res.json())
      .then((data) => {
        return data.collaboratorId;
      });

    const response = await fetch("/api/v1/evaluation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ patientId, collaboratorId }),
    });

    if (response.ok) {
      const data = await response.json();
      if (response.status === 201) {
        toast({
          title: "Sucesso!",
          description: `Nova avaliação de ${patientName} criada.`,
          variant: "default",
        });
      } else if (response.status === 200) {
        toast({
          title: "Tudo certo!",
          description: `Continuando avaliação de ${patientName}.`,
          variant: "default",
        });
      }

      router.push(`/evaluation/${data.id}`);
    } else {
      toast({
        title: "Erro!",
        description:
          "Não foi possível criar uma nova avaliação, verifique a seleção do Colaborador no menu lateral.",
        variant: "destructive",
      });
    }
  };
  return (
    <Button
      type="button"
      variant="outline"
      aria-label={`Nova avaliação de ${patientName}`}
      onClick={handleAddEvaluation}
    >
      <MdOutlineUploadFile size={18} />
    </Button>
  );
}
