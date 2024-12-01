"use client";

import { Prisma, Refraction } from "@prisma/client";
import { MdCancel, MdOutlineFileCopy } from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

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

// Schema de validação
const refractionSchema = z.object({
  leftEyeId: z.string().optional(),
  rightEyeId: z.string().optional(),
  sphericalOD: z.string().optional(),
  cylinderOD: z.string().optional(),
  axisOD: z.string().optional(),
  visualAcuityOD: z.string().min(1, "A acuidade visual é obrigatória."),
  sphericalOS: z.string().optional(),
  cylinderOS: z.string().optional(),
  axisOS: z.string().optional(),
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
  isLoading,
}: {
  eye: "OD" | "OE";
  refractions: Refraction[];
  onDelete: (id: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-1">
      <Badge className="mr-2 w-10">{eye}</Badge>
      {refractions.map((refraction) => (
        <div
          key={refraction.id}
          className="flex w-full items-center justify-between"
        >
          <span>{refraction.spherical?.toFixed(2) ?? "S/C"}</span>
          <span>{refraction.cylinder?.toFixed(2) ?? "S/C"}</span>
          <span>{refraction.axis ? `${refraction.axis}º` : "S/C"}</span>
          <span className="font-bold">[{refraction.visualAcuity}]</span>
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
        </div>
      ))}
      {refractions.length === 0 && (
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
      sphericalOD: "",
      sphericalOS: "",
      cylinderOD: "",
      cylinderOS: "",
      axisOD: "",
      axisOS: "",
      visualAcuityOD: "",
      visualAcuityOS: "",
    },
  });

  const utils = api.useUtils();
  const router = useRouter();
  const { mutate: createRefraction, isPending: isCreatePending } =
    api.refraction.create.useMutation({
      onSuccess: () => {
        toast({
          title: "Refração salva!",
          description: "A refração foi salva com sucesso.",
        });
        form.reset();
        utils.refraction.get.invalidate();
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

  const { mutate: deleteRefraction, isPending: isDeletePending } =
    api.refraction.delete.useMutation({
      onSuccess: () => {
        toast({
          title: "Refração deletada!",
          description: "A refração foi deletada com sucesso.",
        });
        utils.refraction.get.invalidate();
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
    createRefraction({
      leftEyeId: data.leftEyeId!,
      rightEyeId: data.rightEyeId!,
      leftEyeData: {
        spherical: data.sphericalOS ? parseFloat(data.sphericalOS) : null,
        cylinder: data.cylinderOS ? parseFloat(data.cylinderOS) : null,
        axis: data.axisOS ? parseFloat(data.axisOS) : null,
        visualAcuity: data.visualAcuityOS,
      },
      rightEyeData: {
        spherical: data.sphericalOD ? parseFloat(data.sphericalOD) : null,
        cylinder: data.cylinderOD ? parseFloat(data.cylinderOD) : null,
        axis: data.axisOD ? parseFloat(data.axisOD) : null,
        visualAcuity: data.visualAcuityOD,
      },
    });
  };

  const handleDelete = (id: string) => deleteRefraction(id);

  const handleImportLastData = () => {
    if (!lastEyesData) {
      toast({
        title: "Erro",
        description:
          "Nenhum dado da última avaliação disponível para importar.",
        variant: "destructive",
      });
      return;
    }
    form.setValue(
      "sphericalOS",
      lastEyesData.leftEye?.refraction[0]?.spherical?.toString() ?? "",
    );
    form.setValue(
      "cylinderOS",
      lastEyesData.leftEye?.refraction[0]?.cylinder?.toString() ?? "",
    );
    form.setValue(
      "axisOS",
      lastEyesData.leftEye?.refraction[0]?.axis?.toString() ?? "",
    );
    form.setValue(
      "visualAcuityOS",
      lastEyesData.leftEye?.refraction[0]?.visualAcuity ?? "",
    );

    form.setValue(
      "sphericalOD",
      lastEyesData.rightEye?.refraction[0]?.spherical?.toString() ?? "",
    );
    form.setValue(
      "cylinderOD",
      lastEyesData.rightEye?.refraction[0]?.cylinder?.toString() ?? "",
    );
    form.setValue(
      "axisOD",
      lastEyesData.rightEye?.refraction[0]?.axis?.toString() ?? "",
    );
    form.setValue(
      "visualAcuityOD",
      lastEyesData.rightEye?.refraction[0]?.visualAcuity ?? "",
    );

    toast({
      title: "Dados importados!",
      description: "Os dados da última avaliação foram importados com sucesso.",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              Acuidade e Refração
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={handleImportLastData}
                disabled={isCreatePending || isDeletePending}
              >
                {isCreatePending || isDeletePending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MdOutlineFileCopy size={18} />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <EyeRefractionList
              eye="OD"
              refractions={rightEye?.refraction ?? []}
              onDelete={handleDelete}
              isLoading={isDeletePending}
            />
            <EyeRefractionList
              eye="OE"
              refractions={leftEye?.refraction ?? []}
              onDelete={handleDelete}
              isLoading={isDeletePending}
            />
            <Separator />
            <div className="space-y-6">
              <div>
                <div className="text-sm font-semibold">Olho Direito</div>
                <div className="flex flex-wrap gap-4">
                  <FormField
                    control={form.control}
                    name="sphericalOD"
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormLabel>Esférico</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Esf." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cylinderOD"
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormLabel>Cilíndrico</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Cil." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="axisOD"
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormLabel>Eixo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Eixo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visualAcuityOD"
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormLabel>AV</FormLabel>
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
              <div>
                <div className="text-sm font-semibold">Olho Esquerdo</div>
                <div className="flex flex-wrap gap-4">
                  <FormField
                    control={form.control}
                    name="sphericalOS"
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormLabel>Esférico</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Esf." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cylinderOS"
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormLabel>Cilíndrico</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Cil." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="axisOS"
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormLabel>Eixo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Eixo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visualAcuityOS"
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormLabel>AV</FormLabel>
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
            <Button type="submit" className="w-full" disabled={isCreatePending}>
              {isCreatePending ? (
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
