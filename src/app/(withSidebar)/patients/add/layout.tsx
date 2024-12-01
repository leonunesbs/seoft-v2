import { PageHeading } from "~/components/atoms/page-heading";

export default function AddPatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>Adicionar Paciente</PageHeading>
      <div className="px-2">{children}</div>
    </div>
  );
}
