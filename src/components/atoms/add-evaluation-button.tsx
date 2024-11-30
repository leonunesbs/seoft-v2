"use client";

import { Button } from "../ui/button";
import { MdOutlineUploadFile } from "react-icons/md";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useToast } from "~/hooks/use-toast";

export function AddEvaluationButton({
  patientId,
  patientName,
}: {
  patientId: string;
  patientName: string;
}) {
  const router = useRouter();
  const { toast } = useToast();

  // Utiliza o tRPC para obter o colaborador atual
  const { data: collaboratorData, isLoading: isCollaboratorLoading } =
    api.utils.currentCollaborator.useQuery();

  // Utiliza o tRPC para criar avaliação
  const createEvaluation = api.evaluation.create.useMutation({
    onSuccess(data) {
      const message =
        data.done === false
          ? `Continuando avaliação de ${patientName}.`
          : `Nova avaliação de ${patientName} criada.`;

      toast({
        title: "Sucesso!",
        description: message,
        variant: "default",
        duration: 3000,
      });

      router.push(`/evaluation/${data.id}`);
    },
    onError(error) {
      toast({
        title: "Erro!",
        description: error.message || "Não foi possível criar a avaliação.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const handleAddEvaluation = async () => {
    if (isCollaboratorLoading) {
      toast({
        title: "Carregando",
        description:
          "Aguarde enquanto carregamos as informações do colaborador.",
        variant: "default",
        duration: 3000,
      });
      return;
    }

    const collaboratorId = collaboratorData?.collaboratorId;
    if (!collaboratorId) {
      toast({
        title: "Erro!",
        description: "Colaborador não selecionado. Verifique o menu lateral.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Chamada da mutação com os dados necessários
    createEvaluation.mutate({
      patientId,
      collaboratorId,
    });
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
