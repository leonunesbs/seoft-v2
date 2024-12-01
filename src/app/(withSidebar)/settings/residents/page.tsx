import Link from "next/link";
import { MdAddCircleOutline } from "react-icons/md";
import { PageHeading } from "~/components/atoms/page-heading";
import { ResidentsTable } from "~/components/organisms/residents-table";
import { Button } from "~/components/ui/button";
import { db } from "~/server/db";

// Função assíncrona para buscar colaboradores e abulatórios associados
export default async function ResidentsPage() {
  // Consulta ao banco de dados usando Prisma
  const residents = await db.collaborator.findMany({
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
    orderBy: {
      name: "asc",
    },
    // include only staffs
    where: {
      role: {
        in: ["R1", "R2", "R3", "F1", "F2", "F3"],
      },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <PageHeading>Residentes</PageHeading>
        <Link href="/settings/residents/add" passHref>
          <Button>
            <MdAddCircleOutline size={18} />
            Adicionar
          </Button>
        </Link>
      </div>
      <div className="px-2">
        <ResidentsTable
          data={residents.map((staff) => ({
            ...staff,
            clinic: staff.clinics.map((clinicAssoc) => ({
              id: clinicAssoc.clinic.id,
              name: clinicAssoc.clinic.name,
            })),
          }))}
        />
      </div>
    </div>
  );
}
