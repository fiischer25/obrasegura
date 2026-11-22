import { PaginaSimples } from "@/components/Moldura";

export const metadata = { title: "Termos de uso · Obra Segura" };

// Texto completo entra na Fase 4 (rascunho para revisão de um advogado).
export default function Termos() {
  return (
    <PaginaSimples cta>
      <h1>Termos de uso</h1>
      <p className="rascunho">Página em preparação.</p>
      <p>
        Resumo: a análise do Obra Segura é automática e orientativa. Ela não substitui vistoria nem parecer de
        arquiteto ou engenheiro habilitado. Você pode desistir da compra em até 7 dias, pelo direito de arrependimento
        do Código de Defesa do Consumidor.
      </p>
    </PaginaSimples>
  );
}
