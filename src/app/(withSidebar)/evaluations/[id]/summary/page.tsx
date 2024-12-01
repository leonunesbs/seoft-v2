// pages/evaluations/[id]/summary.tsx

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { notFound } from "next/navigation";
import { CopyPromptButton } from "~/components/atoms/copy-prompt-button";
import { ReopenEvaluationButton } from "~/components/atoms/reopen-evaluation-button";
import { SignedLink } from "~/components/atoms/signed-link";
import { Separator } from "~/components/ui/separator";
import { db } from "~/server/db";

type Params = Promise<{ id: string }>;

export default async function EvaluationSummaryPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  // Recupera os dados da avaliação
  const evaluation = await db.evaluation.findUnique({
    where: { id },
    include: {
      patient: {
        include: {
          evaluations: {
            where: { done: true },
            orderBy: { createdAt: "desc" },
            include: {
              eyes: {
                include: {
                  leftEye: {
                    include: {
                      refraction: {
                        orderBy: { recordedAt: "desc" },
                      },
                      surgeries: {
                        orderBy: { date: "desc" },
                      },
                      logs: true,
                    },
                  },
                  rightEye: {
                    include: {
                      refraction: {
                        orderBy: { recordedAt: "desc" },
                      },
                      surgeries: {
                        orderBy: { date: "desc" },
                      },
                      logs: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      collaborator: true,
      clinic: {
        include: {
          collaborators: {
            include: {
              collaborator: true,
            },
          },
        },
      },
      eyes: {
        include: {
          rightEye: {
            include: {
              logs: {
                orderBy: { type: "asc" },
              },
              refraction: {
                orderBy: { recordedAt: "desc" },
              },
              surgeries: {
                orderBy: { date: "desc" },
              },
            },
          },
          leftEye: {
            include: {
              logs: {
                orderBy: { type: "asc" },
              },
              refraction: {
                orderBy: { recordedAt: "desc" },
              },
              surgeries: {
                orderBy: { date: "desc" },
              },
            },
          },
        },
      },
    },
  });

  if (!evaluation) {
    notFound();
  }
  const { patient, collaborator, clinic, eyes } = evaluation;

  // Função para calcular a idade
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Função para verificar se um texto é um URL válido
  const isValidUrl = (text: string) => {
    try {
      const url = new URL(text);
      return url.hostname === "seoft-bucket.s3.amazonaws.com";
    } catch {
      return false;
    }
  };

  // Função para extrair o identificador completo do arquivo
  const extractFileIdentifier = (url: string) => {
    const match = /seoft-bucket\.s3\.amazonaws\.com\/(.+)/.exec(url);
    return match ? match[1] : url; // Retorna o caminho completo após o domínio
  };
  // Filtra os logs para ocultar aqueles com dados em branco
  const rightEyeLogs =
    eyes?.rightEye?.logs?.filter(
      (log) => log.details && log.details.trim() !== "",
    ) ?? [];
  const leftEyeLogs =
    eyes?.leftEye?.logs?.filter(
      (log) => log.details && log.details.trim() !== "",
    ) ?? [];

  // Obtém a refração mais recente para cada olho
  const latestRightRefraction = eyes?.rightEye?.refraction?.[0];
  const latestLeftRefraction = eyes?.leftEye?.refraction?.[0];

  // Obtém as cirurgias de todas as avaliações do paciente
  const rightEyeSurgeries = patient.evaluations.flatMap(
    (evalData) => evalData.eyes?.rightEye?.surgeries ?? [],
  );
  const leftEyeSurgeries = patient.evaluations.flatMap(
    (evalData) => evalData.eyes?.leftEye?.surgeries ?? [],
  );

  // Função para gerar o conteúdo final usando a template string
  const generateOutput = () => {
    let output = "";

    // Função para formatar data
    const formatDate = (date: Date | string | null | undefined) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString();
    };

    // Função para ocultar informações pessoais
    const returnText = (text: string) => {
      return text;
    };

    // Seção 1: Ambulatório
    output += `1. **Ambulatório**\n`;

    const clinicFields = [];

    if (clinic?.name) {
      clinicFields.push(`- Nome do ambulatório: ${clinic.name}`);
    }

    if (clinic?.collaborators && clinic.collaborators.length > 0) {
      clinicFields.push(
        `- Colaboradores:\n${clinic.collaborators
          .map(
            (colab) =>
              `   - ${returnText(colab.collaborator.name)} (CRM: ${colab.collaborator.crm || ""}, Função: ${
                colab.collaborator.role || ""
              })`,
          )
          .join("\n")}`,
      );
    }

    output += clinicFields.join("\n") || "- N/A";

    // Seção 2: Cirurgias
    output += `\n\n2. **Cirurgias**\n`;

    const surgeriesFields = [];

    const sortedRightEyeSurgeries = rightEyeSurgeries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const sortedLeftEyeSurgeries = leftEyeSurgeries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    if (sortedRightEyeSurgeries.length > 0) {
      surgeriesFields.push(
        `- Cirurgias olho direito:\n${sortedRightEyeSurgeries
          .map(
            (surgery) =>
              `   - ${surgery.procedure || ""}, notas: ${surgery.notes ?? ""}`,
          )
          .join("\n")}`,
      );
    }

    if (sortedLeftEyeSurgeries.length > 0) {
      surgeriesFields.push(
        `- Cirurgias olho esquerdo:\n${sortedLeftEyeSurgeries
          .map(
            (surgery) =>
              `   - ${surgery.procedure || ""}, notas: ${surgery.notes ?? ""}`,
          )
          .join("\n")}`,
      );
    }

    output += surgeriesFields.join("\n") || "- N/A";

    // Seção 3: Dados Clínicos
    output += `\n\n3. **Dados Clínicos**\n`;

    const clinicalDataFields = [];

    if (patient.name) {
      clinicalDataFields.push(`- Paciente: ${returnText(patient.name)}`);
    }

    if (patient.birthDate) {
      clinicalDataFields.push(
        `- Data de nascimento: ${formatDate(patient.birthDate)}`,
      );
    }

    if (patient.refId) {
      clinicalDataFields.push(`- ID do prontuário: ${patient.refId}`);
    }

    const previousEvaluations = patient.evaluations
      ?.filter((ev) => ev.done && ev.id !== evaluation.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5)
      .map(
        (ev) =>
          `   - ${formatDate(ev.createdAt)}: Diagnóstico: ${ev.diagnosis ?? ""}`,
      )
      .join("\n");

    if (previousEvaluations) {
      clinicalDataFields.push(
        `- Avaliações anteriores:\n${previousEvaluations}`,
      );
    }

    output += clinicalDataFields.join("\n") || "- N/A";

    // Seção 4: Dados Clínicos Detalhados
    output += `\n\n4. **Dados Clínicos Detalhados**\n`;
    output += evaluation.clinicalData?.trim()
      ? `- ${evaluation.clinicalData}`
      : "- N/A";

    // Seção 5: Exame Físico
    output += `\n\n5. **Exame Físico**\n`;

    const physicalExamFields = [];

    if (latestRightRefraction) {
      const refractionData = [];
      if (latestRightRefraction.spherical !== undefined)
        refractionData.push(`Esférico: ${latestRightRefraction.spherical}`);
      if (latestRightRefraction.cylinder !== undefined)
        refractionData.push(`Cilíndrico: ${latestRightRefraction.cylinder}`);
      if (latestRightRefraction.axis !== undefined)
        refractionData.push(`Eixo: ${latestRightRefraction.axis}`);
      if (latestRightRefraction.visualAcuity)
        refractionData.push(
          `Acuidade Visual: ${latestRightRefraction.visualAcuity}`,
        );
      physicalExamFields.push(
        `- Refração olho direito:\n   - ${refractionData.join("\n   - ")}`,
      );
    }

    if (latestLeftRefraction) {
      const refractionData = [];
      if (latestLeftRefraction.spherical !== undefined)
        refractionData.push(`Esférico: ${latestLeftRefraction.spherical}`);
      if (latestLeftRefraction.cylinder !== undefined)
        refractionData.push(`Cilíndrico: ${latestLeftRefraction.cylinder}`);
      if (latestLeftRefraction.axis !== undefined)
        refractionData.push(`Eixo: ${latestLeftRefraction.axis}`);
      if (latestLeftRefraction.visualAcuity)
        refractionData.push(
          `Acuidade Visual: ${latestLeftRefraction.visualAcuity}`,
        );
      physicalExamFields.push(
        `- Refração olho esquerdo:\n   - ${refractionData.join("\n   - ")}`,
      );
    }

    if (rightEyeLogs.length > 0) {
      const sortedRightEyeLogs = rightEyeLogs.sort(
        (a, b) =>
          new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
      );
      physicalExamFields.push(
        `- Logs olho direito:\n${sortedRightEyeLogs
          .map((log) => `   - ${log.type || ""} - ${log.details ?? ""}`)
          .join("\n")}`,
      );
    }

    if (leftEyeLogs.length > 0) {
      const sortedLeftEyeLogs = leftEyeLogs.sort(
        (a, b) =>
          new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
      );
      physicalExamFields.push(
        `- Logs olho esquerdo:\n${sortedLeftEyeLogs
          .map((log) => `   - ${log.type || ""} - ${log.details ?? ""}`)
          .join("\n")}`,
      );
    }

    output += physicalExamFields.join("\n") || "- N/A";

    // Seção 6: Impressão Diagnóstica
    output += `\n\n6. **Impressão Diagnóstica**\n`;
    output +=
      evaluation.diagnosis && evaluation.diagnosis.trim() !== ""
        ? `- ${evaluation.diagnosis}`
        : "- N/A";

    // Seção 7: Tratamento
    output += `\n\n7. **Tratamento**\n`;
    output +=
      evaluation.treatment && evaluation.treatment.trim() !== ""
        ? `- ${evaluation.treatment}`
        : "- N/A";

    // Seção 8: Acompanhamento
    output += `\n\n8. **Acompanhamento**\n`;
    output +=
      evaluation.followUp && evaluation.followUp.trim() !== ""
        ? `- ${evaluation.followUp}`
        : "- N/A";

    // Seção 9: Retorno
    output += `\n\n9. **Retorno**\n`;
    output += evaluation.nextAppointment
      ? `- Próxima consulta: ${evaluation.nextAppointment}`
      : "- N/A";

    return output;
  };

  // Gere o conteúdo final usando a template string
  const prompt = generateOutput();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Resumo da Avaliação</h1>
        <div className="flex gap-2">
          {/* Botão para reabrir a avaliação */}
          <ReopenEvaluationButton evaluation={evaluation} />
          <CopyPromptButton prompt={prompt} />
        </div>
      </div>

      {/* Informações do Paciente */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Paciente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Nome:</strong> {patient.name || "N/A"}
          </p>
          <p>
            <strong>Idade:</strong>{" "}
            {patient.birthDate
              ? calculateAge(patient.birthDate.toISOString())
              : "N/A"}
          </p>
          <p>
            <strong>Histórico de Avaliações:</strong>{" "}
            {patient.evaluations.length > 0
              ? `${patient.evaluations.length} avaliações concluídas`
              : "N/A"}
          </p>
        </CardContent>
      </Card>

      {/* Detalhes do Atendimento */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Atendimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Data:</strong>{" "}
            {evaluation.createdAt
              ? new Date(evaluation.createdAt).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Colaborador:</strong> {collaborator.name || "N/A"}
          </p>
          <p>
            <strong>Ambulatório:</strong> {clinic?.name ?? "N/A"}{" "}
            {clinic?.collaborators &&
              clinic.collaborators.length > 0 &&
              `(${clinic?.collaborators.map((c) => c.collaborator.name).join(", ")})`}
          </p>
          <p>
            <strong>Dados Clínicos:</strong> {evaluation.clinicalData ?? "N/A"}
          </p>
          <p>
            <strong>Diagnóstico:</strong> {evaluation.diagnosis ?? "N/A"}
          </p>
          <p>
            <strong>Tratamento:</strong> {evaluation.treatment ?? "N/A"}
          </p>
          <p>
            <strong>Acompanhamento:</strong> {evaluation.followUp ?? "N/A"}
          </p>
          <p>
            <strong>Próxima Consulta:</strong>{" "}
            {evaluation.nextAppointment ?? "N/A"}
          </p>
        </CardContent>
      </Card>

      {/* Dados dos Olhos, Acuidade Visual, Refração e Históricos de Cirurgias */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Olho Direito */}
        <Card>
          <CardHeader>
            <CardTitle>Olho Direito (OD)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Acuidade Visual e Refração */}
            {latestRightRefraction && (
              <div className="flex flex-col gap-1">
                <p>
                  <strong>Acuidade Visual:</strong>{" "}
                  {latestRightRefraction.visualAcuity ?? "N/A"}
                </p>
                <p>
                  <strong>Refração:</strong>{" "}
                  {`Esférico: ${latestRightRefraction.spherical ?? "N/A"}, Cilíndrico: ${
                    latestRightRefraction.cylinder ?? "N/A"
                  }, Eixo: ${latestRightRefraction.axis ?? "N/A"}`}
                </p>
              </div>
            )}

            {/* Logs */}
            {rightEyeLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rightEyeLogs.map(async (log, index) => (
                    <TableRow key={index}>
                      <TableCell>{log.type || "N/A"}</TableCell>
                      <TableCell>
                        {log.details && isValidUrl(log.details) ? (
                          <SignedLink
                            fileName={extractFileIdentifier(log.details)!}
                            action="download"
                          />
                        ) : (
                          (log.details ?? "N/A")
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>Nenhum log disponível</p>
            )}

            <Separator />
            {/* Histórico de Cirurgias */}
            {rightEyeSurgeries.length > 0 ? (
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold">Histórico de Cirurgias</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Procedimento</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rightEyeSurgeries.map((surgery, index) => (
                      <TableRow key={index}>
                        <TableCell>{surgery.procedure || "N/A"}</TableCell>
                        <TableCell>
                          {surgery.date
                            ? new Date(surgery.date).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>{surgery.notes ?? "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <span className="text-center">
                <p>Nenhum histórico de cirurgias</p>
              </span>
            )}
          </CardContent>
        </Card>

        {/* Olho Esquerdo */}
        <Card>
          <CardHeader>
            <CardTitle>Olho Esquerdo (OE)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Acuidade Visual e Refração */}
            {latestLeftRefraction && (
              <div className="flex flex-col gap-1">
                <p>
                  <strong>Acuidade Visual:</strong>{" "}
                  {latestLeftRefraction.visualAcuity ?? "N/A"}
                </p>
                <p>
                  <strong>Refração:</strong>{" "}
                  {`Esférico: ${latestLeftRefraction.spherical ?? "N/A"}, Cilíndrico: ${
                    latestLeftRefraction.cylinder ?? "N/A"
                  }, Eixo: ${latestLeftRefraction.axis ?? "N/A"}`}
                </p>
              </div>
            )}

            {/* Logs */}
            {leftEyeLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leftEyeLogs.map(async (log, index) => (
                    <TableRow key={index}>
                      <TableCell>{log.type ?? "N/A"}</TableCell>
                      <TableCell>
                        {log.details && isValidUrl(log.details) ? (
                          <SignedLink
                            fileName={extractFileIdentifier(log.details)!}
                            action="download"
                          />
                        ) : (
                          (log.details ?? "N/A")
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>Nenhum log disponível</p>
            )}
            <Separator />
            {/* Histórico de Cirurgias */}
            {leftEyeSurgeries.length > 0 ? (
              <div className="gap2 flex flex-col">
                <h3 className="font-semibold">Histórico de Cirurgias</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Procedimento</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leftEyeSurgeries.map((surgery, index) => (
                      <TableRow key={index}>
                        <TableCell>{surgery.procedure || "N/A"}</TableCell>
                        <TableCell>
                          {surgery.date
                            ? new Date(surgery.date).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>{surgery.notes ?? "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <span className="text-center">
                <Separator />
                <p>Nenhum histórico de cirurgias</p>
              </span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Histórico do Paciente */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico do Paciente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {patient.evaluations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Diagnóstico</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.evaluations.map((evalData, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {evalData.createdAt
                        ? new Date(evalData.createdAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>{evalData.diagnosis ?? "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>Nenhum histórico de avaliações disponível</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
