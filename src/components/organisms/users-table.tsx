import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { Button } from "~/components/ui/button";
import Link from "next/link";
import { MdEdit } from "react-icons/md";

type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isStaff: boolean;
};

export function UsersTable({ data }: { data: User[] }) {
  if (data.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500">
        Nenhum usuário encontrado.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded border">
      <Table className="w-full">
        <TableCaption>Lista de usuários cadastrados no sistema.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="whitespace-nowrap">Colaborador</TableHead>
            <TableHead className="whitespace-nowrap">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Avatar>
                  <AvatarImage
                    alt={user.name ?? user.email}
                    src={user.image ?? ""}
                  />
                  <AvatarFallback>N/A</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="truncate">{user.name ?? "N/A"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.isStaff ? "Sim" : "Não"}</TableCell>
              <TableCell className="flex justify-end gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        aria-label={`Editar ${user.name}`}
                        asChild
                      >
                        <Link href={`/settings/users/${user.id}`}>
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
