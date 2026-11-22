import Link from "next/link";
import { Rodape, Topo } from "@/components/Moldura";
import { ParecerView } from "@/components/ParecerView";
import { EXEMPLO } from "@/lib/parecer";
import { PRECOS, reais } from "@/config/precos";
import { SITE } from "@/config/site";

const RECEBE = [
  "Nível de risco (baixo, médio ou alto) e uma nota de 0 a 100 de clareza e completude do orçamento",
  "O total orçado comparado com uma faixa de referência de custo (CUB), quando fizer sentido",
  "Os itens que estão faltando, do mais grave ao mais leve",
  "Os preços que pedem atenção, com o motivo",
  "Os riscos nas condições de pagamento, com sugestão de como negociar",
  "O que precisa constar no contrato",
  "Perguntas prontas para fazer ao empreiteiro",
  "Os pontos positivos do orçamento e o próximo passo",
];

const FAQ = [
  {
    p: "Substitui um arquiteto ou engenheiro?",
    r: "Não. A análise é automática e orientativa: ela aponta o que falta, o que está estranho e o que perguntar, mas não substitui vistoria na obra nem parecer de arquiteto ou engenheiro habilitado. Quando o parecer encontra um risco técnico, ele recomenda procurar um profissional.",
  },
  {
    p: "Meus dados ficam seguros?",
    r: "Os arquivos ficam num armazenamento privado e o seu parecer só abre por um link com um código longo e único. O orçamento é lido por uma inteligência artificial da Anthropic, usada só para fazer a análise. Arquivos de pedidos não pagos são apagados em 24 horas; os de pedidos pagos, junto com o parecer, em 90 dias. Os detalhes estão na política de privacidade.",
  },
  {
    p: "Quanto tempo demora?",
    r: "Normalmente poucos minutos depois que o pagamento é confirmado. Pix e cartão costumam confirmar na hora. Se acontecer algum problema na análise, o parecer chega por e-mail em até 24 horas.",
  },
  {
    p: "E se o orçamento estiver em foto?",
    r: "Pode mandar. Aceitamos um PDF, até 6 fotos (uma por página) ou o texto colado. Tire as fotos com boa luz, de frente para a folha e sem cortar as bordas, para que todos os valores fiquem legíveis.",
  },
  {
    p: "Posso pedir reembolso?",
    r: `Sim. Você pode desistir em até 7 dias após a compra, pelo direito de arrependimento do Código de Defesa do Consumidor, escrevendo para ${SITE.emailContato}.`,
  },
];

export default function Home() {
  return (
    <>
      <header className="hero">
        <Topo />
        <div className="wrap hero-in">
          <h1>Antes de assinar, revise o orçamento do empreiteiro</h1>
          <p className="sub">
            Envie o PDF, a foto ou o texto do orçamento da sua obra. Em poucos minutos você descobre o que está
            faltando, quais preços estão estranhos e quais riscos existem nas condições de pagamento, com as perguntas
            certas para fazer antes de fechar.
          </p>
          <div className="cta">
            <Link href="/revisar" className="btn go big">
              Revisar meu orçamento
            </Link>
            <span className="preco-tag">
              <b>{reais(PRECOS.avulsa.centavos)}</b> por análise
            </span>
          </div>
        </div>
      </header>

      <main>
        <section className="band" aria-labelledby="exemplo">
          <div className="wrap">
            <h2 id="exemplo" className="sec-title">
              Veja um exemplo de parecer
            </h2>
            <p className="sec-lead">
              Este é um exemplo com um orçamento fictício: uma casa de 140 m² em São Paulo, orçada em R$ 312 mil.
            </p>
            <ParecerView r={EXEMPLO} exemplo areaM2={140} />
          </div>
        </section>

        <section className="band alt" aria-labelledby="como">
          <div className="wrap">
            <h2 id="como" className="sec-title">
              Como funciona
            </h2>
            <ol className="passos" style={{ padding: 0, marginTop: 24 }}>
              <li className="card">
                <div className="num">1</div>
                <h3>Envie</h3>
                <p>Conte o básico da obra e mande o orçamento: PDF, fotos ou texto colado. Leva dois minutos no celular.</p>
              </li>
              <li className="card">
                <div className="num">2</div>
                <h3>Pague</h3>
                <p>Por Pix ou cartão, num ambiente seguro do Mercado Pago.</p>
              </li>
              <li className="card">
                <div className="num">3</div>
                <h3>Receba</h3>
                <p>Em poucos minutos o parecer aparece na tela e chega no seu e-mail, em PDF, pronto para mandar no WhatsApp.</p>
              </li>
            </ol>
          </div>
        </section>

        <section className="band" aria-labelledby="recebe">
          <div className="wrap grid2">
            <div>
              <h2 id="recebe" className="sec-title">
                O que você recebe
              </h2>
              <p className="sec-lead">Um parecer escrito em português simples, sem jargão, pensado para quem não é da área.</p>
            </div>
            <ul className="lista-check">
              {RECEBE.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="band alt" aria-labelledby="quem">
          <div className="wrap">
            <h2 id="quem" className="sec-title">
              Para quem é
            </h2>
            <p className="sec-lead">Para quem vai contratar um empreiteiro e não tem um arquiteto acompanhando a obra.</p>
            <div className="grid2 publico">
              <div className="card">
                <h3>Construção nova</h3>
                <p>Confira se o orçamento cobre todas as etapas, da fundação à limpeza final, e se o total faz sentido para o tamanho da casa.</p>
              </div>
              <div className="card">
                <h3>Reforma</h3>
                <p>Descubra o que ficou de fora, como demolição, entulho, impermeabilização e acabamentos, antes que vire custo extra.</p>
              </div>
              <div className="card">
                <h3>Ampliação</h3>
                <p>Veja se a ligação com a parte existente, o telhado e as instalações foram consideradas.</p>
              </div>
              <div className="card">
                <h3>Quem está comparando orçamentos</h3>
                <p>Revise cada proposta com o mesmo critério e saiba o que perguntar a cada empreiteiro. O pacote com 3 análises sai mais em conta.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="band" aria-labelledby="precos">
          <div className="wrap">
            <h2 id="precos" className="sec-title">
              Preços
            </h2>
            <p className="sec-lead">Pagamento único, sem assinatura. Pix ou cartão.</p>
            <div className="precos">
              <div className="card plano">
                <h3>{PRECOS.avulsa.nome}</h3>
                <div className="valor">{reais(PRECOS.avulsa.centavos)}</div>
                <p>{PRECOS.avulsa.descricao}</p>
                <Link href="/revisar?plano=avulsa" className="btn go full">
                  Revisar um orçamento
                </Link>
              </div>
              <div className="card plano destaque">
                <span className="selo">Para comparar empreiteiros</span>
                <h3>{PRECOS.pacote3.nome}</h3>
                <div className="valor">{reais(PRECOS.pacote3.centavos)}</div>
                <p>
                  {reais(Math.round(PRECOS.pacote3.centavos / 3))} por análise. Você usa a primeira agora e recebe por e-mail um
                  código com as outras duas.
                </p>
                <Link href="/revisar?plano=pacote3" className="btn go full">
                  Quero o pacote
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="band alt" aria-labelledby="faq">
          <div className="wrap"><div className="faq">
            <h2 id="faq" className="sec-title" style={{ marginBottom: 18 }}>
              Perguntas frequentes
            </h2>
            {FAQ.map((f) => (
              <details key={f.p}>
                <summary>{f.p}</summary>
                <p>{f.r}</p>
              </details>
            ))}
            <div style={{ marginTop: 32 }}>
              <Link href="/revisar" className="btn go big">
                Revisar meu orçamento
              </Link>
            </div>
          </div></div>
        </section>
      </main>
      <Rodape />
    </>
  );
}
