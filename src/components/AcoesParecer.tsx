"use client";

import { useState } from "react";
import { parecerComoTexto, type Parecer } from "@/lib/parecer";

export function AcoesParecer({ r }: { r: Parecer }) {
  const [msg, setMsg] = useState("Copiar para o WhatsApp");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(parecerComoTexto(r, window.location.href));
      setMsg("Copiado! Agora cole no WhatsApp");
    } catch {
      setMsg("Não foi possível copiar");
    }
    setTimeout(() => setMsg("Copiar para o WhatsApp"), 3000);
  }

  return (
    <div className="acts">
      <button type="button" className="btn ghost" onClick={copiar} aria-live="polite">
        {msg}
      </button>
      {/* Fase 2: botão "Baixar PDF" */}
    </div>
  );
}
