import { notFound } from "next/navigation";
import { PageHeading } from "~/components/atoms/page-heading";
import { PatientForm } from "~/components/organisms/patient-form";
import { db } from "~/server/db";

type Params = Promise<{ id: string }>;
export default async function Patient({ params }: { params: Params }) {
  const { id } = await params;

  const patient = await db.patient.findUnique({
    where: { id },
    include: {
      evaluations: {
        include: {
          collaborator: { select: { name: true } },
          clinic: { select: { name: true } },
        },
      },
    },
  });

  if (!patient) return notFound();
  return (
    <div className="pl-2">
      <PageHeading>Detalhes do Paciente</PageHeading>

      <PatientForm
        initialData={{
          id: patient.id,
          refId: patient.refId,
          name: patient.name,
          birthDate: patient.birthDate.toISOString(),
        }}
      />
      <div className="mt-8">
        <h2 className="text-xl font-bold">Evaluation History</h2>
        <ul>
          {patient.evaluations.map((evaluation) => (
            <li key={evaluation.id} className="my-2 border p-4">
              <p>
                <strong>Collaborator:</strong>{" "}
                {evaluation.collaborator?.name || "Unknown"}
              </p>
              <p>
                <strong>Clinic:</strong> {evaluation.clinic?.name || "Unknown"}
              </p>
              <p>
                <strong>Diagnosis:</strong> {evaluation.diagnosis || "N/A"}
              </p>
              <p>
                <strong>Treatment:</strong> {evaluation.treatment || "N/A"}
              </p>
              <p>
                <strong>Follow Up:</strong> {evaluation.followUp || "N/A"}
              </p>
              <p>
                <strong>Next Appointment:</strong>{" "}
                {evaluation.nextAppointment || "N/A"}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(evaluation.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {evaluation.done ? "Completed" : "Pending"}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
