"use client";

import { type EyeSurgery, type Prisma } from "@prisma/client";
import { MdCancel, MdOutlineInfo } from "react-icons/md";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react"; // Importa useState para gerenciar estados locais
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "~/hooks/use-toast";
import { api } from "~/trpc/react"; // Importação do cliente tRPC
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

// Schema de validação para o formulário
const surgeryFormSchema = z.object({
  procedure: z.string().min(1, "O procedimento é obrigatório.").toUpperCase(),
  date: z.string().min(1, "A data é obrigatória."),
  notes: z.string().optional(),
  eye: z.enum(["OD", "OE"]).default("OD"), // Seleção do olho
});

type SurgeryFormValues = z.infer<typeof surgeryFormSchema>;

type SurgeryItemProps = {
  surgery: Prisma.EyeSurgeryGetPayload<{
    select: {
      id: true;
      procedure: true;
      date: true;
      notes: true;
    };
  }>;
  eye: string;
  onDelete: (surgeryId: string) => void;
  isLoading: boolean; // Novo prop para indicar se o botão está em loading
};

function SurgeryItem({ surgery, eye, onDelete, isLoading }: SurgeryItemProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex gap-1">
        <Badge className="w-10 justify-center">{eye}</Badge>
        <span>
          {new Date(surgery.date).toLocaleDateString("pt-BR", {
            timeZone: "UTC",
          })}
        </span>
      </div>
      <span className="flex gap-1">
        {surgery.procedure}
        {surgery.notes && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <MdOutlineInfo size={18} />
              </TooltipTrigger>
              <TooltipContent>
                <p>{surgery.notes}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </span>
      <Button
        type="button"
        size="icon"
        onClick={() => onDelete(surgery.id)}
        disabled={isLoading} // Desativa o botão se estiver carregando
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MdCancel />
        )}
      </Button>
    </div>
  );
}

interface EvaluationSurgeryFormProps {
  evaluation: Prisma.EvaluationGetPayload<{
    include: {
      eyes: {
        include: {
          rightEye: {
            include: {
              surgeries: true;
            };
          };
          leftEye: {
            include: {
              surgeries: true;
            };
          };
        };
      };
    };
  }>;
  patientSurgeries: Array<{
    eyes: {
      leftEye: {
        surgeries: EyeSurgery[];
      };
      rightEye: {
        surgeries: EyeSurgery[];
      };
    };
  }>;
}

export function EvaluationSurgeryForm({
  evaluation,
  patientSurgeries,
}: EvaluationSurgeryFormProps) {
  const router = useRouter();
  const [deletingSurgeryIds, setDeletingSurgeryIds] = useState<string[]>([]); // Estado local para rastrear quais cirurgias estão sendo deletadas

  const form = useForm<SurgeryFormValues>({
    resolver: zodResolver(surgeryFormSchema),
    defaultValues: {
      procedure: "",
      date: "",
      notes: "",
      eye: "OD",
    },
  });

  // Combina as cirurgias de todas as avaliações
  const combinedSurgeries = patientSurgeries.flatMap((history) => [
    ...history.eyes.rightEye.surgeries.map((surgery) => ({
      ...surgery,
      eye: "OD",
    })),
    ...history.eyes.leftEye.surgeries.map((surgery) => ({
      ...surgery,
      eye: "OE",
    })),
  ]);

  // Ordena as cirurgias por data (ascendente)
  combinedSurgeries.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Mutations do tRPC
  const createSurgeryMutation = api.surgery.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Cirurgia adicionada!",
        description: "A cirurgia foi registrada com sucesso.",
        variant: "default",
        duration: 4000,
      });
      form.reset();
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar cirurgia.",
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const deleteSurgeryMutation = api.surgery.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Cirurgia excluída!",
        description: "A cirurgia foi removida com sucesso.",
        variant: "default",
        duration: 4000,
      });
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir cirurgia.",
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const handleDelete = async (surgeryId: string) => {
    setDeletingSurgeryIds((prev) => [...prev, surgeryId]); // Adiciona o ID ao estado de carregamento
    try {
      await deleteSurgeryMutation.mutateAsync(surgeryId);
    } catch {
      // O toast de erro já é tratado no onError da mutation
    } finally {
      setDeletingSurgeryIds((prev) => prev.filter((id) => id !== surgeryId)); // Remove o ID após a operação
    }
  };

  const onSubmit = (data: SurgeryFormValues) => {
    const eyeId =
      data.eye === "OD"
        ? evaluation.eyes?.rightEye?.id
        : evaluation.eyes?.leftEye?.id;

    if (!eyeId) {
      toast({
        title: "Erro",
        description: `ID do olho ${data.eye} não encontrado.`,
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    createSurgeryMutation.mutate({
      eyeId,
      procedure: data.procedure,
      date: data.date,
      notes: data.notes,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Cirurgias e Procedimentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lista de cirurgias registradas */}
            {combinedSurgeries.length > 0 ? (
              combinedSurgeries.map((surgery) => (
                <SurgeryItem
                  key={surgery.id}
                  surgery={surgery}
                  eye={surgery.eye}
                  onDelete={handleDelete}
                  isLoading={deletingSurgeryIds.includes(surgery.id)} // Passa o estado de loading individual
                />
              ))
            ) : (
              <div className="flex items-center justify-center text-gray-500">
                Nenhuma cirurgia registrada.
              </div>
            )}

            {/* Formulário para adicionar cirurgias */}
            <FormField
              control={form.control}
              name="eye"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selecione o olho</FormLabel>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={field.value === "OD" ? "default" : "outline"}
                      onClick={() => field.onChange("OD")}
                    >
                      OD
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === "OE" ? "default" : "outline"}
                      onClick={() => field.onChange("OE")}
                    >
                      OE
                    </Button>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="procedure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Procedimento</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Descreva o procedimento" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Informações adicionais"
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={createSurgeryMutation.isPending}
            >
              {createSurgeryMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Adicionar Cirurgia"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
