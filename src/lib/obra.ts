import { z } from "zod";

// Opções do formulário "Sua obra". Usado no navegador e no servidor.

export const TIPOS_OBRA = { nova: "Construção nova", reforma: "Reforma", ampliacao: "Ampliação" } as const;
export const PADROES = { simples: "Simples", medio: "Médio", alto: "Alto" } as const;
export const ESCOPOS = {
  global: "Mão de obra + material",
  mao: "Só mão de obra",
  nsei: "Não sei",
} as const;

export const LIMITES = {
  maxImagens: 6,
  maxBytesArquivo: 10 * 1024 * 1024, // 10 MB
  maxCaracteresTexto: 30000,
};

export const TIPOS_ARQUIVO = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;
export type TipoArquivo = (typeof TIPOS_ARQUIVO)[number];

const chaves = <T extends Record<string, string>>(o: T) =>
  Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];

export const ArquivoInfoSchema = z.object({
  nome: z.string().min(1).max(200),
  tipo: z.enum(TIPOS_ARQUIVO),
  bytes: z.number().int().positive().max(LIMITES.maxBytesArquivo),
});

export const NovoPedidoSchema = z
  .object({
    tipo_obra: z.enum(chaves(TIPOS_OBRA)),
    cidade: z.string().trim().min(2, "Informe a cidade e o estado").max(80),
    area_m2: z.number().positive("Informe a área").max(100000),
    padrao: z.enum(chaves(PADROES)),
    escopo: z.enum(chaves(ESCOPOS)),
    texto: z.string().max(LIMITES.maxCaracteresTexto).default(""),
    arquivos: z.array(ArquivoInfoSchema).max(LIMITES.maxImagens).default([]),
    nome: z.string().trim().min(2, "Informe seu nome").max(100),
    email: z.email("E-mail inválido").max(200),
    whatsapp: z.string().trim().max(30).default(""),
    aceite: z.literal(true, "É preciso aceitar os termos e a política de privacidade"),
    plano: z.enum(["avulsa", "pacote3", "credito", "teste"]),
    codigo: z.string().trim().max(100).default(""),
  })
  .superRefine((d, ctx) => {
    const pdfs = d.arquivos.filter((a) => a.tipo === "application/pdf");
    const imgs = d.arquivos.filter((a) => a.tipo !== "application/pdf");
    if (pdfs.length > 1 || (pdfs.length === 1 && imgs.length > 0)) {
      ctx.addIssue({ code: "custom", path: ["arquivos"], message: "Envie um PDF ou até 6 imagens, não os dois." });
    }
    if (!d.texto.trim() && d.arquivos.length === 0) {
      ctx.addIssue({ code: "custom", path: ["texto"], message: "Envie um arquivo ou cole o texto do orçamento." });
    }
  });

export type NovoPedido = z.infer<typeof NovoPedidoSchema>;
