"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { ESCOPOS, LIMITES, PADROES, TIPOS_OBRA, type TipoArquivo } from "@/lib/obra";
import { PRECOS, reais } from "@/config/precos";

type Plano = "avulsa" | "pacote3" | "credito" | "teste";
type Arq = { arquivo: File; nome: string; tipo: TipoArquivo };

const MB = 1024 * 1024;

// Reduz fotos grandes para JPEG de até 2000 px: o envio fica rápido e a leitura continua boa.
async function prepararImagem(f: File): Promise<Arq> {
  try {
    const bmp = await createImageBitmap(f);
    const k = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const cv = document.createElement("canvas");
    cv.width = Math.round(bmp.width * k);
    cv.height = Math.round(bmp.height * k);
    cv.getContext("2d")!.drawImage(bmp, 0, 0, cv.width, cv.height);
    const blob = await new Promise<Blob | null>((r) => cv.toBlob(r, "image/jpeg", 0.85));
    if (!blob) throw new Error();
    const nome = f.name.replace(/\.[^.]+$/, "") + ".jpg";
    return { arquivo: new File([blob], nome, { type: "image/jpeg" }), nome, tipo: "image/jpeg" };
  } catch {
    if (["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      return { arquivo: f, nome: f.name, tipo: f.type as TipoArquivo };
    }
    throw new Error(`Não conseguimos abrir a imagem ${f.name}. Tente tirar um print da foto e enviar o print.`);
  }
}

export function Formulario({ planoInicial, modoTeste }: { planoInicial: Plano; modoTeste: boolean }) {
  const router = useRouter();
  const [arquivos, setArquivos] = useState<Arq[]>([]);
  const [plano, setPlano] = useState<Plano>(modoTeste ? "teste" : planoInicial);
  const [status, setStatus] = useState<{ msg: string; erro?: boolean }>({ msg: "" });
  const [enviando, setEnviando] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  function erro(msg: string) {
    setStatus({ msg, erro: true });
    statusRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function adicionar(lista: FileList | File[]) {
    const novos = [...lista];
    if (!novos.length) return;
    setStatus({ msg: "" });
    try {
      const pdfs = novos.filter((f) => f.type === "application/pdf");
      const imgs = novos.filter((f) => f.type.startsWith("image/"));
      if (novos.length !== pdfs.length + imgs.length) throw new Error("Envie só PDF ou imagens (fotos).");
      if (pdfs.length) {
        if (pdfs.length > 1 || imgs.length || arquivos.length) throw new Error("Envie um único PDF, ou então até 6 fotos.");
        if (pdfs[0].size > LIMITES.maxBytesArquivo) throw new Error("O PDF passa de 10 MB. Tente uma versão menor.");
        setArquivos([{ arquivo: pdfs[0], nome: pdfs[0].name, tipo: "application/pdf" }]);
        return;
      }
      if (arquivos.some((a) => a.tipo === "application/pdf")) throw new Error("Você já escolheu um PDF. Remova-o para enviar fotos.");
      if (arquivos.length + imgs.length > LIMITES.maxImagens) throw new Error("Envie no máximo 6 fotos.");
      const grandes = imgs.find((f) => f.size > LIMITES.maxBytesArquivo);
      if (grandes) throw new Error(`A foto ${grandes.name} passa de 10 MB.`);
      setStatus({ msg: "Preparando as fotos…" });
      const prontos = await Promise.all(imgs.map(prepararImagem));
      setArquivos((a) => [...a, ...prontos]);
      setStatus({ msg: "" });
    } catch (e) {
      erro(e instanceof Error ? e.message : "Não foi possível usar esse arquivo.");
    }
  }

  async function enviar(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    const texto = String(f.get("texto") ?? "").trim();
    if (!texto && !arquivos.length) return erro("Envie o arquivo do orçamento ou cole o texto.");
    if (!f.get("aceite")) return erro("Para continuar, aceite os termos de uso e a política de privacidade.");

    const dados = {
      tipo_obra: f.get("tipo_obra"),
      cidade: f.get("cidade"),
      area_m2: Number(String(f.get("area_m2")).replace(",", ".")),
      padrao: f.get("padrao"),
      escopo: f.get("escopo"),
      texto,
      arquivos: arquivos.map((a) => ({ nome: a.nome, tipo: a.tipo, bytes: a.arquivo.size })),
      nome: f.get("nome"),
      email: f.get("email"),
      whatsapp: f.get("whatsapp") ?? "",
      aceite: true,
      plano,
      codigo: String(f.get("codigo") ?? ""),
    };

    setEnviando(true);
    try {
      setStatus({ msg: "Registrando o pedido…" });
      const r1 = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      const j1 = await r1.json().catch(() => ({}));
      if (!r1.ok) throw new Error(j1.erro ?? "Não foi possível enviar agora.");

      const uploads: { caminho: string; url: string }[] = j1.uploads ?? [];
      for (let i = 0; i < uploads.length; i++) {
        setStatus({ msg: `Enviando arquivo ${i + 1} de ${uploads.length}…` });
        const corpo = new FormData();
        corpo.append("cacheControl", "3600");
        corpo.append("", arquivos[i].arquivo);
        const up = await fetch(uploads[i].url, { method: "PUT", body: corpo, headers: { "x-upsert": "false" } });
        if (!up.ok) throw new Error(`Falha ao enviar ${arquivos[i].nome}. Verifique sua internet e tente de novo.`);
      }

      setStatus({ msg: "Conferindo os arquivos…" });
      const r2 = await fetch(`/api/pedidos/${j1.token}/enviado`, { method: "POST" });
      const j2 = await r2.json().catch(() => ({}));
      if (!r2.ok) throw new Error(j2.erro ?? "Não foi possível concluir o envio.");
      if (j2.checkout) {
        window.location.href = j2.checkout; // Fase 2: Mercado Pago
        return;
      }
      router.push(`/pedido/${j1.token}`);
    } catch (e) {
      setEnviando(false);
      erro(e instanceof Error ? e.message : "Algo deu errado. Tente de novo.");
    }
  }

  const botao =
    plano === "teste"
      ? "Analisar (modo de teste)"
      : plano === "credito"
        ? "Usar meu crédito"
        : `Ir para o pagamento · ${reais(PRECOS[plano].centavos)}`;

  return (
    <form className="card form" onSubmit={enviar} noValidate>
      <h2>Sua obra</h2>
      <div className="row">
        <div>
          <label htmlFor="tipo_obra">Tipo de obra</label>
          <select id="tipo_obra" name="tipo_obra" defaultValue="nova">
            {Object.entries(TIPOS_OBRA).map(([v, t]) => (
              <option key={v} value={v}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="area_m2">Área (m²)</label>
          <input id="area_m2" name="area_m2" type="number" inputMode="decimal" min="1" step="any" required placeholder="Ex.: 140" />
        </div>
      </div>
      <div className="row">
        <div>
          <label htmlFor="cidade">Cidade / UF</label>
          <input id="cidade" name="cidade" type="text" required placeholder="Ex.: Campinas/SP" autoComplete="address-level2" />
        </div>
        <div>
          <label htmlFor="padrao">Padrão de acabamento</label>
          <select id="padrao" name="padrao" defaultValue="medio">
            {Object.entries(PADROES).map(([v, t]) => (
              <option key={v} value={v}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <label htmlFor="escopo">O que o orçamento cobre</label>
      <select id="escopo" name="escopo" defaultValue="global">
        {Object.entries(ESCOPOS).map(([v, t]) => (
          <option key={v} value={v}>{t}</option>
        ))}
      </select>

      <h2>O orçamento</h2>
      <span className="rotulo" id="rot-arq">Arquivo do orçamento</span>
      <label
        className={`drop${arrastando || arquivos.length ? " on" : ""}`}
        htmlFor="arq"
        onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => { e.preventDefault(); setArrastando(false); adicionar(e.dataTransfer.files); }}
      >
        <input
          id="arq"
          type="file"
          accept="application/pdf,image/*"
          multiple
          aria-describedby="rot-arq dica-arq"
          onChange={(e) => { adicionar(e.target.files ?? []); e.target.value = ""; }}
        />
        Toque para escolher o PDF ou as fotos
        <br />
        <small id="dica-arq">1 PDF de até 10 MB, ou até 6 fotos</small>
      </label>
      {arquivos.length > 0 && (
        <div className="chips">
          {arquivos.map((a, i) => (
            <span className="chip" key={i}>
              {a.nome} ({(a.arquivo.size / MB).toFixed(1)} MB)
              <button type="button" aria-label={`Remover ${a.nome}`} onClick={() => setArquivos((l) => l.filter((_, j) => j !== i))}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="ou">ou</p>
      <label htmlFor="texto">Cole o texto do orçamento</label>
      <textarea id="texto" name="texto" maxLength={LIMITES.maxCaracteresTexto} placeholder="Cole aqui o texto, se o orçamento veio por WhatsApp ou e-mail." />

      <h2>Seus dados</h2>
      <p className="hint">Sem cadastro e sem senha. Usamos só para enviar o parecer.</p>
      <label htmlFor="nome">Nome</label>
      <input id="nome" name="nome" type="text" required autoComplete="name" />
      <label htmlFor="email">Seu e-mail (o parecer chega aqui)</label>
      <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" />
      <label htmlFor="whatsapp">Seu número de WhatsApp (opcional)</label>
      <input id="whatsapp" name="whatsapp" type="tel" autoComplete="tel" inputMode="tel" placeholder="(11) 99999-9999" aria-describedby="dica-whats" />
      <p className="hint" id="dica-whats">Só para falarmos com você se houver algum problema com o pedido.</p>

      {plano === "teste" ? (
        <div className="teste">
          <label htmlFor="codigo" style={{ marginTop: 0 }}>Modo de teste: senha do painel</label>
          <input id="codigo" name="codigo" type="password" required autoComplete="off" />
          <p className="hint">Pula o pagamento. Só funciona com a senha do painel administrativo.</p>
        </div>
      ) : (
        <>
          <h2>Escolha</h2>
          <div className="opcoes" role="radiogroup" aria-label="Escolha do plano">
            {(["avulsa", "pacote3"] as const).map((p) => (
              <label className="opcao" key={p}>
                <input type="radio" name="plano" value={p} checked={plano === p} onChange={() => setPlano(p)} />
                <div>
                  <b>{PRECOS[p].nome}</b>
                  <span>{PRECOS[p].descricao}</span>
                </div>
                <span className="preco">{reais(PRECOS[p].centavos)}</span>
              </label>
            ))}
            <label className="opcao">
              <input type="radio" name="plano" value="credito" checked={plano === "credito"} onChange={() => setPlano("credito")} />
              <div>
                <b>Tenho um código de créditos</b>
                <span>Recebido por e-mail na compra do pacote</span>
              </div>
            </label>
          </div>
          {plano === "credito" && (
            <>
              <label htmlFor="codigo">Seu código</label>
              <input id="codigo" name="codigo" type="text" required autoComplete="off" autoCapitalize="characters" />
            </>
          )}
        </>
      )}

      <label className="aceite">
        <input type="checkbox" name="aceite" required />
        <span>
          Li e aceito os <Link href="/termos" target="_blank">termos de uso</Link> e a{" "}
          <Link href="/privacidade" target="_blank">política de privacidade</Link>. Entendo que a análise é automática e
          serve para me orientar, sem fazer o papel de uma vistoria técnica na obra.
        </span>
      </label>

      <button className="btn go full big" type="submit" disabled={enviando} style={{ marginTop: 20 }}>
        {enviando ? "Enviando…" : botao}
      </button>
      <div ref={statusRef} className={`status${status.erro ? " err" : ""}`} role="status" aria-live="polite">
        {status.msg}
      </div>
    </form>
  );
}
