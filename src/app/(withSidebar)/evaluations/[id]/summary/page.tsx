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

  // Função para determinar a melhor refração com base na acuidade visual
  const getBestRefraction = (refractions: any[]) => {
    return refractions.reduce((best, current) => {
      if (
        !best ||
        (current.visualAcuity &&
          (!best.visualAcuity || current.visualAcuity > best.visualAcuity))
      ) {
        return current;
      }
      return best;
    }, null);
  };

  // Melhor refração para cada olho
  const bestRightRefraction = getBestRefraction(
    eyes?.rightEye?.refraction || [],
  );
  const bestLeftRefraction = getBestRefraction(eyes?.leftEye?.refraction || []);

  const bestRightRefractionSphericalString =
    parseFloat(bestRightRefraction?.spherical) > 0
      ? "+" + parseFloat(bestRightRefraction?.spherical).toFixed(2)
      : parseFloat(bestRightRefraction?.spherical).toFixed(2);
  const bestRightRefractionCylinderString =
    parseFloat(bestRightRefraction?.cylinder) > 0
      ? "+" + parseFloat(bestRightRefraction?.cylinder).toFixed(2)
      : parseFloat(bestRightRefraction?.cylinder).toFixed(2);
  const bestRightRefractionAxisString = `${bestRightRefraction?.axis}º`;

  const bestLeftRefractionSphericalString =
    parseFloat(bestLeftRefraction?.spherical) > 0
      ? "+" + parseFloat(bestLeftRefraction?.spherical).toFixed(2)
      : parseFloat(bestLeftRefraction?.spherical).toFixed(2);
  const bestLeftRefractionCylinderString =
    parseFloat(bestLeftRefraction?.cylinder) > 0
      ? "+" + parseFloat(bestLeftRefraction?.cylinder).toFixed(2)
      : parseFloat(bestLeftRefraction?.cylinder).toFixed(2);
  const bestLeftRefractionAxisString = `${bestLeftRefraction?.axis}º`;

  // Função para formatar data
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  // Logs dos olhos
  const rightEyeLogs =
    eyes?.rightEye?.logs?.filter(
      (log) => log.details && log.details.trim() !== "",
    ) ?? [];
  const leftEyeLogs =
    eyes?.leftEye?.logs?.filter(
      (log) => log.details && log.details.trim() !== "",
    ) ?? [];

  // Cirurgias dos olhos
  const rightEyeSurgeries = patient.evaluations.flatMap(
    (evalData) => evalData.eyes?.rightEye?.surgeries ?? [],
  );
  const leftEyeSurgeries = patient.evaluations.flatMap(
    (evalData) => evalData.eyes?.leftEye?.surgeries ?? [],
  );

  // Histórico de avaliações do paciente
  const patientEvaluations = patient.evaluations
    .filter((ev) => ev.done && ev.id !== evaluation.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  // Função para gerar o conteúdo para o botão de copiar
  const generateOutput = () => {
    let output = "";

    // Função para formatar data
    const formatDate = (date: Date | string | null | undefined) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("pt-BR");
    };

    // Seção 1: Informações do Paciente
    output += `**Informações do Paciente**\n`;
    output += `- Nome: ${patient.name || "N/A"}\n`;
    output += `- Idade: ${
      patient.birthDate
        ? calculateAge(patient.birthDate.toISOString()) + " anos"
        : "N/A"
    }\n`;
    output += `- Histórico de Avaliações: ${
      patientEvaluations.length > 0
        ? `${patientEvaluations.length} avaliações concluídas`
        : "N/A"
    }\n`;

    // Seção 2: Detalhes do Atendimento
    output += `\n**Detalhes do Atendimento**\n`;
    output += `- Data: ${
      evaluation.createdAt ? formatDate(evaluation.createdAt) : "N/A"
    }\n`;
    output += `- Colaborador: ${collaborator.name || "N/A"}\n`;
    output += `- Ambulatório: ${clinic?.name || "N/A"}\n`;
    output += `- Dados Clínicos: ${evaluation.clinicalData?.trim() || "N/A"}\n`;
    output += `- Diagnóstico: ${evaluation.diagnosis || "N/A"}\n`;
    output += `- Tratamento: ${evaluation.treatment || "N/A"}\n`;
    output += `- Acompanhamento: ${evaluation.followUp || "N/A"}\n`;
    output += `- Próxima Consulta: ${evaluation.nextAppointment || "N/A"}\n`;

    // Seção 3: Olho Direito
    output += `\n**Olho Direito (OD)**\n`;

    if (bestRightRefraction) {
      output += `- Melhor Acuidade Visual: ${
        bestRightRefraction.visualAcuity || "N/A"
      }\n`;
      output += `- Refração:\n`;
      output += `   - Esférico: ${bestRightRefractionSphericalString}\n`;
      output += `   - Cilíndrico: ${bestRightRefractionCylinderString}\n`;
      output += `   - Eixo: ${bestRightRefractionAxisString}\n`;
    } else {
      output += `- Nenhuma refração disponível.\n`;
    }

    if (rightEyeLogs.length > 0) {
      output += `- Logs:\n`;
      rightEyeLogs.forEach((log) => {
        output += `   - ${log.type || "N/A"}: ${log.details || "N/A"}\n`;
      });
    } else {
      output += `- Nenhum log disponível.\n`;
    }

    if (rightEyeSurgeries.length > 0) {
      output += `- Histórico de Cirurgias:\n`;
      rightEyeSurgeries.forEach((surgery) => {
        output += `   - Procedimento: ${surgery.procedure || "N/A"}\n`;
        output += `     Data: ${
          surgery.date ? formatDate(surgery.date) : "N/A"
        }\n`;
        output += `     Notas: ${surgery.notes || "N/A"}\n`;
      });
    } else {
      output += `- Nenhum histórico de cirurgias.\n`;
    }

    // Seção 4: Olho Esquerdo
    output += `\n**Olho Esquerdo (OE)**\n`;

    if (bestLeftRefraction) {
      output += `- Melhor Acuidade Visual: ${
        bestLeftRefraction.visualAcuity || "N/A"
      }\n`;
      output += `- Refração:\n`;
      output += `   - Esférico: ${bestLeftRefractionSphericalString}\n`;
      output += `   - Cilíndrico: ${bestLeftRefractionCylinderString}\n`;
      output += `   - Eixo: ${bestLeftRefractionAxisString}\n`;
    } else {
      output += `- Nenhuma refração disponível.\n`;
    }

    if (leftEyeLogs.length > 0) {
      output += `- Logs:\n`;
      leftEyeLogs.forEach((log) => {
        output += `   - ${log.type || "N/A"}: ${log.details || "N/A"}\n`;
      });
    } else {
      output += `- Nenhum log disponível.\n`;
    }

    if (leftEyeSurgeries.length > 0) {
      output += `- Histórico de Cirurgias:\n`;
      leftEyeSurgeries.forEach((surgery) => {
        output += `   - Procedimento: ${surgery.procedure || "N/A"}\n`;
        output += `     Data: ${
          surgery.date ? formatDate(surgery.date) : "N/A"
        }\n`;
        output += `     Notas: ${surgery.notes || "N/A"}\n`;
      });
    } else {
      output += `- Nenhum histórico de cirurgias.\n`;
    }

    // Seção 5: Histórico de Avaliações
    if (patientEvaluations.length > 0) {
      output += `\n**Histórico de Avaliações**\n`;
      patientEvaluations.forEach((ev) => {
        output += `- Data: ${formatDate(ev.createdAt)}\n`;
        output += `  Diagnóstico: ${ev.diagnosis || "N/A"}\n`;
      });
    } else {
      output += `\n**Histórico de Avaliações**\n- Nenhum histórico disponível.\n`;
    }

    return output;
  };

  // Gere o conteúdo para o botão de copiar
  const prompt = generateOutput();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Resumo da Avaliação</h1>
        <div className="flex gap-2">
          {/* Botão para reabrir a avaliação */}
          <ReopenEvaluationButton evaluation={evaluation} />
          {/* Botão para copiar o prompt */}
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
              ? calculateAge(patient.birthDate.toISOString()) + " anos"
              : "N/A"}
          </p>
          <p>
            <strong>Histórico de Avaliações:</strong>{" "}
            {patientEvaluations.length > 0
              ? `${patientEvaluations.length} avaliações concluídas`
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
            {evaluation.createdAt ? formatDate(evaluation.createdAt) : "N/A"}
          </p>
          <p>
            <strong>Colaborador:</strong> {collaborator.name || "N/A"}
          </p>
          <p>
            <strong>Ambulatório:</strong> {clinic?.name || "N/A"}{" "}
            {clinic?.collaborators &&
              clinic.collaborators.length > 0 &&
              `(${clinic?.collaborators
                .map((c) => c.collaborator.name)
                .join(", ")})`}
          </p>
          <p>
            <strong>Dados Clínicos:</strong>{" "}
            {evaluation.clinicalData?.trim() || "N/A"}
          </p>
          <p>
            <strong>Diagnóstico:</strong> {evaluation.diagnosis || "N/A"}
          </p>
          <p>
            <strong>Tratamento:</strong> {evaluation.treatment || "N/A"}
          </p>
          <p>
            <strong>Acompanhamento:</strong> {evaluation.followUp || "N/A"}
          </p>
          <p>
            <strong>Próxima Consulta:</strong>{" "}
            {evaluation.nextAppointment || "N/A"}
          </p>
        </CardContent>
      </Card>

      {/* Dados dos Olhos, Acuidade Visual, Refração e Históricos de Cirurgias */}
      <div className="flex flex-col gap-6 sm:flex-row">
        {/* Olho Direito */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Olho Direito (OD)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Acuidade Visual e Refração */}
            {bestRightRefraction ? (
              <div className="flex flex-col gap-1">
                <p>
                  <strong>Melhor Acuidade Visual:</strong>{" "}
                  {bestRightRefraction.visualAcuity || "N/A"}
                </p>
                <p>
                  <strong>Refração:</strong>{" "}
                  {`Esférico: ${bestRightRefractionSphericalString ?? "N/A"}, Cilíndrico: ${
                    bestRightRefractionCylinderString ?? "N/A"
                  }, Eixo: ${bestRightRefractionAxisString ?? "N/A"}`}
                </p>
              </div>
            ) : (
              <p>Nenhuma refração disponível.</p>
            )}

            <Separator />
            <h3 className="font-semibold">Logs do Olho Direito</h3>
            {rightEyeLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rightEyeLogs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>{log.type || "N/A"}</TableCell>
                      <TableCell>{log.details || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>Nenhum log disponível</p>
            )}

            <Separator />
            <h3 className="font-semibold">Histórico de Cirurgias</h3>
            {rightEyeSurgeries.length > 0 ? (
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
                        {surgery.date ? formatDate(surgery.date) : "N/A"}
                      </TableCell>
                      <TableCell>{surgery.notes || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>Nenhum histórico de cirurgias</p>
            )}
          </CardContent>
        </Card>

        {/* Olho Esquerdo */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Olho Esquerdo (OE)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Acuidade Visual e Refração */}
            {bestLeftRefraction ? (
              <div className="flex flex-col gap-1">
                <p>
                  <strong>Melhor Acuidade Visual:</strong>{" "}
                  {bestLeftRefraction.visualAcuity || "N/A"}
                </p>
                <p>
                  <strong>Refração:</strong>{" "}
                  {`Esférico: ${bestLeftRefractionCylinderString ?? "N/A"}, Cilíndrico: ${
                    bestLeftRefractionCylinderString ?? "N/A"
                  }, Eixo: ${bestLeftRefractionAxisString ?? "N/A"}`}
                </p>
              </div>
            ) : (
              <p>Nenhuma refração disponível.</p>
            )}

            <Separator />
            <h3 className="font-semibold">Logs do Olho Esquerdo</h3>
            {leftEyeLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leftEyeLogs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>{log.type || "N/A"}</TableCell>
                      <TableCell>{log.details || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>Nenhum log disponível</p>
            )}

            <Separator />
            <h3 className="font-semibold">Histórico de Cirurgias</h3>
            {leftEyeSurgeries.length > 0 ? (
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
                        {surgery.date ? formatDate(surgery.date) : "N/A"}
                      </TableCell>
                      <TableCell>{surgery.notes || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>Nenhum histórico de cirurgias</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Avaliações do Paciente */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Avaliações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {patientEvaluations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Diagnóstico</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientEvaluations.map((ev, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(ev.createdAt)}</TableCell>
                    <TableCell>{ev.diagnosis || "N/A"}</TableCell>
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
