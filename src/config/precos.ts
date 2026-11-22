// Preços do site. Para mudar um preço, altere só os valores em centavos abaixo.
// Ex.: R$ 97,00 = 9700

export const PRECOS = {
  avulsa: {
    id: "avulsa",
    nome: "Análise avulsa",
    descricao: "1 orçamento revisado",
    centavos: 9700,
    creditos: 1,
  },
  pacote3: {
    id: "pacote3",
    nome: "Pacote com 3 análises",
    descricao: "Para comparar empreiteiros. Você recebe um código com 3 créditos.",
    centavos: 19700,
    creditos: 3,
  },
} as const;

export type PlanoPago = keyof typeof PRECOS;

export function reais(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: centavos % 100 === 0 ? 0 : 2,
  });
}
