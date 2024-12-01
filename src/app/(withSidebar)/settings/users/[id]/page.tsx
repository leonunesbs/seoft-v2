import { UserForm } from "~/components/organisms/user-form"; // Ajuste o caminho conforme a organização do projeto
import { db } from "~/server/db";

type Params = Promise<{ id: string }>;

export default async function UserPage({ params }: { params: Params }) {
  const { id: userId } = await params;

  // Busca os dados do usuário no banco de dados
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return (
      <p className="text-center text-sm text-gray-500">
        Usuário não encontrado.
      </p>
    );
  }

  // Renderiza o formulário com os dados iniciais preenchidos
  return (
    <UserForm
      initialData={{
        id: user.id,
        name: user.name ?? "",
        email: user.email ?? "",
        isStaff: user.isStaff,
      }}
    />
  );
}
