import { MdEdit, MdOutlineHistory } from "react-icons/md";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

import { AddEvaluationButton } from "~/components/atoms/add-evaluation-button";
import { Button } from "~/components/ui/button";
import { CollaboratorSwitcher } from "~/components/organisms/collaborator-switcher";
import Link from "next/link";
import { cookies } from "next/headers";
import { db } from "~/server/db";

export default async function EvaluationPending() {
  const cookieStore = await cookies();
  const collaboratorId =
    cookieStore.get("selected-collaborator")?.value ?? null;

  const collaborators = await db.collaborator.findMany({
    where: {
      role: {
        in: ["R1", "R2", "R3", "F1", "F2", "F3", "STAFF"],
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  if (!collaboratorId) {
    return <CollaboratorSwitcher collaborators={collaborators} />;
  }

  const collaborator = await db.collaborator.findUnique({
    where: {
      id: collaboratorId,
    },
    select: {
      name: true,
    },
  });

  const evaluations = await db.evaluation.findMany({
    where: {
      collaboratorId,
      done: false,
    },
    include: {
      collaborator: true,
      patient: true,
    },
  });

  return (
    <>
      <span className="flex gap-1">
        Colaborador: <h2>{collaborator?.name}</h2>
      </span>
      <div className="overflow-x-auto rounded border">
        <Table className="w-full">
          <TableCaption>Resultados da busca de pacientes.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px] whitespace-nowrap">
                Nº Prontuário
              </TableHead>
              <TableHead className="w-full">Nome</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead className="whitespace-nowrap">
                Data de nascimento
              </TableHead>
              <TableHead className="whitespace-nowrap">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map(({ patient }) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.refId}</TableCell>
                <TableCell className="truncate">{patient.name}</TableCell>
                <TableCell>
                  {new Date().getFullYear() -
                    new Date(patient.birthDate).getFullYear()}
                </TableCell>
                <TableCell>
                  {new Date(patient.birthDate).toLocaleDateString("pt-BR", {
                    timeZone: "UTC",
                  })}
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AddEvaluationButton
                          patientId={patient.id}
                          patientName={patient.name}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Nova avaliação</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          aria-label={`Histórico de ${patient.name}`}
                        >
                          <MdOutlineHistory size={18} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Histórico</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          aria-label={`Editar ${patient.name}`}
                          asChild
                        >
                          <Link href={`/patient/${patient.refId}`}>
                            <MdEdit size={18} />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar paciente</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
            {evaluations.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Nenhuma avaliação pendente.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
