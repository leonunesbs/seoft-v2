"use client";

import { useEffect, useState } from "react";

interface ElapsedTimeProps {
  startTime: string; // Data/hora inicial em formato ISO 8601
}

export function ElapsedTime({ startTime }: ElapsedTimeProps) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const calculateElapsedTime = () => {
      const startDate = new Date(startTime);
      const now = new Date();
      const diffMs = now.getTime() - startDate.getTime();

      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        return `${diffDays} dia(s) atrás`;
      } else if (diffHours > 0) {
        return `${diffHours} hora(s) atrás`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes} minuto(s) atrás`;
      }
      return "há menos de 1 minuto";
    };

    setElapsed(calculateElapsedTime());
    const interval = setInterval(() => {
      setElapsed(calculateElapsedTime());
    }, 60000); // Atualiza a cada 1 minuto

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar
  }, [startTime]);

  return <span>{elapsed}</span>;
}
