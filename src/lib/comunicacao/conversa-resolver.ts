import { findClientById } from "@/lib/clients-registry";
import type { Conversa, Lead } from "@/lib/types";

function lastMessageAt(conversa: Conversa): number {
  const last = conversa.mensagens[conversa.mensagens.length - 1];
  return last ? new Date(last.em).getTime() : 0;
}

function pickMostRecent(conversas: Conversa[]): Conversa | undefined {
  if (conversas.length === 0) return undefined;
  return conversas.reduce((best, current) =>
    lastMessageAt(current) > lastMessageAt(best) ? current : best,
  );
}

export function resolveConversasForClient(
  conversas: Conversa[],
  leads: Lead[],
  clientId: string,
): Conversa[] {
  const viaLead = conversas.filter((conversa) => {
    if (!conversa.leadId) return false;
    const lead = leads.find((item) => item.id === conversa.leadId);
    return lead?.clientId === clientId;
  });
  if (viaLead.length > 0) return viaLead;

  const client = findClientById(clientId);
  if (!client) return [];

  return conversas.filter(
    (conversa) =>
      conversa.contatoNome === client.nome || conversa.contatoEmpresa === client.empresa,
  );
}

export function resolveConversaForClient(
  conversas: Conversa[],
  leads: Lead[],
  clientId: string,
): Conversa | undefined {
  return pickMostRecent(resolveConversasForClient(conversas, leads, clientId));
}

export function buildConversaFromClient(
  clientId: string,
  leads: Lead[],
  agenteId: string,
): Omit<Conversa, "id" | "mensagens" | "naoLidas"> | null {
  const client = findClientById(clientId);
  if (!client) return null;

  const lead = leads.find((item) => item.clientId === clientId);

  return {
    contatoNome: client.nome,
    contatoEmpresa: client.empresa,
    telefone: lead?.telefone ?? "",
    leadId: lead?.id,
    agenteId,
  };
}
