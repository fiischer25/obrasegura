import { PaginaSimples } from "@/components/Moldura";

export const metadata = { title: "Política de privacidade · Obra Segura" };

// Texto completo entra na Fase 4 (rascunho para revisão de um advogado).
export default function Privacidade() {
  return (
    <PaginaSimples cta>
      <h1>Política de privacidade</h1>
      <p className="rascunho">Página em preparação.</p>
      <p>
        Resumo: usamos seus dados só para fazer a análise e entregar o parecer. O orçamento é lido por uma
        inteligência artificial da Anthropic. Arquivos de pedidos não pagos são apagados em 24 horas; arquivos e
        pareceres de pedidos pagos, em 90 dias.
      </p>
    </PaginaSimples>
  );
}
