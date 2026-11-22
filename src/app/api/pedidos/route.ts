import { NovoPedidoSchema } from "@/lib/obra";
import { PRECOS } from "@/config/precos";
import { BUCKET, db, type ArquivoPedido } from "@/lib/supabase";
import { erroJson, hashIp, ipDe, limiteAtingido, novoToken, senhaConfere } from "@/lib/seguranca";
import { nomeSeguro } from "@/lib/arquivos";

// Passo 1 do envio: valida o formulário, cria o pedido e devolve
// endereços temporários para o navegador mandar os arquivos direto ao Storage privado.
export async function POST(req: Request) {
  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return erroJson("Dados inválidos.");
  }
  const v = NovoPedidoSchema.safeParse(corpo);
  if (!v.success) return erroJson(v.error.issues[0]?.message ?? "Dados inválidos.");
  const d = v.data;

  const ipHash = hashIp(ipDe(req));
  if (await limiteAtingido(ipHash)) {
    return erroJson("Muitos envios seguidos. Espere alguns minutos e tente de novo.", 429);
  }

  let valor = 0;
  if (d.plano === "teste") {
    // Modo de teste: só quem sabe a senha do painel pula o pagamento.
    if (!senhaConfere(d.codigo, process.env.ADMIN_PASSWORD)) return erroJson("Código de teste inválido.", 403);
  } else if (d.plano === "credito") {
    return erroJson("Códigos de créditos chegam na próxima etapa do site.", 501);
  } else {
    valor = PRECOS[d.plano].centavos;
    return erroJson("O pagamento online ainda está sendo configurado. Volte em breve.", 501);
  }

  const token = novoToken();
  const arquivos: ArquivoPedido[] = d.arquivos.map((a, i) => ({
    caminho: `${token}/${i + 1}-${nomeSeguro(a.nome)}`,
    nome: a.nome,
    tipo: a.tipo,
    bytes: a.bytes,
  }));

  const { error } = await db().from("pedidos").insert({
    token,
    status: "pendente",
    tipo_obra: d.tipo_obra,
    cidade: d.cidade,
    area_m2: d.area_m2,
    padrao: d.padrao,
    escopo: d.escopo,
    texto: d.texto,
    arquivos,
    nome: d.nome,
    email: d.email.toLowerCase(),
    whatsapp: d.whatsapp,
    aceite_termos_em: new Date().toISOString(),
    ip_hash: ipHash,
    plano: d.plano,
    valor_centavos: valor,
  });
  if (error) {
    console.error("[pedidos] erro ao criar:", error);
    return erroJson("Não foi possível registrar o pedido agora. Tente de novo em instantes.", 500);
  }

  const uploads = [];
  for (const a of arquivos) {
    const { data, error: e } = await db().storage.from(BUCKET).createSignedUploadUrl(a.caminho);
    if (e || !data) {
      console.error("[pedidos] erro ao gerar upload:", e);
      return erroJson("Não foi possível preparar o envio dos arquivos.", 500);
    }
    uploads.push({ caminho: a.caminho, url: data.signedUrl });
  }

  return Response.json({ token, uploads });
}
