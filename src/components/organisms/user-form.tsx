"use client";

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
import { MdSave } from "react-icons/md";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

// Schema para o formulário
const formSchema = z.object({
  id: z.string().min(1, "O ID do Usuário é obrigatório"),
  name: z.string().toUpperCase().optional(),
  email: z.string().email("Insira um e-mail válido"),
  isStaff: z.boolean(),
});

type UserFormProps = {
  initialData: {
    id: string;
    name?: string;
    email: string;
    isStaff: boolean;
  };
};

export function UserForm({ initialData }: UserFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const updateUser = api.user.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Dados do usuário atualizados com sucesso.",
        variant: "default",
      });
      router.push("/settings/users");
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description:
          error.message || "Não foi possível atualizar os dados do usuário.",
        variant: "destructive",
      });
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    updateUser.mutate(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormLabel>ID do Usuário</FormLabel>
                <FormControl>
                  <Input {...field} disabled readOnly />
                </FormControl>
                <FormDescription>
                  Este é o identificador único do usuário. Não pode ser
                  alterado.
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Digite o nome completo"
                    aria-invalid={fieldState.invalid}
                  />
                </FormControl>
                <FormDescription>
                  Nome do usuário. Pode ser deixado vazio.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="usuario~exemplo.com"
                    aria-invalid={fieldState.invalid}
                  />
                </FormControl>
                <FormDescription>Insira um email válido.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isStaff"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colaborador</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked: boolean) =>
                        field.onChange(checked)
                      }
                    />
                  </FormControl>
                  <span>{field.value ? "Sim" : "Não"}</span>
                </div>
                <FormDescription>
                  Marque se o usuário é membro da equipe.
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={updateUser.isPending}>
            <MdSave size={20} />
            {updateUser.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
