// Referências de custo usadas pela IA.
// O CUB muda todo mês: atualize os valores e a data abaixo de tempos em tempos.
// Fonte: Sinduscon de cada estado (ex.: sindusconsp.com.br para SP).

export const REFERENCIAS = {
  atualizadoEm: "2026",
  texto: `REFERÊNCIAS DE CUSTO (só ordem de grandeza, 2026)
- CUB residencial padrão normal (R1-N) em São Paulo ≈ R$ 2.590/m².
- Faixas nacionais aproximadas: simples R$ 1.800–2.100/m²; médio R$ 2.000–2.800/m² (varia por estado, pode passar de R$ 3.000 no Sul); alto acima de R$ 3.000/m².
- O CUB não inclui terreno, projetos, taxas, fundações especiais, muros, área externa nem paisagismo.
- Se o orçamento for só de mão de obra, a referência por m² não se aplica: deixe faixa_min e faixa_max nulos e comente nos preços.
- Para reforma, não use CUB; avalie item a item e deixe a faixa nula se não houver base.`,
};
