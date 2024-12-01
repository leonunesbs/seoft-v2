import { PageHeading } from "~/components/atoms/page-heading";
import { ResidentForm } from "~/components/organisms/resident-form";
import { db } from "~/server/db";

type Params = Promise<{ id: string }>;

export default async function StaffPage({ params }: { params: Params }) {
  const { id: residentId } = await params;

  // Busca todas as clínicas disponíveis
  const allClinics = await db.clinic.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Busca os dados do colaborador com as clínicas associadas
  const resident = await db.collaborator.findUnique({
    where: { id: residentId },
    include: {
      clinics: {
        include: {
          clinic: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!resident) {
    return (
      <p className="text-center text-sm text-gray-500">
        Colaborador não encontrado.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeading>Editar Residente</PageHeading>
      <div className="px-2">
        <ResidentForm
          initialData={{
            id: resident.id,
            name: resident.name,
            crm: resident.crm,
            role: resident.role as "R1" | "R2" | "R3" | "F1" | "F2" | "F3",
            clinics: resident.clinics.map((clinicCollaborator) => ({
              id: clinicCollaborator.clinic.id,
              name: clinicCollaborator.clinic.name,
            })),
          }}
          allClinics={allClinics}
        />
      </div>
    </div>
  );
}
