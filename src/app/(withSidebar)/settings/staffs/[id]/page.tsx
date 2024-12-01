import { PageHeading } from "~/components/atoms/page-heading";
import { StaffForm } from "~/components/organisms/staff-form";
import { db } from "~/server/db";

type Params = Promise<{ id: string }>;

export default async function StaffPage({ params }: { params: Params }) {
  const { id: staffId } = await params;

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
  const staff = await db.collaborator.findUnique({
    where: { id: staffId },
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

  if (!staff) {
    return (
      <p className="text-center text-sm text-gray-500">
        Colaborador não encontrado.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeading>Editar Staff</PageHeading>
      <StaffForm
        initialData={{
          id: staff.id,
          name: staff.name,
          crm: staff.crm,
          role: staff.role,
          clinics: staff.clinics.map((clinicCollaborator) => ({
            id: clinicCollaborator.clinic.id,
            name: clinicCollaborator.clinic.name,
          })),
        }}
        allClinics={allClinics}
      />
    </div>
  );
}
