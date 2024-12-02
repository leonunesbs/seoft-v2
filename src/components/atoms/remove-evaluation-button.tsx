"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

import { useRouter } from "next/navigation";
import { MdCancel } from "react-icons/md";
import { toast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import { Button } from "../ui/button";

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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          aria-label={`Cancelar avaliação de ${patientName}`}
          disabled={deleteEvaluation.isPending}
        >
          <MdCancel size={18} />
          <span className="hidden md:block">
            {deleteEvaluation.isPending ? "Cancelando..." : "Cancelar"}
          </span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar cancelamento</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza de que deseja cancelar a avaliação de {patientName}?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Não</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveEvaluation}
              disabled={deleteEvaluation.isPending}
            >
              {deleteEvaluation.isPending ? "Cancelando..." : "Sim, cancelar"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
