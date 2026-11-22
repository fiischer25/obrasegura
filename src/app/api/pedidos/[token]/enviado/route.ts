import { after } from "next/server";
import { BUCKET, db, type Pedido } from "@/lib/supabase";
import { erroJson, tokenValido } from "@/lib/seguranca";
import { detectarTipo } from "@/lib/arquivos";
import { LIMITES } from "@/lib/obra";
import { processarPedido } from "@/lib/analise";

// A análise roda logo depois da resposta, dentro desta função: precisa de tempo.
export const maxDuration = 300;

// Passo 2 do envio: o navegador avisa que terminou de mandar os arquivos.
// Conferimos cada arquivo de verdade (tipo e tamanho) antes de seguir.
export async function POST(_req: Request, ctx: RouteContext<"/api/pedidos/[token]/enviado">) {
  const { token } = await ctx.params;
  if (!tokenValido(token)) return erroJson("Pedido não encontrado.", 404);

  const { data: pedido } = await db().from("pedidos").select("*").eq("token", token).maybeSingle<Pedido>();
  if (!pedido) return erroJson("Pedido não encontrado.", 404);
  if (pedido.status !== "pendente") return Response.json({ token });

  for (const a of pedido.arquivos) {
    const { data, error } = await db().storage.from(BUCKET).download(a.caminho);
    if (error || !data) return erroJson(`O arquivo ${a.nome} não chegou. Tente enviar de novo.`);
    const buf = new Uint8Array(await data.arrayBuffer());
    const tipoReal = detectarTipo(buf);
    if (buf.byteLength > LIMITES.maxBytesArquivo || !tipoReal || tipoReal !== a.tipo) {
      await db().storage.from(BUCKET).remove(pedido.arquivos.map((x) => x.caminho));
      await db().from("pedidos").update({ status: "cancelado", erro: `arquivo inválido: ${a.nome}` }).eq("id", pedido.id);
      return erroJson(`O arquivo ${a.nome} não é um PDF ou imagem válido, ou passa de 10 MB.`);
    }
  }

  if (pedido.plano === "teste") {
    await db()
      .from("pedidos")
      .update({ status: "pago", pago_em: new Date().toISOString() })
      .eq("id", pedido.id)
      .eq("status", "pendente");
    after(() => processarPedido(pedido.id));
  }
  // Fase 2: aqui entra a criação do checkout do Mercado Pago.

  return Response.json({ token });
}
