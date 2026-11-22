import Link from "next/link";
import type { ReactNode } from "react";
import { SITE } from "@/config/site";

export function Topo({ cta = true }: { cta?: boolean }) {
  return (
    <div className="wrap topo">
      <Link href="/" className="marca">
        <b>{SITE.marca}</b> <span className="sub-marca">{SITE.produto}</span>
      </Link>
      {cta && (
        <Link href="/revisar" className="btn light">
          Revisar meu orçamento
        </Link>
      )}
    </div>
  );
}

export function Rodape() {
  return (
    <footer className="rodape">
      <div className="wrap">
        <div className="linhas">
          <div>
            <strong>{SITE.marca}</strong> é um serviço de {SITE.razaoSocial}
            <br />
            CNPJ {SITE.cnpj} · {SITE.cidade}
            <br />
            Contato: <a href={`mailto:${SITE.emailContato}`}>{SITE.emailContato}</a>
            {SITE.whatsapp && <> · WhatsApp {SITE.whatsapp}</>}
          </div>
          <nav aria-label="Links legais">
            <Link href="/termos">Termos de uso</Link>
            <Link href="/privacidade">Política de privacidade</Link>
          </nav>
        </div>
        <p className="aviso-legal">
          A análise é automática e orientativa. Não substitui vistoria nem parecer de arquiteto ou engenheiro
          habilitado.
        </p>
      </div>
    </footer>
  );
}

// Página interna com faixa azul curta no topo
export function PaginaSimples({ children, cta = false }: { children: ReactNode; cta?: boolean }) {
  return (
    <>
      <header className="hero">
        <Topo cta={cta} />
      </header>
      <main className="pagina">{children}</main>
      <Rodape />
    </>
  );
}
