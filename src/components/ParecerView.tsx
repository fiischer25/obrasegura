import type { ReactNode } from "react";
import { brl, ROTULO_RISCO, type Parecer } from "@/lib/parecer";

const TITULO = {
  baixo: "Orçamento bem montado, com ajustes",
  medio: "Dá para fechar, depois de ajustar",
  alto: "Não assine ainda",
};
const GRAV = { alta: "Grave", media: "Atenção", baixa: "Leve" };

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="sec">
      <h3>{titulo}</h3>
      {children}
    </div>
  );
}

function Comparacao({ r, areaM2 }: { r: Parecer; areaM2?: number }) {
  const t = r.total_informado;
  const a = r.referencia.faixa_min;
  const b = r.referencia.faixa_max;
  if (t === null || a === null || b === null || b < a || a <= 0) return null;
  const lo = Math.min(t, a) * 0.8;
  const hi = Math.max(t, b) * 1.1;
  const p = (v: number) => ((v - lo) / (hi - lo)) * 100;
  const porM2 = areaM2 ? ` · ${brl(t / areaM2)}/m²` : "";
  return (
    <div className="cmp">
      <h3>Total orçado x referência</h3>
      <div className="track" role="img" aria-label={`Orçado ${brl(t)}; faixa de referência de ${brl(a)} a ${brl(b)}`}>
        <div className="ref" style={{ left: `${p(a)}%`, width: `${p(b) - p(a)}%` }} />
        <div className="mk" style={{ left: `${p(t)}%` }}>
          <i>{brl(t)}</i>
        </div>
      </div>
      <div className="legend">
        <span>
          Faixa de referência: <b>{brl(a)} a {brl(b)}</b>
        </span>
        <span>
          Orçado: <b>{brl(t)}{porM2}</b>
        </span>
      </div>
      <p className="hint">{r.referencia.base}</p>
    </div>
  );
}

export function ParecerView({
  r,
  exemplo = false,
  areaM2,
  acoes,
}: {
  r: Parecer;
  exemplo?: boolean;
  areaM2?: number;
  acoes?: ReactNode;
}) {
  return (
    <article className="card sheet">
      <div className={exemplo ? "tag exemplo" : "tag"}>
        {exemplo ? "Exemplo de parecer · orçamento fictício" : "Parecer do seu orçamento"}
      </div>
      <div className="top">
        <div>
          <h2>{TITULO[r.nivel_risco]}</h2>
          <div className="score">
            <b>{r.nota}</b>
            <span>/100 de clareza e completude</span>
          </div>
        </div>
        <div className={`stamp r-${r.nivel_risco}`}>{ROTULO_RISCO[r.nivel_risco]}</div>
      </div>
      <p className="resumo">{r.resumo}</p>
      <Comparacao r={r} areaM2={areaM2} />

      {r.itens_faltantes.length > 0 && (
        <Secao titulo="O que está faltando">
          {r.itens_faltantes.map((x, i) => (
            <div className="it" key={i}>
              <span className={`pill g-${x.gravidade}`}>{GRAV[x.gravidade]}</span>
              <div>
                <strong>{x.item}</strong>
                <p>{x.por_que_importa}</p>
              </div>
            </div>
          ))}
        </Secao>
      )}
      {r.precos_atencao.length > 0 && (
        <Secao titulo="Preços que pedem atenção">
          {r.precos_atencao.map((x, i) => (
            <div className="it" key={i}>
              <span className="val">{brl(x.valor_orcado)}</span>
              <div>
                <strong>{x.item}</strong>
                <p>{x.observacao}</p>
              </div>
            </div>
          ))}
        </Secao>
      )}
      {r.pagamento.length > 0 && (
        <Secao titulo="Condições de pagamento">
          {r.pagamento.map((x, i) => (
            <div className="it" key={i}>
              <span className="pill g-alta">Risco</span>
              <div>
                <strong>{x.ponto}</strong>
                <p>
                  {x.risco} <b>Sugestão:</b> {x.sugestao}
                </p>
              </div>
            </div>
          ))}
        </Secao>
      )}
      {r.contrato.length > 0 && (
        <Secao titulo="O que precisa estar no contrato">
          <ul className="ok">{r.contrato.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </Secao>
      )}
      {r.perguntas.length > 0 && (
        <Secao titulo="Pergunte ao empreiteiro">
          <ol className="q">{r.perguntas.map((x, i) => <li key={i}>{x}</li>)}</ol>
        </Secao>
      )}
      {r.pontos_positivos.length > 0 && (
        <Secao titulo="Pontos positivos">
          <ul className="ok">{r.pontos_positivos.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </Secao>
      )}
      {r.proximo_passo && (
        <div className="next">
          <strong>Próximo passo:</strong> {r.proximo_passo}
        </div>
      )}
      {acoes}
      <p className="fine">
        Análise automática e orientativa, feita a partir do orçamento enviado. Não substitui vistoria nem parecer de
        arquiteto ou engenheiro habilitado. Referências de custo são aproximadas: confira o CUB do Sinduscon do seu
        estado.
      </p>
    </article>
  );
}
