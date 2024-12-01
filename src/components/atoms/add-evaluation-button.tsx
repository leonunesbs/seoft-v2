"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { MdOutlineUploadFile } from "react-icons/md";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import { Button } from "../ui/button";

export function AddEvaluationButton({
  patientId,
  patientName,
  ...rest
}: {
  patientId: string;
  patientName: string;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const {
    data: collaboratorData,
    isLoading: isCollaboratorLoading,
    error: collaboratorError,
  } = api.utils.currentCollaborator.useQuery();

  const createEvaluation = api.evaluation.create.useMutation({
    async onSuccess(data) {
      const message = !data.clinicalData
        ? `Nova avaliação de ${patientName} criada.`
        : `Continuando avaliação de ${patientName}.`;
      toast({
        title: "Sucesso!",
        description: message,
        variant: "default",
        duration: 3000,
      });

      void router.push(`/evaluations/${data.id}`);
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

    if (collaboratorError || !collaboratorData?.collaboratorId) {
      toast({
        title: "Erro!",
        description:
          collaboratorError?.message ??
          "Colaborador não encontrado. Verifique o menu lateral.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      createEvaluation.mutate({
        patientId,
        collaboratorId: collaboratorData.collaboratorId,
      });
    } catch {
      toast({
        title: "Erro!",
        description:
          "Ocorreu um erro ao tentar criar a avaliação. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <Button
      {...rest}
      type="button"
      variant="outline"
      aria-label={`Nova avaliação de ${patientName}`}
      onClick={handleAddEvaluation}
      disabled={isCollaboratorLoading || createEvaluation.isPending}
    >
      {createEvaluation.isPending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <MdOutlineUploadFile size={18} />
      )}
    </Button>
  );
}
