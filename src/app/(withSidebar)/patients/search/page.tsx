import { Button } from "~/components/ui/button";
import Form from "next/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Search } from "lucide-react";
import { SearchTable } from "~/components/organisms/search-table";
import { db } from "~/server/db";
import { redirect } from "next/navigation";
import { z } from "zod";

async function searchPatients(queryString: string | string[] | undefined) {
  return await db.patient.findMany({
    where: {
      OR: [
        { refId: { contains: queryString as string, mode: "insensitive" } },
        { name: { contains: queryString as string, mode: "insensitive" } },
      ],
    },
    orderBy: { name: "asc" },
  });
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const searchSchema = z.object({
  search: z
    .string()
    .min(1, "A busca deve ter pelo menos 1 caracter.")
    .max(100, "A busca deve ter no máximo 100 caracteres."),
});
export default async function SearchPatient({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q: queryString } = await searchParams;

  await searchPatients(queryString);

  // Realiza a busca no banco de dados se o parâmetro de busca estiver presente
  const patients = queryString ? await searchPatients(queryString) : [];

  return (
    <div className="flex flex-col gap-4">
      <Form
        action={async (formData) => {
          "use server";
          const search = formData.get("search") as string;
          const { search: parsedSearch } = searchSchema.parse({ search });
          redirect(`/patients/search?q=${parsedSearch}`);
        }}
      >
        <div className="flex w-full gap-2">
          <div className="relative flex w-full items-center">
            <Label htmlFor="search" className="sr-only">
              Buscar paciente
            </Label>
            <Input
              id="search"
              name="search"
              placeholder="Buscar paciente (nº pront./nome)"
              className="w-full pl-8"
              defaultValue={queryString}
            />
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
          </div>
          <Button type="submit">Pesquisar</Button>
        </div>
      </Form>
      {queryString && patients.length > 0 && (
        <SearchTable
          data={patients.map((patient) => ({
            ...patient,
            birthDate: patient.birthDate.toISOString(),
          }))}
        />
      )}
      {queryString && patients.length === 0 && (
        <p className="text-center text-sm text-gray-500">
          Nenhum paciente encontrado.
        </p>
      )}
    </div>
  );
}
