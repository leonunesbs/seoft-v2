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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { MdDelete, MdSave } from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { MultiSelect } from "~/components/ui/multi-select";
import { api } from "~/trpc/react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useToast } from "~/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, { message: "O nome do colaborador é obrigatório." })
    .toUpperCase(),
  crm: z
    .string()
    .min(1, { message: "O CRM do colaborador é obrigatório." })
    .regex(/^\d+$/, { message: "O CRM deve conter apenas números." }),
  role: z.enum(["R1", "R2", "R3", "F1", "F2", "F3"], {
    required_error: "Selecione o nível de residência.",
  }),
  clinics: z.array(z.string()).optional(),
});

type ResidentFormProps = {
  initialData?: {
    id: string;
    name: string;
    crm: string;
    role: "R1" | "R2" | "R3" | "F1" | "F2" | "F3";
    clinics: { id: string; name: string }[];
  };
  allClinics: { id: string; name: string }[];
};

export function ResidentForm({ initialData, allClinics }: ResidentFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          id: initialData.id,
          name: initialData.name,
          crm: initialData.crm,
          role: initialData.role,
          clinics: initialData.clinics.map((clinic) => clinic.id),
        }
      : {
          name: "",
          crm: "",
          role: "R1",
          clinics: [],
        },
  });

  // Mutations tRPC
  const createResident = api.resident.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Residente criado com sucesso!",
        variant: "default",
      });
      router.push("/settings/residents");
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar residente",
        description: error.message || "Algo deu errado.",
        variant: "destructive",
      });
    },
  });

  const updateResident = api.resident.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Residente atualizado com sucesso!",
        variant: "default",
      });
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar residente",
        description: error.message || "Algo deu errado.",
        variant: "destructive",
      });
    },
  });

  const deleteResident = api.resident.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Residente excluído com sucesso!",
        variant: "default",
      });
      router.push("/settings/residents");
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir residente",
        description: error.message || "Algo deu errado.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (initialData) {
      updateResident.mutate(values);
    } else {
      createResident.mutate(values);
    }
  };

  const handleDelete = () => {
    if (initialData?.id) {
      deleteResident.mutate(initialData.id);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        aria-label="Formulário de Edição de Residente"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Digite o nome do residente" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="crm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CRM</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Digite o CRM do residente" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nível</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger aria-label="Selecione o nível de residência">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="R1">R1</SelectItem>
                      <SelectItem value="R2">R2</SelectItem>
                      <SelectItem value="R3">R3</SelectItem>
                      <SelectItem value="F1">F1</SelectItem>
                      <SelectItem value="F2">F2</SelectItem>
                      <SelectItem value="F3">F3</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clinics"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clínicas</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={allClinics.map((clinic) => ({
                      value: clinic.id,
                      label: clinic.name,
                    }))}
                    value={field.value ?? []}
                    onValueChange={(selected) => field.onChange(selected)}
                  />
                </FormControl>
                <FormMessage />
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
                  disabled={deleteResident.isPending}
                >
                  <MdDelete size={18} />
                  {deleteResident.isPending ? "Excluindo..." : "Excluir"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmação necessária</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita.
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
          <Button
            type="submit"
            disabled={updateResident.isPending || createResident.isPending}
          >
            <MdSave size={18} />
            {initialData
              ? updateResident.isPending
                ? "Atualizando..."
                : "Atualizar"
              : createResident.isPending
                ? "Salvando..."
                : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
