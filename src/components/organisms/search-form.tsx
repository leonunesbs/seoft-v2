import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "~/components/ui/sidebar";

import { Search } from "lucide-react";
import Form from "next/form";
import { Label } from "~/components/ui/label";

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  return (
    <Form action={"/patient/search"} {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Buscar paciente
          </Label>
          <SidebarInput
            id="q"
            name="q"
            placeholder="Buscar paciente (nº pront./nome)..."
            className="pl-8"
          />
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
        </SidebarGroupContent>
      </SidebarGroup>
    </Form>
  );
}
