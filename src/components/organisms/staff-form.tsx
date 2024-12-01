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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { MultiSelect } from "~/components/ui/multi-select";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

const roles = [
  "I1",
  "I2",
  "I3",
  "I4",
  "R1",
  "R2",
  "R3",
  "F1",
  "F2",
  "F3",
  "STAFF",
] as const;

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "O nome é obrigatório").toUpperCase(),
  crm: z
    .string()
    .min(1, "O CRM é obrigatório")
    .regex(/^\d+$/, "O CRM deve conter apenas números"),
  role: z.enum(roles),
  clinics: z.array(z.string()).optional(),
});

type StaffFormProps = {
  initialData?: {
    id: string;
    name: string;
    crm: string;
    role: string;
    clinics: { id: string; name: string }[];
  };
  allClinics: { id: string; name: string }[];
};

export function StaffForm({ initialData, allClinics }: StaffFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          id: initialData.id,
          name: initialData.name,
          crm: initialData.crm,
          role: initialData.role as (typeof roles)[number],
          clinics: initialData.clinics.map((clinic) => clinic.id),
        }
      : {
          name: "",
          crm: "",
          role: "STAFF",
          clinics: [],
        },
  });

  const createStaff = api.staff.create.useMutation({
    onError: (error) => {
      toast({
        title: "Erro ao criar colaborador",
        description: error.message || "Algo deu errado.",
        variant: "destructive",
        duration: 4000,
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Colaborador criado com sucesso.",
        variant: "default",
      });
      form.reset();
      router.push("/settings/staffs");
    },
  });

  const updateStaff = api.staff.update.useMutation({
    onError: (error) => {
      toast({
        title: "Erro ao atualizar colaborador",
        description: error.message || "Algo deu errado.",
        variant: "destructive",
        duration: 4000,
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Colaborador atualizado com sucesso.",
        variant: "default",
      });
      router.refresh();
    },
  });

  const deleteStaff = api.staff.delete.useMutation({
    onError: (error) => {
      toast({
        title: "Erro ao excluir colaborador",
        description: error.message || "Algo deu errado.",
        variant: "destructive",
        duration: 4000,
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Colaborador excluído com sucesso.",
        variant: "default",
      });
      form.reset();
      router.push("/settings/staffs");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (initialData) {
      updateStaff.mutate(values);
    } else {
      createStaff.mutate(values);
    }
  };

  const handleDelete = () => {
    if (initialData?.id) {
      deleteStaff.mutate(initialData.id);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        aria-label="Formulário de Edição de Colaborador"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Digite o nome completo" />
                </FormControl>
                <FormDescription>Exemplo: João da Silva.</FormDescription>
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
                  <Input {...field} placeholder="Digite o CRM do colaborador" />
                </FormControl>
                <FormDescription>
                  Informe apenas números. Exemplo: 123456.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Selecione o cargo ou função atual do colaborador.
                </FormDescription>
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
                    defaultValue={
                      initialData?.clinics.map((clinic) => clinic.id) ?? []
                    }
                    value={field.value ?? []}
                    onValueChange={(selected) => field.onChange(selected)}
                  />
                </FormControl>
                <FormDescription>
                  Selecione os ambulatórios em que o colaborador atua.
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
                <Button
                  variant="destructive"
                  type="button"
                  disabled={deleteStaff.isPending}
                >
                  <MdDelete size={18} />
                  {deleteStaff.isPending ? "Excluindo..." : "Excluir"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá
                    permanentemente este colaborador.
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
            disabled={createStaff.isPending || updateStaff.isPending}
          >
            <MdSave size={18} />
            {initialData
              ? updateStaff.isPending
                ? "Atualizando..."
                : "Atualizar"
              : createStaff.isPending
                ? "Salvando..."
                : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
