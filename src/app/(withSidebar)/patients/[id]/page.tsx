import { PatientForm } from "~/components/organisms/patient-form";
import { db } from "~/server/db";
import { notFound } from "next/navigation";

type Params = Promise<{ id: string }>;
export default async function Patient({ params }: { params: Params }) {
  const { id } = await params;

  const patient = await db.patient.findUnique({
    where: { id },
  });

  if (!patient) return notFound();
  return (
    <PatientForm
      initialData={{
        id: patient.id,
        refId: patient.refId,
        name: patient.name,
        birthDate: patient.birthDate.toISOString(),
      }}
    />
  );
}
