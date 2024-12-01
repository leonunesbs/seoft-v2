import { PageHeading } from "~/components/atoms/page-heading";

export default function EvaluationPendingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>Avaliações Pendentes</PageHeading>
      {children}
    </div>
  );
}
