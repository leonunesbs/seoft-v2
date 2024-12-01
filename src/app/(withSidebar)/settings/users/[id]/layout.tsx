import { PageHeading } from "~/components/atoms/page-heading";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>Editar Usuário</PageHeading>
      <div className="px-2">{children}</div>
    </div>
  );
}
