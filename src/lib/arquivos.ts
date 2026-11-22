import "server-only";
import type { TipoArquivo } from "./obra";

// Confere o tipo real do arquivo pelos primeiros bytes (não confia na extensão).
export function detectarTipo(buf: Uint8Array): TipoArquivo | null {
  const b = (i: number) => buf[i];
  if (buf.length >= 5 && b(0) === 0x25 && b(1) === 0x50 && b(2) === 0x44 && b(3) === 0x46 && b(4) === 0x2d) {
    return "application/pdf"; // %PDF-
  }
  if (buf.length >= 3 && b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return "image/jpeg";
  if (
    buf.length >= 8 &&
    b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4e && b(3) === 0x47 &&
    b(4) === 0x0d && b(5) === 0x0a && b(6) === 0x1a && b(7) === 0x0a
  ) {
    return "image/png";
  }
  if (
    buf.length >= 12 &&
    b(0) === 0x52 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x46 &&
    b(8) === 0x57 && b(9) === 0x45 && b(10) === 0x42 && b(11) === 0x50
  ) {
    return "image/webp"; // RIFF....WEBP
  }
  return null;
}

export function nomeSeguro(nome: string) {
  const base = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(-60);
  return base || "arquivo";
}
