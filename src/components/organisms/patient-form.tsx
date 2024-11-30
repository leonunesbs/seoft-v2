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
} from "~/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { MdDelete, MdSave } from "react-icons/md";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useToast } from "~/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

function applyDateMask(event: React.ChangeEvent<HTMLInputElement>) {
  const input = event.target;
  let value = input.value.replace(/\D/g, ""); // Remove caracteres não numéricos

  if (value.length > 2) {
    value = `${value.slice(0, 2)}/${value.slice(2)}`;
  }
  if (value.length > 5) {
    value = `${value.slice(0, 5)}/${value.slice(5, 9)}`;
  }

  input.value = value.slice(0, 10); // Limita ao máximo de 10 caracteres
}

function formatToDDMMYYYY(date: string) {
  return new Date(date).toLocaleDateString("pt-br", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

function parseToYYYYMMDD(date: string) {
  const [day, month, year] = date.split("/");
  return `${year}-${month}-${day}`;
}

const formSchema = z.object({
  refId: z
    .string()
    .min(1, "O ID do Paciente não pode ser vazio")
    .regex(/^\d+$/, "O ID do Paciente deve ser um número natural")
    .transform((val) => val.replace(/^0+/, "")), // Remove zeros à esquerda
  name: z.string().min(1, "O nome do paciente é obrigatório").toUpperCase(),
  birthDate: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, {
      message: "A data de nascimento deve estar no formato DD/MM/YYYY.",
    })
    .refine((val) => !isNaN(Date.parse(parseToYYYYMMDD(val))), {
      message: "Insira uma data válida.",
    }),
});

type PatientFormProps = {
  initialData?: {
    id: string;
    refId: string;
    name: string;
    birthDate: string; // ISO string
  };
};

export function PatientForm({ initialData }: PatientFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          refId: initialData.refId,
          name: initialData.name,
          birthDate: formatToDDMMYYYY(initialData.birthDate),
        }
      : {
          refId: "",
          name: "",
          birthDate: "",
        },
  });

  const createPatient = api.patient.create.useMutation({
    onError(error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
        duration: 2000,
      });
    },
    onSuccess() {
      toast({
        title: "Sucesso!",
        description: "Paciente criado com sucesso.",
        variant: "default",
        duration: 2000,
      });
      form.reset();
    },
  });
  const updatePatient = api.patient.update.useMutation({
    onError(error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
        duration: 2000,
      });
    },
    onSuccess() {
      toast({
        title: "Sucesso!",
        description: "Dados atualizados com sucesso.",
        variant: "default",
        duration: 2000,
      });
    },
  });
  const deletePatient = api.patient.delete.useMutation({
    onSuccess() {
      toast({
        title: "Sucesso!",
        description: "Paciente excluído com sucesso.",
        variant: "default",
        duration: 2000,
      });
      form.reset();
      router.push("/patients/search");
    },
    onError(error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
        duration: 2000,
      });
    },
  });
  // const refetchPatient = api.patient.get.useQuery(
  //   { refId: form.getValues("refId") },
  //   { enabled: false },
  // );

  const isLoading =
    createPatient.isPending ||
    updatePatient.isPending ||
    deletePatient.isPending;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formattedValues = {
      ...values,
      birthDate: parseToYYYYMMDD(values.birthDate),
    };

    if (initialData) {
      await updatePatient.mutateAsync({
        id: initialData.id,
        ...formattedValues,
      });
    } else {
      await createPatient.mutateAsync(formattedValues);
    }
  }

  async function handleDelete() {
    if (!initialData) return;
    await deletePatient.mutateAsync(initialData.id);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        aria-label="Formulário de Edição de Paciente"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="refId"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor="refId" aria-disabled={!!initialData}>
                  Nº do prontuário
                </FormLabel>
                <FormControl>
                  <Input
                    id="refId"
                    placeholder="Digite o número do prontuário"
                    {...field}
                    disabled={!!initialData}
                    aria-disabled={!!initialData}
                    aria-invalid={fieldState.invalid}
                    aria-describedby="refId-error"
                  />
                </FormControl>
                <FormDescription id="refId-description">
                  Insira o número do prontuário do paciente.
                </FormDescription>
                <FormMessage id="refId-error" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor="name">Nome completo</FormLabel>
                <FormControl>
                  <Input
                    id="name"
                    placeholder="Digite o nome completo do paciente"
                    {...field}
                    aria-invalid={fieldState.invalid}
                    aria-describedby="name-error"
                  />
                </FormControl>
                <FormDescription id="name-description">
                  Exemplo: João da Silva.
                </FormDescription>
                <FormMessage id="name-error" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor="birthDate">Data de nascimento</FormLabel>
                <FormControl>
                  <Input
                    id="birthDate"
                    placeholder="DD/MM/YYYY"
                    {...field}
                    onChange={(event) => {
                      applyDateMask(event);
                      field.onChange(event);
                    }}
                    aria-invalid={fieldState.invalid}
                    aria-describedby="birthDate-error"
                  />
                </FormControl>
                <FormDescription id="birthDate-description">
                  Insira a data no formato DD/MM/YYYY. Digite apenas números.
                </FormDescription>
                <FormMessage id="birthDate-error" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2">
          {initialData && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  type="button"
                  disabled={deletePatient.isPending}
                >
                  <MdDelete size={20} />
                  {deletePatient.isPending ? "Excluindo..." : "Excluir"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá
                    permanentemente este paciente e removerá todos os dados de
                    nossos servidores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button type="submit" disabled={isLoading}>
            <MdSave size={20} />
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
