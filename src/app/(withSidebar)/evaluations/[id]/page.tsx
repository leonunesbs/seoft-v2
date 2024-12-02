import { notFound, redirect } from "next/navigation";

import { PageHeading } from "~/components/atoms/page-heading";
import { EvaluationForm } from "~/components/organisms/evaluation-form";
import { db } from "~/server/db";

type Params = Promise<{ id: string }>;

export default async function EvaluationPage({ params }: { params: Params }) {
  const { id } = await params;

  const evaluation = await db.evaluation.findUnique({
    where: {
      id,
    },
    include: {
      clinic: true,
      collaborator: true,
      patient: true,
      eyes: {
        include: {
          leftEye: {
            include: {
              logs: true,
              refraction: true,
              surgeries: {
                orderBy: {
                  date: "asc",
                },
              },
            },
          },
          rightEye: {
            include: {
              logs: true,
              refraction: true,
              surgeries: {
                orderBy: {
                  date: "asc",
                },
              },
            },
          },
        },
      },
    },
  });
  const lastEvaluation = (await db.evaluation.findFirst({
    where: {
      done: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      eyes: {
        include: {
          leftEye: {
            include: {
              logs: true,
              refraction: true,
              surgeries: true,
            },
          },
          rightEye: {
            include: {
              logs: true,
              refraction: true,
              surgeries: true,
            },
          },
        },
      },
    },
  }))!;

  if (!evaluation) notFound();

  const clinics = await db.clinic.findMany({
    include: {
      collaborators: {
        select: {
          collaborator: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
  const patientSurgeries = await db.evaluation.findMany({
    where: {
      patientId: evaluation.patientId,
    },
    include: {
      eyes: {
        include: {
          leftEye: {
            include: {
              surgeries: {
                orderBy: {
                  date: "asc",
                },
              },
            },
          },
          rightEye: {
            include: {
              surgeries: {
                orderBy: {
                  date: "asc",
                },
              },
            },
          },
        },
      },
    },
  });

  if (evaluation.done) redirect(`/evaluations/${id}/summary`);
  return (
    <div>
      <div className="flex justify-between">
        <PageHeading>Avaliação</PageHeading>
      </div>
      <EvaluationForm
        evaluation={evaluation}
        lastEvaluationData={lastEvaluation}
        clinics={clinics}
        patientSurgeries={patientSurgeries.map((evaluation) => ({
          eyes: {
            leftEye: {
              surgeries: evaluation.eyes?.leftEye.surgeries ?? [],
            },
            rightEye: {
              surgeries: evaluation.eyes?.rightEye.surgeries ?? [],
            },
          },
        }))}
      />
    </div>
  );
}
