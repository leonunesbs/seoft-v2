import { ClinicForm } from "~/components/organisms/clinic-form";
import { PageHeading } from "~/components/atoms/page-heading";
import { db } from "~/server/db";

type Params = Promise<{ id: string }>;

export default async function ClinicPage({ params }: { params: Params }) {
  const { id: clinicId } = await params;

  // Busca todos os colaboradores disponíveis
  const allCollaborators = await db.collaborator.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Busca os dados da clínica com seus colaboradores associados
  const clinic = await db.clinic.findUnique({
    where: { id: clinicId },
    include: {
      collaborators: {
        include: {
          collaborator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!clinic) {
    return (
      <p className="text-center text-sm text-gray-500">
        Clínica não encontrada.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeading>Editar Ambulatório</PageHeading>
      <div className="px-2">
        <ClinicForm
          initialData={{
            id: clinic.id,
            name: clinic.name,
            collaborators: clinic.collaborators.map((clinicCollaborator) => ({
              id: clinicCollaborator.collaborator.id,
              name: clinicCollaborator.collaborator.name,
            })),
          }}
          allCollaborators={allCollaborators}
        />
      </div>
    </div>
  );
}
