"use client";

import { type ReactNode, useState } from "react";
import { MdOutlineLink } from "react-icons/md";

import { Button } from "../ui/button";

type AccessFileButtonProps = {
  fileName: string; // Nome do arquivo a ser acessado
  children: ReactNode;
};

export function AccessFileButton({
  fileName,
  children,
}: AccessFileButtonProps) {
  const [loading, setLoading] = useState(false);
  const handleGenerateAndOpenUrl = async () => {
    if (!fileName || fileName.length < 20) {
      console.error("O nome do arquivo não foi fornecido.");
      return;
    }

    setLoading(true);

    try {
      // Faz a requisição para obter a URL pré-assinada
      const response = await fetch(
        `/api/s3?action=download&fileName=${encodeURIComponent(fileName)}`,
      );

      if (!response.ok) {
        console.error(`Erro ao obter URL pré-assinada: ${response.statusText}`);
        return;
      }

      const { downloadUrl } = (await response.json()) as {
        downloadUrl: string;
      };

      if (!downloadUrl) {
        console.error("URL de download não foi retornada pela API.");
        return;
      }

      // Abre o documento em uma nova aba
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Erro ao gerar ou acessar o arquivo:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      value={"outline"}
      onClick={handleGenerateAndOpenUrl}
      disabled={loading}
      className="w-18"
    >
      <MdOutlineLink size={18} />
      {children}
    </Button>
  );
}
