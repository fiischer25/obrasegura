import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente do Supabase com a chave secreta. Só roda no servidor.

let cliente: SupabaseClient | null = null;

export function db() {
  if (cliente) return cliente;
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados");
  cliente = createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } });
  return cliente;
}

export const BUCKET = "orcamentos";

export type ArquivoPedido = { caminho: string; nome: string; tipo: string; bytes: number };

export type Pedido = {
  id: number;
  token: string;
  criado_em: string;
  status: "pendente" | "pago" | "analisando" | "pronto" | "erro" | "recusado" | "cancelado";
  tipo_obra: string;
  cidade: string;
  area_m2: number;
  padrao: string;
  escopo: string;
  texto: string;
  arquivos: ArquivoPedido[];
  nome: string;
  email: string;
  whatsapp: string;
  plano: "avulsa" | "pacote3" | "credito" | "teste";
  valor_centavos: number;
  parecer: unknown;
  tentativas: number;
  erro: string | null;
  tokens_entrada: number;
  tokens_saida: number;
  custo_ia_usd: number;
  pronto_em: string | null;
};
