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

// Prisma Staff Type

type StaffWithClinics = Prisma.CollaboratorGetPayload<{
  include: {
    clinics: { include: { clinic: { select: { id: true; name: true } } } };
  };
}>;

// Propriedade esperada pela tabela
type StaffsTableProps = {
  data: StaffWithClinics[];
};

export function StaffsTable({ data }: StaffsTableProps) {
  if (data.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500">
        Nenhum colaborador encontrado.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded border">
      <Table className="w-full">
        <TableCaption>
          Lista de colaboradores cadastrados no sistema e seus ambulatórios
          associadas.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CRM</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Clínicas</TableHead>
            <TableHead className="whitespace-nowrap">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((staff) => (
            <TableRow key={staff.id}>
              <TableCell className="truncate">{staff.name}</TableCell>
              <TableCell>{staff.crm}</TableCell>
              <TableCell>{staff.role}</TableCell>
              <TableCell>
                {staff.clinics.length > 0
                  ? staff.clinics
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
                        aria-label={`Editar ${staff.name}`}
                        asChild
                      >
                        <Link href={`/settings/staffs/${staff.id}`}>
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
