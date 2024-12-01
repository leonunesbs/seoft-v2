import { PageHeading } from "~/components/atoms/page-heading";
import { StaffForm } from "~/components/organisms/staff-form";
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
      <PageHeading>Adicionar Staff</PageHeading>
      <StaffForm allClinics={allClinics} />
    </div>
  );
}
