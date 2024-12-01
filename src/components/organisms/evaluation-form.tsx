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
  octOD: z.any().optional(),
  octOS: z.any().optional(),
  ctCorneaOD: z.any().optional(),
  ctCorneaOS: z.any().optional(),
  angiographyOD: z.any().optional(),
  angiographyOS: z.any().optional(),
  visualFieldOD: z.any().optional(),
  visualFieldOS: z.any().optional(),
  retinographyOD: z.any().optional(),
  retinographyOS: z.any().optional(),
  clinicalData: z.string().min(1, "Dados clínicos são obrigatórios."),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  followUp: z.string().optional(),
  nextAppointment: z.string().optional(),
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

  const emptyBiomicroscopy =
    "Pálpebras: \nConjuntiva: \nCórnea: \nCâmara anterior: \nÍris: \nCristalino: \nVítreo: \n";
  const emptyFundoscopy =
    "Retina: \nNervo: \nEscavação: \nMácula: \nVasos: \nPeriferia: \n";
  const emptyGonioscopy = "Superior: \nInferior: \nNasal: \nTemporal: \n";

  const mainForm = useForm<MainFormValues>({
    resolver: zodResolver(mainFormSchema),
    defaultValues: {
      biomicroscopyOD:
        evaluation.eyes?.rightEye?.logs.find(
          (log) => log.type === "BIOMICROSCOPY",
        )?.details ?? emptyBiomicroscopy,
      biomicroscopyOS:
        evaluation.eyes?.leftEye?.logs.find(
          (log) => log.type === "BIOMICROSCOPY",
        )?.details ?? "",
      fundoscopyOD:
        evaluation.eyes?.rightEye?.logs.find((log) => log.type === "FUNDOSCOPY")
          ?.details ?? emptyFundoscopy,
      fundoscopyOS:
        evaluation.eyes?.leftEye?.logs.find((log) => log.type === "FUNDOSCOPY")
          ?.details ?? "",
      gonioscopyOD:
        evaluation.eyes?.rightEye?.logs.find((log) => log.type === "GONIOSCOPY")
          ?.details ?? emptyGonioscopy,
      gonioscopyOS:
        evaluation.eyes?.leftEye?.logs.find((log) => log.type === "GONIOSCOPY")
          ?.details ?? "",
      tonometryOD:
        evaluation.eyes?.rightEye?.logs.find((log) => log.type === "TONOMETRY")
          ?.details ?? "",
      tonometryOS:
        evaluation.eyes?.leftEye?.logs.find((log) => log.type === "TONOMETRY")
          ?.details ?? "",
      pachymetryOD:
        evaluation.eyes?.rightEye?.logs.find((log) => log.type === "PACHYMETRY")
          ?.details ?? "",
      pachymetryOS:
        evaluation.eyes?.leftEye?.logs.find((log) => log.type === "PACHYMETRY")
          ?.details ?? "",
      retinographyOD:
        evaluation.eyes?.rightEye?.logs.find(
          (log) => log.type === "RETINOGRAPHY",
        )?.details ?? "",
      retinographyOS:
        evaluation.eyes?.leftEye?.logs.find(
          (log) => log.type === "RETINOGRAPHY",
        )?.details ?? "",
      octOD:
        evaluation.eyes?.rightEye?.logs.find((log) => log.type === "OCT")
          ?.details ?? "",
      octOS:
        evaluation.eyes?.leftEye?.logs.find((log) => log.type === "OCT")
          ?.details ?? "",
      ctCorneaOD:
        evaluation.eyes?.rightEye?.logs.find((log) => log.type === "CT_CORNEA")
          ?.details ?? "",
      ctCorneaOS:
        evaluation.eyes?.leftEye?.logs.find((log) => log.type === "CT_CORNEA")
          ?.details ?? "",
      angiographyOD:
        evaluation.eyes?.rightEye?.logs.find(
          (log) => log.type === "ANGIOGRAPHY",
        )?.details ?? "",
      angiographyOS:
        evaluation.eyes?.leftEye?.logs.find((log) => log.type === "ANGIOGRAPHY")
          ?.details ?? "",
      visualFieldOD:
        evaluation.eyes?.rightEye?.logs.find(
          (log) => log.type === "VISUAL_FIELD",
        )?.details ?? "",
      visualFieldOS:
        evaluation.eyes?.leftEye?.logs.find(
          (log) => log.type === "VISUAL_FIELD",
        )?.details ?? "",
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
    if (identificationForm.getValues("clinic") === "") {
      toast({
        title: "Erro!",
        description: "Selecione um ambulatório.",
        variant: "destructive",
      });
      return;
    }

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
        <div className="flex w-full flex-col space-y-4 text-sm sm:max-w-xs">
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
