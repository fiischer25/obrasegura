import type { Metadata } from "next";
import { PaginaSimples } from "@/components/Moldura";
import { Acompanhar } from "./Acompanhar";

export const metadata: Metadata = { title: "Seu pedido · Obra Segura", robots: { index: false } };

export default async function Pedido({ params }: PageProps<"/pedido/[token]">) {
  const { token } = await params;
  return (
    <PaginaSimples>
      <Acompanhar token={token} />
    </PaginaSimples>
  );
}
