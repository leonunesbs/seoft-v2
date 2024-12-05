import { MdEdit, MdOutlineHistory } from "react-icons/md";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { AddEvaluationButton } from "../atoms/add-evaluation-button";

type Patient = {
  id: string;
  refId: string;
  name: string;
  birthDate: string;
};

export function SearchTable({ data }: { data: Patient[] }) {
  if (data.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500">
        Nenhum paciente encontrado.
      </p>
    );
  }

  return (
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
          {data.map((patient) => (
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
                      <Link href={`/patients/${patient.id}/history`} passHref>
                        <Button
                          variant="outline"
                          aria-label={`Histórico de ${patient.name}`}
                        >
                          <MdOutlineHistory size={18} />
                        </Button>
                      </Link>
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
                        <Link href={`/patients/${patient.id}`}>
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
        </TableBody>
      </Table>
    </div>
  );
}
