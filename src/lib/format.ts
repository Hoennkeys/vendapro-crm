export const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export const brNumber = (n: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(n);

export const brDate = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("pt-BR");
};

export const brDateTime = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
};

export const brTime = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

/** Converte valor de `<input type="date">` (YYYY-MM-DD) para ISO sem deslocar o dia por timezone. */
export const isoFromDateInput = (yyyyMmDd: string) => {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0).toISOString();
};