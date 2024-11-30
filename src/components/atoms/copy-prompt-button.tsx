// components/atoms/CopyPromptButton.tsx

"use client";

import { MdCheck, MdOutlineContentCopy } from "react-icons/md";

import { useState } from "react";
import { Button } from "~/components/ui/button";

interface CopyPromptButtonProps {
  prompt: string;
}

export function CopyPromptButton({ prompt }: CopyPromptButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reseta após 2 segundos
    } catch (err) {
      console.error("Falha ao copiar para a área de transferência", err);
    }
  };

  return (
    <Button onClick={handleCopy}>
      {copied ? (
        <>
          <MdCheck className="" />
          <span className="hidden sm:block">Copiado!</span>
        </>
      ) : (
        <>
          <MdOutlineContentCopy className="" />
          <span className="hidden sm:block">Copiar</span>
        </>
      )}
    </Button>
  );
}
