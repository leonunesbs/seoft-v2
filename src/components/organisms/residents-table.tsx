import { type Prisma } from "@prisma/client";
import Link from "next/link";
import { MdEdit } from "react-icons/md";

import { Button } from "~/components/ui/button";
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
} from "~/components/ui/tooltip";

type ResidentWithClinics = Prisma.CollaboratorGetPayload<{
  include: {
    clinics: { include: { clinic: { select: { id: true; name: true } } } };
  };
}>;

// Propriedade esperada pela tabela
type ResidentsTableProps = {
  data: ResidentWithClinics[];
};

export function ResidentsTable({ data }: ResidentsTableProps) {
  if (data.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500">
        Nenhum residente encontrado.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded border">
      <Table className="w-full">
        <TableCaption>
          Lista de residentes cadastrados no sistema e seus ambulatórios
          associados.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CRM</TableHead>
            <TableHead>Nível</TableHead>
            <TableHead>Clínicas</TableHead>
            <TableHead className="whitespace-nowrap">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((resident) => (
            <TableRow key={resident.id}>
              <TableCell className="truncate">{resident.name}</TableCell>
              <TableCell>{resident.crm}</TableCell>
              <TableCell>{resident.role}</TableCell>
              <TableCell>
                {resident.clinics.length > 0
                  ? resident.clinics
                      .map((clinicAssoc) => clinicAssoc.clinic.name)
                      .join(", ")
                  : "Nenhumo ambulatório associada"}
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        aria-label={`Editar ${resident.name}`}
                        asChild
                      >
                        <Link href={`/settings/residents/${resident.id}`}>
                          <MdEdit size={18} />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar</p>
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
