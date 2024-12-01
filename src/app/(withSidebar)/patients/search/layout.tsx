import { PageHeading } from "~/components/atoms/page-heading";

export default function SearchPatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>Buscar Paciente</PageHeading>
      <div className="pl-2">{children}</div>
    </div>
  );
}
