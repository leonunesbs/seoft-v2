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

import Link from "next/link";
import { MdEdit } from "react-icons/md";
import { Button } from "~/components/ui/button";

type Clinic = {
  id: string;
  name: string;
  collaborators: string; // Lista de nomes como string
};

export function ClinicsTable({ data }: { data: Clinic[] }) {
  if (data.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500">
        Nenhumo ambulatório encontrado.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded border">
      <Table className="w-full">
        <TableCaption>
          Lista de ambulatórios cadastrados no sistema e seus colaboradores.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Colaboradores</TableHead>
            <TableHead className="whitespace-nowrap">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((clinic) => (
            <TableRow key={clinic.id}>
              <TableCell className="truncate">{clinic.name}</TableCell>
              <TableCell className="truncate">{clinic.collaborators}</TableCell>
              <TableCell className="flex justify-end gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        aria-label={`Editar ${clinic.name}`}
                        asChild
                      >
                        <Link href={`/settings/clinics/${clinic.id}`}>
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
