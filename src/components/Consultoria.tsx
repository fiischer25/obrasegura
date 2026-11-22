import { CONSULTORIA, linkConsultoria } from "@/config/site";

// Convite para a consultoria com arquiteto, no fim do parecer.
export function Consultoria({ linkParecer }: { linkParecer: string }) {
  return (
    <aside className="consultoria" aria-labelledby="consultoria-titulo">
      <h3 id="consultoria-titulo">{CONSULTORIA.titulo}</h3>
      <p>{CONSULTORIA.texto}</p>
      {CONSULTORIA.beneficio && <p className="beneficio">{CONSULTORIA.beneficio}</p>}
      <a className="btn go" href={linkConsultoria(linkParecer)} target="_blank" rel="noopener noreferrer">
        {CONSULTORIA.whatsapp ? CONSULTORIA.botao : "Pedir consultoria por e‑mail"}
      </a>
    </aside>
  );
}
