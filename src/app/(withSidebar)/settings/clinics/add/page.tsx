import { ClinicForm } from "~/components/organisms/clinic-form";
import { PageHeading } from "~/components/atoms/page-heading";
import { db } from "~/server/db";

export default async function ClinicPage() {
  const allCollaborators = await db.collaborator.findMany({
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
      <PageHeading>Adicionar Ambulatório</PageHeading>
      <div className="px-2">
        <ClinicForm allCollaborators={allCollaborators} />
      </div>
    </div>
  );
}
