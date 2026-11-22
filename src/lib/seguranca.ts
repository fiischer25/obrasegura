import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { db } from "./supabase";

// Token longo e aleatório usado nos links do pedido e do parecer.
export function novoToken() {
  return randomBytes(24).toString("base64url"); // 32 caracteres
}

export function tokenValido(t: string) {
  return /^[A-Za-z0-9_-]{32}$/.test(t);
}

export function ipDe(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  return (xff?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "desconhecido").trim();
}

export function hashIp(ip: string) {
  return createHash("sha256").update("obrasegura:" + ip).digest("hex").slice(0, 32);
}

export function senhaConfere(tentativa: string, correta: string | undefined) {
  if (!correta) return false;
  const a = createHash("sha256").update(tentativa).digest();
  const b = createHash("sha256").update(correta).digest();
  return timingSafeEqual(a, b);
}

// Limite de pedidos por IP por hora (contado no banco, funciona com vários servidores).
export async function limiteAtingido(ipHash: string, maxPorHora = 10) {
  const desde = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await db()
    .from("pedidos")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("criado_em", desde);
  return (count ?? 0) >= maxPorHora;
}

export function erroJson(mensagem: string, status = 400) {
  return Response.json({ erro: mensagem }, { status });
}
