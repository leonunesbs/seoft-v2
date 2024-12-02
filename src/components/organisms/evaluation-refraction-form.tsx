"use client";

import { Prisma, Refraction } from "@prisma/client";
import {
  MdArrowDownward,
  MdArrowUpward,
  MdCancel,
  MdOutlineFileCopy,
  MdRemove,
} from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
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

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Slider } from "../ui/slider";

const visualAcuityOptions = [
  ">20/20",
  "20/20",
  "20/25",
  "20/30",
  "20/40",
  "20/50",
  "20/60",
  "20/70",
  "20/80",
  "20/100",
  "20/200",
  "20/400",
  "CD 2m",
  "CD 1m",
  "CD 0,5m",
  "CD FF",
  "MM",
  "PL",
  "SPL",
];

// Mapeamento de acuidade visual para valores numéricos para comparação
const visualAcuityValues: { [key: string]: number } = {
  ">20/20": 19,
  "20/20": 18,
  "20/25": 17,
  "20/30": 16,
  "20/40": 15,
  "20/50": 14,
  "20/60": 13,
  "20/70": 12,
  "20/80": 11,
  "20/100": 10,
  "20/200": 9,
  "20/400": 8,
  "CD 2m": 7,
  "CD 1m": 6,
  "CD 0,5m": 5,
  "CD FF": 4,
  MM: 3,
  PL: 2,
  SPL: 1,
};

// Schema de validação
const refractionSchema = z.object({
  leftEyeId: z.string().optional(),
  rightEyeId: z.string().optional(),
  sphericalOD: z.union([z.string(), z.number()]).optional(),
  cylinderOD: z.union([z.string(), z.number()]).optional(),
  axisOD: z.union([z.string(), z.number()]).optional(),
  visualAcuityOD: z.string().min(1, "A acuidade visual é obrigatória."),
  sphericalOS: z.union([z.string(), z.number()]).optional(),
  cylinderOS: z.union([z.string(), z.number()]).optional(),
  axisOS: z.union([z.string(), z.number()]).optional(),
  visualAcuityOS: z.string().min(1, "A acuidade visual é obrigatória."),
});

type RefractionFormValues = z.infer<typeof refractionSchema>;

type EvaluationRefractionFormProps = {
  leftEye?: Prisma.EyeGetPayload<{
    include: {
      refraction: true;
      logs: true;
    };
  }>;
  rightEye?: Prisma.EyeGetPayload<{
    include: {
      refraction: true;
      logs: true;
    };
  }>;
  lastEyesData?: {
    leftEye?: Prisma.EyeGetPayload<{
      include: {
        refraction: true;
        logs: true;
      };
    }>;
    rightEye?: Prisma.EyeGetPayload<{
      include: {
        refraction: true;
        logs: true;
      };
    }>;
  };
};

function EyeRefractionList({
  eye,
  refractions,
  onDelete,
  deletingIds,
  previousVisualAcuity,
}: {
  eye: "OD" | "OE";
  refractions: Refraction[];
  onDelete: (id: string) => void;
  deletingIds: string[]; // Recebe a lista de IDs que estão sendo deletados
  previousVisualAcuity?: string; // Acuidade visual anterior para comparação
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center">
        <Badge className="mr-2 w-10">{eye}</Badge>
        <h3 className="text-lg font-semibold">Refração</h3>
      </div>
      {refractions.length > 0 ? (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Esférico</th>
              <th className="py-2 text-left">Cilíndrico</th>
              <th className="py-2 text-left">Eixo</th>
              <th className="py-2 text-left">AV</th>
              <th className="py-2 text-center">Ação</th>
            </tr>
          </thead>
          <tbody>
            {refractions.map((refraction, index) => {
              const isLoading = deletingIds.includes(refraction.id);

              // Comparação apenas para a refração mais recente (index 0)
              let comparisonIcon = null;
              if (index === 0 && previousVisualAcuity) {
                const currentVAValue =
                  visualAcuityValues[refraction.visualAcuity ?? ""];
                const previousVAValue =
                  visualAcuityValues[previousVisualAcuity];

                if (currentVAValue != null && previousVAValue != null) {
                  if (currentVAValue > previousVAValue) {
                    // Melhora
                    comparisonIcon = <MdArrowUpward />;
                  } else if (currentVAValue < previousVAValue) {
                    // Piora
                    comparisonIcon = <MdArrowDownward />;
                  } else {
                    // Manutenção
                    comparisonIcon = <MdRemove />;
                  }
                }
              }

              return (
                <tr key={refraction.id} className="border-b">
                  <td className="py-2">
                    {refraction.spherical! > 0
                      ? `+${refraction.spherical?.toFixed(2)}`
                      : (refraction.spherical?.toFixed(2) ?? "S/C")}
                  </td>
                  <td className="py-2">
                    {refraction.cylinder! > 0
                      ? `+${refraction.cylinder?.toFixed(2)}`
                      : (refraction.cylinder?.toFixed(2) ?? "S/C")}
                  </td>
                  <td className="py-2">
                    {refraction.cylinder
                      ? refraction.axis
                        ? `${refraction.axis}º`
                        : "S/C"
                      : "S/C"}
                  </td>
                  <td>
                    <div className="flex items-center">
                      {refraction.visualAcuity}
                      {comparisonIcon && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger type="button">
                              {comparisonIcon}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Útima acuidade: {previousVisualAcuity}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </td>
                  <td className="py-2 text-center">
                    <Button
                      type="button"
                      size="icon"
                      onClick={() => onDelete(refraction.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MdCancel />
                      )}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="text-center text-sm text-muted-foreground">
          Nenhuma refração registrada para o olho{" "}
          {eye === "OD" ? "direito" : "esquerdo"}.
        </div>
      )}
    </div>
  );
}

export function EvaluationRefractionForm({
  leftEye,
  rightEye,
  lastEyesData,
}: EvaluationRefractionFormProps) {
  const form = useForm<z.infer<typeof refractionSchema>>({
    resolver: zodResolver(refractionSchema),
    defaultValues: {
      leftEyeId: leftEye?.id ?? "",
      rightEyeId: rightEye?.id ?? "",
      sphericalOD: 0,
      sphericalOS: 0,
      cylinderOD: 0,
      cylinderOS: 0,
      axisOD: 180,
      axisOS: 180,
      visualAcuityOD: "",
      visualAcuityOS: "",
    },
  });

  const router = useRouter();
  const [deletingIds, setDeletingIds] = useState<string[]>([]); // Estado para rastrear IDs que estão sendo deletados
  const [isImporting, setIsImporting] = useState(false); // Estado para o carregamento da importação

  const createRefractionMutation = api.refraction.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Refração salva!",
        description: "A refração foi salva com sucesso.",
      });
      form.reset();
      router.refresh();
    },
    onError: () => {
      toast({
        title: "Erro ao salvar refração",
        description: "Ocorreu um erro ao salvar a refração.",
        variant: "destructive",
      });
    },
  });

  const deleteRefractionMutation = api.refraction.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Refração deletada!",
        description: "A refração foi deletada com sucesso.",
      });
      router.refresh();
    },
    onError: () => {
      toast({
        title: "Erro ao deletar refração",
        description: "Ocorreu um erro ao deletar a refração.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RefractionFormValues) => {
    createRefractionMutation.mutate({
      leftEyeId: data.leftEyeId!,
      rightEyeId: data.rightEyeId!,
      leftEyeData: {
        spherical: data.sphericalOS ? Number(data.sphericalOS) : null,
        cylinder: data.cylinderOS ? Number(data.cylinderOS) : null,
        axis: data.axisOS ? Number(data.axisOS) : null,
        visualAcuity: data.visualAcuityOS,
      },
      rightEyeData: {
        spherical: data.sphericalOD ? Number(data.sphericalOD) : null,
        cylinder: data.cylinderOD ? Number(data.cylinderOD) : null,
        axis: data.axisOD ? Number(data.axisOD) : null,
        visualAcuity: data.visualAcuityOD,
      },
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingIds((prev) => [...prev, id]); // Adiciona o ID ao estado de carregamento
    try {
      await deleteRefractionMutation.mutateAsync(id);
    } catch {
      // O erro é tratado no onError da mutation
    } finally {
      setDeletingIds((prev) => prev.filter((refId) => refId !== id)); // Remove o ID após a operação
    }
  };

  const handleImportLastData = async () => {
    if (!lastEyesData) {
      toast({
        title: "Erro",
        description:
          "Nenhum dado da última avaliação disponível para importar.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true); // Inicia o estado de carregamento

    // Dados do olho esquerdo
    const leftEyeData = lastEyesData.leftEye?.refraction[0];
    // Dados do olho direito
    const rightEyeData = lastEyesData.rightEye?.refraction[0];

    if (!leftEyeData && !rightEyeData) {
      toast({
        title: "Erro",
        description: "Nenhum dado de refração disponível para importar.",
        variant: "destructive",
      });
      setIsImporting(false);
      return;
    }

    try {
      await createRefractionMutation.mutateAsync({
        leftEyeId: form.getValues("leftEyeId")!,
        rightEyeId: form.getValues("rightEyeId")!,
        leftEyeData:
          leftEyeData && leftEyeData.visualAcuity
            ? {
                spherical: leftEyeData.spherical,
                cylinder: leftEyeData.cylinder,
                axis: leftEyeData.axis,
                visualAcuity: leftEyeData.visualAcuity,
              }
            : undefined,
        rightEyeData:
          rightEyeData && rightEyeData.visualAcuity
            ? {
                spherical: rightEyeData.spherical,
                cylinder: rightEyeData.cylinder,
                axis: rightEyeData.axis,
                visualAcuity: rightEyeData.visualAcuity,
              }
            : undefined,
      });

      toast({
        title: "Dados importados!",
        description:
          "Os dados da última avaliação foram importados e salvos com sucesso.",
      });
    } catch {
      // O erro é tratado no onError da mutation
    } finally {
      setIsImporting(false); // Finaliza o estado de carregamento
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="min-w-lg">
          <CardHeader>
            <CardTitle className="flex justify-between">
              Acuidade e Refração
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={handleImportLastData}
                disabled={
                  createRefractionMutation.isPending ||
                  deleteRefractionMutation.isPending ||
                  isImporting
                }
              >
                {isImporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MdOutlineFileCopy size={18} />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Lista de refrações registradas */}
            <EyeRefractionList
              eye="OD"
              refractions={rightEye?.refraction ?? []}
              onDelete={handleDelete}
              deletingIds={deletingIds}
              previousVisualAcuity={
                lastEyesData?.rightEye?.refraction[0]?.visualAcuity ?? undefined
              }
            />
            <EyeRefractionList
              eye="OE"
              refractions={leftEye?.refraction ?? []}
              onDelete={handleDelete}
              deletingIds={deletingIds}
              previousVisualAcuity={
                lastEyesData?.leftEye?.refraction[0]?.visualAcuity ?? undefined
              }
            />
            <Separator />
            {/* Formulário para adicionar novas refrações */}
            <div className="grid grid-cols-2 gap-6">
              {/* Olho Direito */}
              <div>
                <div className="mb-2 flex items-center">
                  <div className="text-sm font-semibold">Olho Direito</div>
                </div>
                <div className="space-y-4">
                  {/* Esférico OD */}
                  <FormField
                    control={form.control}
                    name="sphericalOD"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Esférico:{" "}
                          {Number(field.value) > 0
                            ? `+${parseFloat(
                                field.value as unknown as string,
                              ).toFixed(2)}`
                            : parseFloat(
                                field.value as unknown as string,
                              ).toFixed(2)}
                        </FormLabel>
                        <FormControl>
                          <Slider
                            {...field}
                            onValueChange={(value) => {
                              field.onChange(value[0]);
                            }}
                            value={[
                              parseFloat(field.value as unknown as string) ?? 0,
                            ]}
                            max={20}
                            min={-20}
                            step={0.25}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Cilíndrico OD */}
                  <FormField
                    control={form.control}
                    name="cylinderOD"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Cilíndrico:{" "}
                          {Number(field.value) > 0
                            ? `+${parseFloat(
                                field.value as unknown as string,
                              ).toFixed(2)}`
                            : parseFloat(
                                field.value as unknown as string,
                              ).toFixed(2)}
                        </FormLabel>
                        <FormControl>
                          <Slider
                            onValueChange={(value) => {
                              if (field.value !== -value[0]!) {
                                field.onChange(-value[0]!);
                              }
                            }}
                            value={[
                              Number(field.value) ? -Number(field.value) : 0,
                            ]}
                            max={6}
                            min={0}
                            step={0.25}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Eixo OD */}
                  <FormField
                    control={form.control}
                    name="axisOD"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eixo: {field.value}º</FormLabel>
                        <FormControl>
                          <Slider
                            {...field}
                            onValueChange={(value) => {
                              field.onChange(value[0]);
                            }}
                            value={[Number(field.value) ?? 0]}
                            max={180}
                            min={0}
                            step={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Acuidade Visual OD */}
                  <FormField
                    control={form.control}
                    name="visualAcuityOD"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Acuidade Visual</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione AV" />
                            </SelectTrigger>
                            <SelectContent>
                              {visualAcuityOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {/* Olho Esquerdo */}
              <div>
                <div className="mb-2 flex items-center">
                  <div className="text-sm font-semibold">Olho Esquerdo</div>
                </div>
                <div className="space-y-4">
                  {/* Esférico OS */}
                  <FormField
                    control={form.control}
                    name="sphericalOS"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Esférico:{" "}
                          {Number(field.value) > 0
                            ? `+${parseFloat(
                                field.value as unknown as string,
                              ).toFixed(2)}`
                            : parseFloat(
                                field.value as unknown as string,
                              ).toFixed(2)}
                        </FormLabel>
                        <FormControl>
                          <Slider
                            {...field}
                            onValueChange={(value) => {
                              field.onChange(value[0]);
                            }}
                            value={[Number(field.value) ?? 0]}
                            max={20}
                            min={-20}
                            step={0.25}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Cilíndrico OS */}
                  <FormField
                    control={form.control}
                    name="cylinderOS"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Cilíndrico:{" "}
                          {Number(field.value) > 0
                            ? `+${parseFloat(
                                field.value as unknown as string,
                              ).toFixed(2)}`
                            : parseFloat(
                                field.value as unknown as string,
                              ).toFixed(2)}
                        </FormLabel>
                        <FormControl>
                          <Slider
                            onValueChange={(value) => {
                              if (field.value !== -value[0]!) {
                                field.onChange(-value[0]!);
                              }
                            }}
                            value={[
                              Number(field.value) ? -Number(field.value) : 0,
                            ]}
                            max={6}
                            min={0}
                            step={0.25}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Eixo OS */}
                  <FormField
                    control={form.control}
                    name="axisOS"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eixo: {field.value}º</FormLabel>
                        <FormControl>
                          <Slider
                            {...field}
                            onValueChange={(value) => {
                              field.onChange(value[0]);
                            }}
                            value={[Number(field.value) ?? 0]}
                            max={180}
                            min={0}
                            step={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Acuidade Visual OS */}
                  <FormField
                    control={form.control}
                    name="visualAcuityOS"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Acuidade Visual</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione AV" />
                            </SelectTrigger>
                            <SelectContent>
                              {visualAcuityOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={createRefractionMutation.isPending}
            >
              {createRefractionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Salvar Refração"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
