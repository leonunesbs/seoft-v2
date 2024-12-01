"use client";

import {
  MdDeleteOutline,
  MdOutlineFileCopy,
  MdSwitchLeft,
} from "react-icons/md";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

import { type Prisma } from "@prisma/client";
import { type UseFormReturn } from "react-hook-form";
import { AccessFileButton } from "../atoms/access-file-button";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

type EvaluationFormValues = {
  biomicroscopyOD?: string;
  biomicroscopyOS?: string;
  fundoscopyOD?: string;
  fundoscopyOS?: string;
  gonioscopyOD?: string;
  gonioscopyOS?: string;
  tonometryOD?: string;
  tonometryOS?: string;
  pachymetryOD?: string;
  pachymetryOS?: string;
  octOD?: FileList | null;
  octOS?: FileList | null;
  visualFieldOD?: FileList | null;
  visualFieldOS?: FileList | null;
  angiographyOD?: FileList | null;
  angiographyOS?: FileList | null;
  ctCorneaOD?: FileList | null;
  ctCorneaOS?: FileList | null;
  retinographyOD?: FileList | null;
  retinographyOS?: FileList | null;
  clinicalData: string;
  diagnosis?: string;
  treatment?: string;
  followUp?: string;
  nextAppointment?: string;
  notes?: string;
};

type EvaluationMainFormProps = {
  rightEyeId?: string;
  leftEyeId?: string;
  form: UseFormReturn<EvaluationFormValues>;
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

export function EvaluationMainForm({
  form,
  lastEvaluationData,
  rightEyeId,
  leftEyeId,
}: EvaluationMainFormProps) {
  const handleFileUpload = async (
    file: File,
    fieldName: keyof EvaluationFormValues,
  ) => {
    try {
      const presignedResponse = await fetch(
        `/api/s3?action=upload&fileName=${fieldName}-${fieldName.includes("OD") ? rightEyeId : leftEyeId}&contentType=${file.type}`,
      );
      const { signedUrl, objectUrl } = (await presignedResponse.json()) as {
        signedUrl: string;
        objectUrl: string;
      };

      // Upload file to S3 using presigned URL
      await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      // Set the S3 object URL in the form
      form.setValue(fieldName, objectUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleCopyODToOE = (
    fieldOD: keyof EvaluationFormValues,
    fieldOE: keyof EvaluationFormValues,
  ) => {
    const valueOD = form.getValues(fieldOD);
    form.setValue(fieldOE, valueOD ?? "");
  };

  const handleCopyLastData = (fields: Array<keyof EvaluationFormValues>) => {
    if (!lastEvaluationData) return;

    fields.forEach((field) => {
      let value: unknown;

      const fieldStr = field.toString();

      // Verifica se o campo é específico de um olho (termina com 'OD' ou 'OS')
      if (fieldStr.endsWith("OD") || fieldStr.endsWith("OS")) {
        const eyeSide = fieldStr.endsWith("OD") ? "rightEye" : "leftEye";
        const eyeLogs = lastEvaluationData.eyes?.[eyeSide]?.logs;

        // Extrai o tipo de log a partir do nome do campo
        const logTypeRaw = fieldStr.substring(0, fieldStr.length - 2);

        // Mapeamento de nomes de campos para tipos de logs
        const fieldToLogTypeMap: Record<string, string> = {
          tonometry: "TONOMETRY",
          fundoscopy: "FUNDOSCOPY",
          gonioscopy: "GONIOSCOPY",
          biomicroscopy: "BIOMICROSCOPY",
          pachymetry: "PACHYMETRY",
          retinography: "RETINOGRAPHY",
          oct: "OCT",
          visualField: "VISUAL_FIELD",
          angiography: "ANGIOGRAPHY",
          ctCornea: "CT_CORNEA",
          // Adicione outros mapeamentos conforme necessário
        };

        const logType =
          fieldToLogTypeMap[logTypeRaw.toLowerCase()] ??
          logTypeRaw.toUpperCase();

        const log = eyeLogs?.find((l) => l.type === logType);
        value = log?.details ?? "";
      } else {
        // Para campos não específicos de olho
        value = (lastEvaluationData as never)[field] || "";
      }

      form.setValue(field, value as string | FileList | null | undefined);
    });
  };
  const handleClearFields = (fields: Array<keyof EvaluationFormValues>) => {
    fields.forEach((field) => form.setValue(field, ""));
  };

  return (
    <Form {...form}>
      <form className="min-w-xs flex w-full flex-col gap-6">
        {/* Dados Clínicos */}
        <FormField
          control={form.control}
          name="clinicalData"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dados Clínicos</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Descreva informações clínicas relevantes"
                  className="min-h-40"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* BIOMICROSCOPIA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between gap-1">
              Biomicroscopia
              <div className="flex gap-2">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() =>
                    handleCopyLastData(["biomicroscopyOD", "biomicroscopyOS"])
                  }
                >
                  <MdOutlineFileCopy size={18} />
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() =>
                    handleCopyODToOE("biomicroscopyOD", "biomicroscopyOS")
                  }
                >
                  <MdSwitchLeft size={18} />
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() =>
                    handleClearFields(["biomicroscopyOD", "biomicroscopyOS"])
                  }
                >
                  <MdDeleteOutline size={18} />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="biomicroscopyOD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OD</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Informe o resultado"
                          className="min-h-40 w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="biomicroscopyOS"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OE</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Informe o resultado"
                          className="min-h-40 w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 sm:flex-row">
          {/* TONOMETRIA */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex justify-between gap-1">
                Tonometria (TA)
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleCopyLastData(["tonometryOD", "tonometryOS"])
                    }
                  >
                    <MdOutlineFileCopy size={18} />
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleCopyODToOE("tonometryOD", "tonometryOS")
                    }
                  >
                    <MdSwitchLeft size={18} />
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleClearFields(["tonometryOD", "tonometryOS"])
                    }
                  >
                    <MdDeleteOutline size={18} />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="w-full">
                  <FormField
                    control={form.control}
                    name="tonometryOD"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OD</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Informe o resultado"
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-full">
                  <FormField
                    control={form.control}
                    name="tonometryOS"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OE</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Informe o resultado"
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* PAQUIMETRIA */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex justify-between gap-1">
                Paquimetria
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleCopyLastData(["pachymetryOD", "pachymetryOS"])
                    }
                  >
                    <MdOutlineFileCopy size={18} />
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleCopyODToOE("pachymetryOD", "pachymetryOS")
                    }
                  >
                    <MdSwitchLeft size={18} />
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleClearFields(["pachymetryOD", "pachymetryOS"])
                    }
                  >
                    <MdDeleteOutline size={18} />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="w-full">
                  <FormField
                    control={form.control}
                    name="pachymetryOD"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OD</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Informe o resultado"
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-full">
                  <FormField
                    control={form.control}
                    name="pachymetryOS"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OE</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Informe o resultado"
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FUNDOSCOPIA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between gap-1">
              Fundoscopia
              <div className="flex gap-2">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() =>
                    handleCopyLastData(["fundoscopyOD", "fundoscopyOS"])
                  }
                >
                  <MdOutlineFileCopy size={18} />
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() =>
                    handleCopyODToOE("fundoscopyOD", "fundoscopyOS")
                  }
                >
                  <MdSwitchLeft size={18} />
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() =>
                    handleClearFields(["fundoscopyOD", "fundoscopyOS"])
                  }
                >
                  <MdDeleteOutline size={18} />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="fundoscopyOD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OD</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Informe o resultado"
                          className="min-h-32"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="fundoscopyOS"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OE</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Informe o resultado"
                          className="min-h-32"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GONIOSCOPIA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between gap-1">
              Gonioscopia
              <div className="flex gap-2">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() =>
                    handleCopyLastData(["gonioscopyOD", "gonioscopyOS"])
                  }
                >
                  <MdOutlineFileCopy size={18} />
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() =>
                    handleCopyODToOE("gonioscopyOD", "gonioscopyOS")
                  }
                >
                  <MdSwitchLeft size={18} />
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() =>
                    handleClearFields(["gonioscopyOD", "gonioscopyOS"])
                  }
                >
                  <MdDeleteOutline size={18} />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="gonioscopyOD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OD</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Informe o resultado"
                          className="min-h-28"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="gonioscopyOS"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OE</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Informe o resultado"
                          className="min-h-28"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OCT */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              OCT
              <div className="flex-between flex items-center gap-1">
                {form.getValues("octOD") && (
                  <AccessFileButton fileName={`octOD-${rightEyeId}`}>
                    OD
                  </AccessFileButton>
                )}
                {form.getValues("octOS") && (
                  <AccessFileButton fileName={`octOS-${leftEyeId}`}>
                    OE
                  </AccessFileButton>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="octOD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OD</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file)
                              void void handleFileUpload(file, field.name);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="octOS"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OE</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file)
                              void void handleFileUpload(file, field.name);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RETINOGRAFIA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              Retinografia
              <div className="flex-between flex items-center gap-1">
                {form.getValues("retinographyOD") && (
                  <AccessFileButton fileName={`retinographyOD-${rightEyeId}`}>
                    OD
                  </AccessFileButton>
                )}
                {form.getValues("retinographyOS") && (
                  <AccessFileButton fileName={`retinographyOS-${leftEyeId}`}>
                    OE
                  </AccessFileButton>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="retinographyOD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OD</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          className="w-full"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleFileUpload(file, field.name);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="retinographyOS"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OE</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          className="w-full"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleFileUpload(file, field.name);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CAMPO VISUAL */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              Campo Visual
              <div className="flex-between flex items-center gap-1">
                {form.getValues("visualFieldOD") && (
                  <AccessFileButton fileName={`visualFieldOD-${rightEyeId}`}>
                    OD
                  </AccessFileButton>
                )}
                {form.getValues("visualFieldOS") && (
                  <AccessFileButton fileName={`visualFieldOS-${leftEyeId}`}>
                    OE
                  </AccessFileButton>
                )}
              </div>
            </CardTitle>{" "}
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="visualFieldOD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OD</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          className="w-full"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleFileUpload(file, field.name);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="visualFieldOS"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OE</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          className="w-full"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleFileUpload(file, field.name);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ANGIOGRAFIA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              Angiografia
              <div className="flex-between flex items-center gap-1">
                {form.getValues("angiographyOD") && (
                  <AccessFileButton fileName={`angiographyOD-${rightEyeId}`}>
                    OD
                  </AccessFileButton>
                )}
                {form.getValues("angiographyOS") && (
                  <AccessFileButton fileName={`angiographyOS-${leftEyeId}`}>
                    OE
                  </AccessFileButton>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="angiographyOD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OD</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          className="w-full"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleFileUpload(file, field.name);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="angiographyOS"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OE</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          className="w-full"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleFileUpload(file, field.name);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TC DE CÓRNEA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              TC de Córnea
              <div className="flex-between flex items-center gap-1">
                {form.getValues("ctCorneaOD") && (
                  <AccessFileButton fileName={`ctCorneaOD-${rightEyeId}`}>
                    OD
                  </AccessFileButton>
                )}
                {form.getValues("ctCorneaOS") && (
                  <AccessFileButton fileName={`ctCorneaOS-${leftEyeId}`}>
                    OE
                  </AccessFileButton>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="ctCorneaOD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OD</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          className="w-full"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleFileUpload(file, field.name);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="ctCorneaOS"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OE</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          className="w-full"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleFileUpload(file, field.name);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnóstico */}
        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex justify-between">
                Diagnóstico
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => handleCopyLastData(["diagnosis"])}
                >
                  <MdOutlineFileCopy size={18} />
                </Button>
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Informe o diagnóstico do paciente"
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tratamento */}
        <FormField
          control={form.control}
          name="treatment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tratamento</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Descreva o tratamento sugerido"
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Acompanhamento */}
        <FormField
          control={form.control}
          name="followUp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Acompanhamento</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Plano de acompanhamento"
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Próxima Consulta */}
        <FormField
          control={form.control}
          name="nextAppointment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Próxima Consulta</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Programação" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Anotações */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anotações</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Escreva anotações adicionais"
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
