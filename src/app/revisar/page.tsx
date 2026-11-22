import type { Metadata } from "next";
import { Rodape, Topo } from "@/components/Moldura";
import { Formulario } from "./Formulario";

export const metadata: Metadata = {
  title: "Revisar meu orçamento · Obra Segura",
};

export default async function Revisar({ searchParams }: PageProps<"/revisar">) {
  const sp = await searchParams;
  const plano = sp.plano === "pacote3" || sp.plano === "credito" ? sp.plano : "avulsa";
  const modoTeste = sp.teste === "1";
  return (
    <>
      <header className="hero">
        <Topo cta={false} />
        <div className="wrap hero-in" style={{ paddingBottom: 88 }}>
          <h1>Revise o orçamento da sua obra</h1>
          <p className="sub">Não precisa de cadastro. Preencha em dois minutos e o parecer fica pronto poucos minutos depois do pagamento.</p>
        </div>
      </header>
      <main className="pagina-form">
        <Formulario planoInicial={plano} modoTeste={modoTeste} />
      </main>
      <Rodape />
    </>
  );
}
