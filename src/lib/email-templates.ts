export type EmailTemplate = {
  id: string;
  nome: string;
  assunto: string;
  corpo: string;
};

export const emailTemplates: EmailTemplate[] = [
  {
    id: "apresentacao",
    nome: "Apresentação",
    assunto: "Prazer em conhecê-lo(a) — VendaPro CRM",
    corpo:
      "Olá {{cliente}},\n\nMeu nome é {{vendedor}} e sou consultor(a) da VendaPro. Identifiquei que sua empresa pode se beneficiar das nossas soluções de gestão de vendas e gostaria de apresentar como podemos ajudar.\n\nPodemos agendar uma conversa rápida de 15 minutos esta semana?\n\nFico no aguardo.\n\nAtenciosamente,\n{{vendedor}}",
  },
  {
    id: "followup",
    nome: "Follow-up",
    assunto: "Acompanhamento da nossa conversa",
    corpo:
      "Olá {{cliente}},\n\nPassando para retomar nossa última conversa e verificar se há alguma dúvida que eu possa esclarecer.\n\nEstou à disposição para conversarmos pelo telefone ou agendar uma reunião online.\n\nAbraço,\n{{vendedor}}",
  },
  {
    id: "proposta",
    nome: "Envio de Proposta",
    assunto: "Sua proposta comercial — VendaPro",
    corpo:
      "Olá {{cliente}},\n\nConforme combinado, segue em anexo a proposta comercial elaborada especialmente para sua empresa. A validade da proposta é de 15 dias.\n\nQualquer dúvida estou à disposição.\n\nAtenciosamente,\n{{vendedor}}",
  },
  {
    id: "agradecimento",
    nome: "Agradecimento pós-venda",
    assunto: "Obrigado pela confiança!",
    corpo:
      "Olá {{cliente}},\n\nQuero agradecer pela confiança em fechar negócio conosco. Nossa equipe está empenhada em entregar o melhor resultado para sua empresa.\n\nQualquer necessidade, fale comigo diretamente.\n\nUm abraço,\n{{vendedor}}",
  },
  {
    id: "reengajamento",
    nome: "Reengajamento de lead frio",
    assunto: "Faz tempo que não nos falamos, {{cliente}}!",
    corpo:
      "Olá {{cliente}},\n\nNotei que faz um tempo que não trocamos mensagens. Lançamos novidades que acredito serem bastante interessantes para o seu segmento.\n\nPosso te enviar um resumo rápido?\n\nAbraço,\n{{vendedor}}",
  },
];

export function aplicarTemplate(t: EmailTemplate, cliente: string, vendedor: string) {
  const sub = (s: string) =>
    s.replaceAll("{{cliente}}", cliente || "cliente").replaceAll("{{vendedor}}", vendedor || "");
  return { assunto: sub(t.assunto), corpo: sub(t.corpo) };
}
