-- Obra Segura — estrutura inicial do banco.
-- Como usar: no Supabase, abra "SQL Editor", clique em "New query",
-- cole TODO este arquivo e clique em "Run". Pode rodar mais de uma vez sem problema.

-- Pedidos: um por orçamento enviado
create table if not exists public.pedidos (
  id               bigint generated always as identity primary key,
  token            text not null unique,                -- usado nos links (/pedido/..., /parecer/...)
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now(),
  status           text not null default 'pendente'
                   check (status in ('pendente','pago','analisando','pronto','erro','recusado','cancelado')),

  -- dados da obra
  tipo_obra        text not null,
  cidade           text not null,
  area_m2          numeric not null,
  padrao           text not null,
  escopo           text not null,
  texto            text not null default '',
  arquivos         jsonb not null default '[]'::jsonb,  -- [{caminho, nome, tipo, bytes}]
  arquivos_apagados_em timestamptz,

  -- cliente
  nome             text not null,
  email            text not null,
  whatsapp         text not null default '',
  aceite_termos_em timestamptz not null,
  ip_hash          text,

  -- venda
  plano            text not null check (plano in ('avulsa','pacote3','credito','teste')),
  valor_centavos   integer not null default 0,
  pago_em          timestamptz,
  mp_preference_id text,
  mp_payment_id    text,
  codigo_credito_id bigint,

  -- análise
  parecer          jsonb,
  tentativas       integer not null default 0,
  erro             text,
  modelo           text,
  tokens_entrada   integer not null default 0,
  tokens_saida     integer not null default 0,
  custo_ia_usd     numeric(10,4) not null default 0,
  analise_iniciada_em timestamptz,
  pronto_em        timestamptz
);

create index if not exists pedidos_status_idx on public.pedidos (status);
create index if not exists pedidos_criado_idx on public.pedidos (criado_em desc);
create index if not exists pedidos_ip_idx on public.pedidos (ip_hash, criado_em desc);

-- Códigos de créditos (pacote de 3). Usado a partir da Fase 3.
create table if not exists public.codigos_credito (
  id          bigint generated always as identity primary key,
  codigo      text not null unique,
  criado_em   timestamptz not null default now(),
  email       text not null,
  creditos_total integer not null,
  creditos_usados integer not null default 0 check (creditos_usados <= creditos_total),
  origem_pedido_id bigint references public.pedidos(id),
  observacao  text
);

-- Atualiza "atualizado_em" sozinho
create or replace function public.tocar_atualizado_em() returns trigger
language plpgsql as $$
begin new.atualizado_em = now(); return new; end $$;

drop trigger if exists pedidos_tocar on public.pedidos;
create trigger pedidos_tocar before update on public.pedidos
for each row execute function public.tocar_atualizado_em();

-- Segurança: ninguém lê ou grava estas tabelas pelo navegador.
-- Só o servidor do site acessa, com a chave secreta.
alter table public.pedidos enable row level security;
alter table public.codigos_credito enable row level security;
revoke all on public.pedidos from anon, authenticated;
revoke all on public.codigos_credito from anon, authenticated;

-- Bucket PRIVADO para os arquivos dos orçamentos (até 10 MB, só PDF e imagens)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('orcamentos', 'orcamentos', false, 10485760,
        array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
