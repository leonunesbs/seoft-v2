import { PageHeading } from "~/components/atoms/page-heading";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>Detalhes do Paciente</PageHeading>
      <div className="px-2">{children}</div>
    </div>
  );
}
