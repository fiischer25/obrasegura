import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { PaginaSimples } from "@/components/Moldura";
import { ParecerView } from "@/components/ParecerView";
import { AcoesParecer } from "@/components/AcoesParecer";
import { Consultoria } from "@/components/Consultoria";
import { ParecerSchema } from "@/lib/parecer";
import { db } from "@/lib/supabase";
import { tokenValido } from "@/lib/seguranca";

export const metadata: Metadata = { title: "Parecer do orçamento · Obra Segura", robots: { index: false } };

export default async function ParecerPage({ params }: PageProps<"/parecer/[token]">) {
  const { token } = await params;
  if (!tokenValido(token)) notFound();
  const { data } = await db()
    .from("pedidos")
    .select("status, parecer, area_m2, tipo_obra")
    .eq("token", token)
    .maybeSingle();
  if (!data) notFound();
  if (data.status !== "pronto") redirect(`/pedido/${token}`);
  const v = ParecerSchema.safeParse(data.parecer);
  if (!v.success) notFound();

  // Custo por m² só faz sentido em obra nova/ampliação com faixa de referência
  const area = data.tipo_obra === "reforma" ? undefined : Number(data.area_m2) || undefined;

  const base = process.env.SITE_URL ?? `https://${(await headers()).get("host")}`;
  const linkParecer = `${base}/parecer/${token}`;

  return (
    <PaginaSimples cta={false}>
      <ParecerView
        r={v.data}
        areaM2={area}
        acoes={
          <>
            <AcoesParecer r={v.data} />
            <Consultoria linkParecer={linkParecer} />
          </>
        }
      />
    </PaginaSimples>
  );
}
