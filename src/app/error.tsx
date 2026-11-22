"use client";

export default function Erro({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="pagina centro">
      <h1>Algo deu errado</h1>
      <p>Tivemos um problema para carregar esta página. Tente de novo em alguns instantes.</p>
      <button className="btn go" onClick={reset}>Tentar de novo</button>
    </main>
  );
}
