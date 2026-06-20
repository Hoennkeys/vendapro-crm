export function buildChamadoGreetingMessage(
  clienteNome: string,
  tituloChamado: string,
): string {
  return `Olá, ${clienteNome}! Sou o responsável pelo seu chamado '${tituloChamado}' aqui na nossa plataforma. Já estou analisando o seu caso para resolvermos o quanto antes. Pode me dar mais detalhes por aqui se desejar!`;
}
