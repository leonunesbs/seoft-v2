"use client";

import { MdDelete, MdSave } from "react-icons/md";
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

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { MultiSelect } from "~/components/ui/multi-select";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "O nome do ambulatório é obrigatório.").toUpperCase(),
  collaborators: z.array(z.string()).optional(),
});

type ClinicFormProps = {
  initialData?: {
    id: string;
    name: string;
    collaborators: { id: string; name: string }[];
  };
  allCollaborators: { id: string; name: string }[];
};

export function ClinicForm({ initialData, allCollaborators }: ClinicFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          id: initialData.id,
          name: initialData.name,
          collaborators: initialData.collaborators.map(
            (collaborator) => collaborator.id,
          ),
        }
      : {
          name: "",
          collaborators: [],
        },
  });

  // tRPC Mutations
  const createClinic = api.clinic.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "O ambulatório foi cadastrado com sucesso.",
        variant: "default",
      });
      form.reset();
      router.push("/settings/clinics");
    },
    onError: (error) => {
      toast({
        title: "Erro ao cadastrar",
        description:
          error.message || "Ocorreu um erro ao cadastrar o ambulatório.",
        variant: "destructive",
      });
    },
  });

  const updateClinic = api.clinic.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "O ambulatório foi atualizado com sucesso.",
        variant: "default",
      });
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description:
          error.message || "Ocorreu um erro ao atualizar o ambulatório.",
        variant: "destructive",
      });
    },
  });

  const deleteClinic = api.clinic.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Concluído!",
        description: "O ambulatório foi excluído com sucesso.",
        variant: "default",
      });
      form.reset();
      router.push("/settings/clinics");
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir",
        description:
          error.message || "Ocorreu um erro ao excluir o ambulatório.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (initialData) {
      updateClinic.mutate(values);
    } else {
      createClinic.mutate(values);
    }
  };

  const handleDelete = () => {
    if (!initialData?.id) return;
    deleteClinic.mutate(initialData.id);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
        aria-label="Formulário de Edição de Ambulatório"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {initialData && (
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormLabel>ID</FormLabel>
                  <FormControl>
                    <Input {...field} disabled readOnly />
                  </FormControl>
                  <FormDescription>
                    ID único do ambulatório. Não pode ser alterado.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Digite o nome do ambulatório"
                  />
                </FormControl>
                <FormDescription>Exemplo: Glaucoma / Catarata.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="collaborators"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colaboradores</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={allCollaborators.map((collaborator) => ({
                      value: collaborator.id,
                      label: collaborator.name,
                    }))}
                    defaultValue={
                      initialData?.collaborators.map(
                        (collaborator) => collaborator.id,
                      ) ?? []
                    }
                    value={field.value ?? []}
                    onValueChange={(selected) => field.onChange(selected)}
                  />
                </FormControl>
                <FormDescription>
                  Selecione os colaboradores associados à clínica.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2">
          {initialData && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" type="button">
                  <MdDelete size={20} />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmação necessária</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. A clínica será
                    permanentemente excluída.
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
            disabled={createClinic.isPending || updateClinic.isPending}
          >
            <MdSave size={20} />
            {createClinic.isPending || updateClinic.isPending
              ? "Salvando..."
              : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
