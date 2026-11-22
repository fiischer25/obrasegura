import { db } from "@/lib/supabase";
import { erroJson, tokenValido } from "@/lib/seguranca";

// Consulta rápida do status, usada pela página de acompanhamento.
export async function GET(_req: Request, ctx: RouteContext<"/api/pedidos/[token]">) {
  const { token } = await ctx.params;
  if (!tokenValido(token)) return erroJson("Pedido não encontrado.", 404);
  const { data } = await db().from("pedidos").select("status").eq("token", token).maybeSingle();
  if (!data) return erroJson("Pedido não encontrado.", 404);
  return Response.json({ status: data.status }, { headers: { "Cache-Control": "no-store" } });
}
