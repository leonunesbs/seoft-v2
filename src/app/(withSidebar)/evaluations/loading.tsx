import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex animate-pulse items-center gap-2 px-4">
      <Loader2 className="h-16 w-16 animate-spin" />
      <p className="text-lg font-semibold">Carregando...</p>
    </div>
  );
}
