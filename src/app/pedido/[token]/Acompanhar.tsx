"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "@/config/site";

type Status = "carregando" | "pendente" | "pago" | "analisando" | "pronto" | "erro" | "recusado" | "cancelado" | "naoexiste";

// Consulta o status a cada poucos segundos até o parecer ficar pronto.
export function Acompanhar({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("carregando");

  useEffect(() => {
    let parar = false;
    let timer: ReturnType<typeof setTimeout>;
    let falhas = 0;
    async function consultar() {
      try {
        const r = await fetch(`/api/pedidos/${token}`, { cache: "no-store" });
        if (r.status === 404) return setStatus("naoexiste");
        const j = await r.json();
        falhas = 0;
        setStatus(j.status);
        if (j.status === "pronto") {
          router.replace(`/parecer/${token}`);
          return;
        }
        if (j.status === "erro" || j.status === "recusado" || j.status === "cancelado") return;
      } catch {
        falhas++;
      }
      if (!parar) timer = setTimeout(consultar, Math.min(4000 + falhas * 2000, 15000));
    }
    consultar();
    return () => {
      parar = true;
      clearTimeout(timer);
    };
  }, [token, router]);

  if (status === "naoexiste") {
    return (
      <div className="centro">
        <h1>Pedido não encontrado</h1>
        <p>Confira se o link está completo. Se precisar, fale com a gente em {SITE.emailContato}.</p>
      </div>
    );
  }
  if (status === "erro") {
    return (
      <div className="centro">
        <h1>Seu parecer vai chegar por e-mail</h1>
        <p>
          Tivemos um problema para concluir a análise automática. Não se preocupe: vamos revisar e o parecer chega no
          seu e-mail em até 24 horas.
        </p>
        <p className="hint">Dúvidas: {SITE.emailContato}</p>
      </div>
    );
  }
  if (status === "recusado" || status === "cancelado") {
    return (
      <div className="centro">
        <h1>{status === "recusado" ? "O pagamento não foi aprovado" : "Pedido cancelado"}</h1>
        <p>Nenhum valor foi cobrado. Você pode tentar de novo.</p>
        <Link href="/revisar" className="btn go">Enviar de novo</Link>
      </div>
    );
  }
  if (status === "pendente") {
    return (
      <div className="centro" aria-live="polite">
        <div className="spinner" aria-hidden />
        <h1>Aguardando o pagamento</h1>
        <p>
          Se você pagou com Pix, a confirmação costuma chegar em instantes. Esta página atualiza sozinha. Pode deixar
          aberta.
        </p>
      </div>
    );
  }
  return (
    <div className="centro" aria-live="polite">
      <div className="spinner" aria-hidden />
      <h1>{status === "carregando" ? "Carregando…" : "Pagamento confirmado, analisando…"}</h1>
      <p>
        Estamos lendo o orçamento item por item. Isso leva alguns minutos. Esta página atualiza sozinha, e o parecer
        também vai para o seu e-mail.
      </p>
    </div>
  );
}
