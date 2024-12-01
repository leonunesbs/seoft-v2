import { Button } from "~/components/ui/button";
import Form from "next/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Search } from "lucide-react";
import { SearchTable } from "~/components/organisms/search-table";
import { api } from "~/trpc/server";
import { redirect } from "next/navigation";
import { z } from "zod";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const searchSchema = z.object({
  search: z.string(),
});
export default async function SearchPatient({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q: queryString } = await searchParams;
  const patients = await api.patient.search(queryString as string);

  return (
    <div className="flex flex-col gap-4">
      <Form
        action={async (formData) => {
          "use server";
          const search = formData.get("search") as string;
          const { search: parsedSearch } = searchSchema.parse({ search });
          if (!parsedSearch) redirect("/patients/search");
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
            id: patient.id,
            birthDate: patient.birthDate,
            name: patient.name,
            refId: patient.refId,
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
