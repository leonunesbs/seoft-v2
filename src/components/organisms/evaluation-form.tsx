"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type EyeSurgery, type Prisma } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { MdCheck, MdSave } from "react-icons/md";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { toast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import { ElapsedTime } from "../atoms/elapsed-time";
import { RemoveEvaluationButton } from "../atoms/remove-evaluation-button";
import { Separator } from "../ui/separator";
import { EvaluationIdentificationForm } from "./evaluation-identification-form";
import { EvaluationMainForm } from "./evaluation-main-form";
import { EvaluationRefractionForm } from "./evaluation-refraction-form";
import { EvaluationSurgeryForm } from "./evaluation-surgery-form";

// Schemas de validação
const identificationSchema = z.object({
  collaborator: z.string(),
  clinic: z.string(),
});

const mainFormSchema = z.object({
  date: z.string().optional(),
  procedure: z.string().optional(),
  notes: z.string().optional(),
  biomicroscopyOD: z.string().optional(),
  biomicroscopyOS: z.string().optional(),
  fundoscopyOD: z.string().optional(),
  fundoscopyOS: z.string().optional(),
  gonioscopyOD: z.string().optional(),
  gonioscopyOS: z.string().optional(),
  tonometryOD: z.string().optional(),
  tonometryOS: z.string().optional(),
  pachymetryOD: z.string().optional(),
  pachymetryOS: z.string().optional(),
  clinicalData: z.string().min(1, "Dados clínicos são obrigatórios."),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  followUp: z.string().optional(),
  nextAppointment: z.string().optional(),
  done: z.boolean().optional(),
});

type IdentificationFormValues = z.infer<typeof identificationSchema>;
type MainFormValues = z.infer<typeof mainFormSchema>;

type EvaluationFormProps = {
  patientSurgeries: Array<{
    eyes: {
      leftEye: { surgeries: EyeSurgery[] };
      rightEye: { surgeries: EyeSurgery[] };
    };
  }>;
  evaluation: Prisma.EvaluationGetPayload<{
    include: {
      patient: true;
      collaborator: true;
      clinic: true;
      eyes: {
        include: {
          rightEye: {
            include: {
              logs: true;
              refraction: true;
            };
          };
          leftEye: {
            include: {
              logs: true;
              refraction: true;
            };
          };
        };
      };
    };
  }>;
  clinics: Prisma.ClinicGetPayload<{
    include: {
      collaborators: {
        select: {
          collaborator: {
            select: {
              name: true;
            };
          };
        };
      };
    };
  }>[];
  lastEvaluationData?: Prisma.EvaluationGetPayload<{
    select: {
      eyes: {
        include: {
          leftEye: {
            include: {
              logs: true;
              refraction: true;
            };
          };
          rightEye: {
            include: {
              logs: true;
              refraction: true;
            };
          };
        };
      };
    };
  }>;
};

export function EvaluationForm({
  evaluation,
  clinics,
  lastEvaluationData,
  patientSurgeries,
}: EvaluationFormProps) {
  const router = useRouter();

  const identificationForm = useForm<IdentificationFormValues>({
    resolver: zodResolver(identificationSchema),
    defaultValues: {
      collaborator: `[${evaluation.collaborator.crm}] ${evaluation.collaborator.name}`,
      clinic: evaluation.clinic?.id ?? "",
    },
  });

  const mainForm = useForm<MainFormValues>({
    resolver: zodResolver(mainFormSchema),
    defaultValues: {
      clinicalData: evaluation.clinicalData ?? "",
      diagnosis: evaluation.diagnosis ?? "",
      treatment: evaluation.treatment ?? "",
      followUp: evaluation.followUp ?? "",
      nextAppointment: evaluation.nextAppointment ?? "",
    },
  });

  const updateEvaluation = api.evaluation.update.useMutation({
    onSuccess: (data, variables) => {
      const message = variables.done
        ? "A avaliação foi marcada como concluída com sucesso."
        : "A avaliação foi salva com sucesso.";
      const title = variables.done ? "Avaliação concluída!" : "Avaliação salva";

      toast({
        title,
        description: message,
        variant: "default",
      });

      if (variables.done) {
        router.push(`/evaluations/${variables.id}/summary`);
      } else {
        router.refresh();
      }
    },
    onError: (error, variables) => {
      const message = variables.done
        ? "Erro ao concluir a avaliação. Tente novamente."
        : "Erro ao salvar a avaliação. Tente novamente.";

      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    },
  });

  const isSubmitting = updateEvaluation.isPending;

  const handleSubmitMainForm = (data: MainFormValues, done = false) => {
    const payload = {
      ...data,
      done,
      id: evaluation.id || undefined,
      patientId: evaluation.patient.id,
      collaboratorId: evaluation.collaborator.id,
      clinicId: identificationForm.getValues().clinic,
      rightEyeId: evaluation.eyes?.rightEyeId,
      leftEyeId: evaluation.eyes?.leftEyeId,
    };

    updateEvaluation.mutate(payload);
  };

  function FormActions() {
    return (
      <div className="flex flex-col items-end gap-2">
        <span className="text-xs text-muted-foreground">
          Salvo <ElapsedTime startTime={evaluation.updatedAt.toISOString()} />.
        </span>
        <div className="flex gap-2">
          <RemoveEvaluationButton
            evaluationId={evaluation.id}
            patientName={evaluation.patient.name}
          />
          <Button
            type="button"
            variant="outline"
            onClick={mainForm.handleSubmit((data) =>
              handleSubmitMainForm(data),
            )}
            disabled={isSubmitting}
          >
            <MdSave size={18} />
            <span className="hidden md:block">
              {isSubmitting ? "Salvando..." : "Salvar"}
            </span>
          </Button>
          <Button
            type="button"
            onClick={mainForm.handleSubmit((data) =>
              handleSubmitMainForm(data, true),
            )}
            disabled={isSubmitting}
          >
            <MdCheck size={18} />
            <span className="hidden md:block">
              {isSubmitting ? "Concluindo..." : "Concluir"}
            </span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-2">
      <FormActions />
      <EvaluationIdentificationForm
        form={identificationForm}
        patient={evaluation.patient}
        collaborator={evaluation.collaborator}
        clinics={clinics}
      />
      <Separator />
      <div className="flex w-full flex-col-reverse gap-4 sm:flex-row">
        <EvaluationMainForm
          form={mainForm}
          lastEvaluationData={lastEvaluationData}
          leftEyeId={evaluation.eyes?.leftEyeId}
          rightEyeId={evaluation.eyes?.rightEyeId}
        />
        <div className="space-y-4 text-sm">
          <EvaluationRefractionForm
            leftEye={evaluation.eyes?.leftEye}
            rightEye={evaluation.eyes?.rightEye}
            lastEyesData={{
              leftEye: lastEvaluationData?.eyes?.leftEye,
              rightEye: lastEvaluationData?.eyes?.rightEye,
            }}
          />
          <EvaluationSurgeryForm
            evaluation={evaluation}
            patientSurgeries={patientSurgeries}
          />
        </div>
      </div>
      <FormActions />
    </div>
  );
}
