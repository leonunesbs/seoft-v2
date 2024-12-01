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

    // Abre a aba imediatamente para evitar bloqueio de pop-ups
    const newTab = window.open("", "_blank");

    if (!newTab) {
      console.error(
        "Não foi possível abrir uma nova aba. Pop-ups podem estar bloqueados.",
      );
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
        newTab.close(); // Fecha a aba caso haja erro
        return;
      }

      const { downloadUrl } = (await response.json()) as {
        downloadUrl: string;
      };

      if (!downloadUrl) {
        console.error("URL de download não foi retornada pela API.");
        newTab.close(); // Fecha a aba caso não tenha URL
        return;
      }

      // Redireciona a aba para o URL obtido
      newTab.location.href = downloadUrl;
    } catch (error) {
      console.error("Erro ao gerar ou acessar o arquivo:", error);
      newTab.close(); // Fecha a aba caso haja erro
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
