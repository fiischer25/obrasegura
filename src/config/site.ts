// Dados da empresa que aparecem no rodapé, nos termos e nos e-mails.

export const SITE = {
  marca: "Obra Segura",
  produto: "Revisor de Orçamento",
  razaoSocial: "Fischer Projetos de Arquitetura LTDA",
  cnpj: "41.516.914/0001-97",
  cidade: "Bragança Paulista/SP",
  // TODO: confirmar e-mail e WhatsApp de suporte com o Matheus
  emailContato: "contato@obrasegura.com.br",
  whatsapp: "", // como aparece no site, ex.: "(19) 99622-3863"
};

// Consultoria com arquiteto, oferecida no fim de cada parecer.
export const CONSULTORIA = {
  // Número com DDI e DDD, só dígitos, ex.: "5519996223863". Vazio = usa o e-mail.
  whatsapp: "",
  titulo: "Quer revisar este orçamento com um arquiteto?",
  texto:
    "Numa conversa com um arquiteto da nossa equipe você tira as dúvidas do parecer, entende o que pedir ao empreiteiro e decide com mais segurança.",
  // Se preencher, aparece abaixo do texto. Ex.: "O valor desta análise é abatido da consultoria."
  beneficio: "",
  botao: "Falar com um arquiteto no WhatsApp",
  mensagem: (link: string) =>
    `Olá! Recebi o parecer do Obra Segura e quero uma consultoria com arquiteto sobre o meu orçamento. Parecer: ${link}`,
};

export function linkConsultoria(linkParecer: string) {
  const msg = encodeURIComponent(CONSULTORIA.mensagem(linkParecer));
  if (CONSULTORIA.whatsapp) return `https://wa.me/${CONSULTORIA.whatsapp}?text=${msg}`;
  return `mailto:${SITE.emailContato}?subject=${encodeURIComponent("Consultoria sobre meu orçamento")}&body=${msg}`;
}
