import { PageHeading } from "~/components/atoms/page-heading";

export default function EvaluationPendingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>Avaliações Pendentes</PageHeading>
      <div className="px-2">{children}</div>
    </div>
  );
}
