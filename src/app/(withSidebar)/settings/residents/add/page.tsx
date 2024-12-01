import { PageHeading } from "~/components/atoms/page-heading";
import { ResidentForm } from "~/components/organisms/resident-form";
import { db } from "~/server/db";

type Params = Promise<{ id: string }>;

export default async function StaffPage({}: { params: Params }) {
  const allClinics = await db.clinic.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <PageHeading>Adicionar Residente</PageHeading>
      <div className="px-2">
        <ResidentForm allClinics={allClinics} />
      </div>
    </div>
  );
}
