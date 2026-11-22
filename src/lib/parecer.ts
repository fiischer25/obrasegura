import { z } from "zod";

// Formato do parecer. É o mesmo JSON da especificação.
// Limites como "no máximo 8 itens" e "nota de 0 a 100" são aplicados em normalizarParecer(),
// porque a saída estruturada da API não aceita esse tipo de restrição.

const gravidade = z.enum(["alta", "media", "baixa"]);

export const ParecerSchema = z.object({
  resumo: z.string(),
  nivel_risco: z.enum(["baixo", "medio", "alto"]),
  nota: z.number(),
  total_informado: z.number().nullable(),
  referencia: z.object({
    faixa_min: z.number().nullable(),
    faixa_max: z.number().nullable(),
    base: z.string(),
  }),
  itens_faltantes: z.array(
    z.object({ item: z.string(), por_que_importa: z.string(), gravidade }),
  ),
  precos_atencao: z.array(
    z.object({ item: z.string(), valor_orcado: z.number().nullable(), observacao: z.string() }),
  ),
  pagamento: z.array(z.object({ ponto: z.string(), risco: z.string(), sugestao: z.string() })),
  contrato: z.array(z.string()),
  perguntas: z.array(z.string()),
  pontos_positivos: z.array(z.string()),
  proximo_passo: z.string(),
});

export type Parecer = z.infer<typeof ParecerSchema>;

const MAX_ITENS = 8;

export function normalizarParecer(p: Parecer): Parecer {
  const num = (n: number | null) => (typeof n === "number" && Number.isFinite(n) ? n : null);
  let faixaMin = num(p.referencia.faixa_min);
  let faixaMax = num(p.referencia.faixa_max);
  if (faixaMin !== null && faixaMax !== null && faixaMin > faixaMax) {
    [faixaMin, faixaMax] = [faixaMax, faixaMin];
  }
  return {
    ...p,
    nota: Math.max(0, Math.min(100, Math.round(p.nota))),
    total_informado: num(p.total_informado),
    referencia: { ...p.referencia, faixa_min: faixaMin, faixa_max: faixaMax },
    itens_faltantes: p.itens_faltantes.slice(0, MAX_ITENS),
    precos_atencao: p.precos_atencao
      .slice(0, MAX_ITENS)
      .map((x) => ({ ...x, valor_orcado: num(x.valor_orcado) })),
    pagamento: p.pagamento.slice(0, MAX_ITENS),
    contrato: p.contrato.slice(0, MAX_ITENS),
    perguntas: p.perguntas.slice(0, MAX_ITENS),
    pontos_positivos: p.pontos_positivos.slice(0, MAX_ITENS),
  };
}

export const ROTULO_RISCO = { alto: "Risco alto", medio: "Risco médio", baixo: "Risco baixo" } as const;

export function brl(n: number | null | undefined) {
  return typeof n === "number" && Number.isFinite(n)
    ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
    : "—";
}

// Texto simples do parecer, para o botão "Copiar para o WhatsApp".
export function parecerComoTexto(r: Parecer, link?: string) {
  const L: string[] = [
    `*PARECER DO ORÇAMENTO* — ${ROTULO_RISCO[r.nivel_risco]} · Nota ${r.nota}/100`,
    "",
    r.resumo,
  ];
  const add = <T,>(titulo: string, lista: T[], f: (x: T) => string) => {
    if (lista.length) {
      L.push("", `*${titulo}*`);
      lista.forEach((x) => L.push("• " + f(x)));
    }
  };
  if (r.total_informado !== null && r.referencia.faixa_min !== null && r.referencia.faixa_max !== null) {
    L.push(
      "",
      `Total orçado: ${brl(r.total_informado)} · Referência: ${brl(r.referencia.faixa_min)} a ${brl(r.referencia.faixa_max)}`,
    );
  }
  add("O QUE ESTÁ FALTANDO", r.itens_faltantes, (x) => `${x.item} — ${x.por_que_importa}`);
  add("PREÇOS QUE PEDEM ATENÇÃO", r.precos_atencao, (x) =>
    `${x.item}${x.valor_orcado !== null ? " (" + brl(x.valor_orcado) + ")" : ""} — ${x.observacao}`,
  );
  add("CONDIÇÕES DE PAGAMENTO", r.pagamento, (x) => `${x.ponto}: ${x.risco} Sugestão: ${x.sugestao}`);
  add("O QUE PRECISA ESTAR NO CONTRATO", r.contrato, (x) => x);
  add("PERGUNTE AO EMPREITEIRO", r.perguntas, (x) => x);
  add("PONTOS POSITIVOS", r.pontos_positivos, (x) => x);
  if (r.proximo_passo) L.push("", `*Próximo passo:* ${r.proximo_passo}`);
  if (link) L.push("", `Parecer completo: ${link}`);
  L.push("", "Análise automática e orientativa. Não substitui vistoria nem parecer de arquiteto ou engenheiro habilitado.");
  return L.join("\n");
}

export const EXEMPLO: Parecer = {
  resumo:
    "O total está cerca de 14% abaixo da referência para uma casa de padrão médio em SP, e isso não é boa notícia: faltam etapas inteiras (impermeabilização, louças e metais, forro, preparo do terreno), não há quantidades e o material pode virar custo seu no meio da obra. A tendência é o valor final passar bastante dos R$ 312 mil.",
  nivel_risco: "alto",
  nota: 42,
  total_informado: 312000,
  referencia: {
    faixa_min: 330000,
    faixa_max: 390000,
    base: "CUB R1-N São Paulo ≈ R$ 2.590/m² × 140 m², sem terreno, projetos e taxas",
  },
  itens_faltantes: [
    { item: "Impermeabilização (baldrame, laje, áreas molhadas)", por_que_importa: "É a causa mais comum de infiltração e mofo. Corrigir depois custa muitas vezes mais.", gravidade: "alta" },
    { item: "Louças, metais e bancadas", por_que_importa: "Vaso, cubas, torneiras e chuveiros não aparecem. Costumam somar dezenas de milhares de reais.", gravidade: "alta" },
    { item: "Limpeza do terreno, locação e canteiro", por_que_importa: "Inclui ligações provisórias de água e luz e o barracão. Alguém vai cobrar por isso.", gravidade: "media" },
    { item: "Forro ou gesso", por_que_importa: "Não está claro se a laje fica aparente ou recebe forro.", gravidade: "media" },
    { item: "Caçambas e retirada de entulho", por_que_importa: "Custo recorrente durante toda a obra.", gravidade: "media" },
    { item: "Muros, calçada e área externa", por_que_importa: "Necessários para habite-se e uso da casa.", gravidade: "baixa" },
  ],
  precos_atencao: [
    { item: "Fundação (estaca + baldrame)", valor_orcado: 28000, observacao: "Pode estar baixo sem sondagem do solo. Pergunte quantas estacas, qual profundidade e se existe projeto estrutural." },
    { item: "Itens sem quantidade", valor_orcado: null, observacao: "Nenhum item informa m², m³ ou unidades. Sem isso você não consegue comparar com outro orçamento nem medir o andamento." },
  ],
  pagamento: [
    { ponto: "30% de entrada na assinatura", risco: "Você adianta quase R$ 94 mil antes de qualquer serviço feito.", sugestao: "Negocie entrada de até 10% e o restante por etapa concluída e conferida." },
    { ponto: "Parcelas semanais \"conforme andamento\"", risco: "Sem critério de medição, você paga por tempo e não por serviço entregue.", sugestao: "Amarre cada pagamento a uma etapa do cronograma, com fotos e conferência." },
    { ponto: "\"Material por conta do contratante quando faltar\"", risco: "Contradiz o orçamento de mão de obra + material e abre espaço para cobranças extras.", sugestao: "Exija a lista de materiais incluídos, com marca e quantidade." },
  ],
  contrato: [
    "Multa por atraso no prazo de 8 meses",
    "Garantia dos serviços após a entrega",
    "ART ou RRT de um responsável técnico",
    "Regra para aditivos: nada é pago fora do contrato sem aprovação por escrito",
    "Retenção de 5% a 10% até a entrega final",
  ],
  perguntas: [
    "Quais itens deste orçamento estão com material incluído, e quais não?",
    "Quantas estacas e qual profundidade? Foi feita sondagem do solo?",
    "Onde entra a impermeabilização e qual produto será usado?",
    "Louças, metais, forro e caçambas estão em outro orçamento?",
    "Quem é o responsável técnico pela obra e vai emitir ART ou RRT?",
    "Você aceita pagamento por etapa concluída, com entrada menor?",
  ],
  pontos_positivos: ["Etapas principais estão separadas, o que facilita comparar", "Prazo definido por escrito"],
  proximo_passo:
    "Peça ao empreiteiro uma versão com quantidades, lista de materiais incluídos e os itens que faltam. Só compare com outros orçamentos depois disso.",
};
