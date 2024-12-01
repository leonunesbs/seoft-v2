import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex animate-pulse items-center gap-2">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-lg font-semibold">Carregando...</p>
    </div>
  );
}
