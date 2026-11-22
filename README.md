# Obra Segura — Revisor de Orçamento

Site onde o dono da obra envia o orçamento do empreiteiro, paga e recebe um parecer feito por IA.

## Tecnologia
Next.js 16 (App Router, TypeScript, Tailwind) · Supabase (banco + Storage privado) · API da Anthropic (`claude-sonnet-5-5`) · Mercado Pago Checkout Pro · Resend · Vercel.

## Onde mudar cada coisa
| O quê | Arquivo |
|---|---|
| Preços | `src/config/precos.ts` |
| Razão social, CNPJ, contato | `src/config/site.ts` |
| Referências de custo (CUB) | `src/lib/referencias.ts` |
| Instruções da IA | `src/lib/analise.ts` |
| Formato do parecer | `src/lib/parecer.ts` |
| Banco de dados | `supabase/migrations/` (rodar no SQL Editor do Supabase) |

## Rodar no computador
```bash
npm install
cp .env.example .env.local   # e preencha
npm run dev
```

## Modo de teste (sem pagamento)
Abra `/revisar?teste=1` e informe a senha do painel (`ADMIN_PASSWORD`).
