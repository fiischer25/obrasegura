import Link from "next/link";
import { PaginaSimples } from "@/components/Moldura";

export default function NaoEncontrado() {
  return (
    <PaginaSimples>
      <div className="centro">
        <h1>Página não encontrada</h1>
        <p>O link pode estar incompleto. Confira o endereço ou volte para o início.</p>
        <Link href="/" className="btn go">Ir para o início</Link>
      </div>
    </PaginaSimples>
  );
}
