export function formatarMoeda(valor: number | null | undefined): string {
  return (valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatarData(data: Date | string | null | undefined): string {
  if (!data) return "—";
  const d = typeof data === "string" ? new Date(data) : data;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function paraInputDate(data: Date | string | null | undefined): string {
  if (!data) return "";
  const d = typeof data === "string" ? new Date(data) : data;
  return d.toISOString().slice(0, 10);
}

// Rótulos amigáveis para os valores de status/enum
export const STATUS_OS: Record<string, { label: string; cor: string }> = {
  ABERTA: { label: "Aberta", cor: "bg-blue-100 text-blue-800" },
  AGENDADA: { label: "Agendada", cor: "bg-purple-100 text-purple-800" },
  EM_ANDAMENTO: { label: "Em andamento", cor: "bg-amber-100 text-amber-800" },
  CONCLUIDA: { label: "Concluída", cor: "bg-green-100 text-green-800" },
  CANCELADA: { label: "Cancelada", cor: "bg-gray-200 text-gray-700" },
};

export const PRIORIDADE_OS: Record<string, { label: string; cor: string }> = {
  BAIXA: { label: "Baixa", cor: "bg-gray-100 text-gray-700" },
  MEDIA: { label: "Média", cor: "bg-blue-100 text-blue-700" },
  ALTA: { label: "Alta", cor: "bg-orange-100 text-orange-800" },
  URGENTE: { label: "Urgente", cor: "bg-red-100 text-red-800" },
};

export const TIPO_OS: Record<string, string> = {
  PREVENTIVA: "Preventiva",
  CORRETIVA: "Corretiva",
};

export const CATEGORIAS_OS = [
  "ELETRICA",
  "HIDRAULICA",
  "PINTURA",
  "LIMPEZA",
  "JARDINAGEM",
  "ELEVADOR",
  "OUTRO",
] as const;

export const CATEGORIA_LABEL: Record<string, string> = {
  ELETRICA: "Elétrica",
  HIDRAULICA: "Hidráulica",
  PINTURA: "Pintura",
  LIMPEZA: "Limpeza",
  JARDINAGEM: "Jardinagem",
  ELEVADOR: "Elevador",
  OUTRO: "Outro",
};

export const STATUS_CONTRATO: Record<string, string> = {
  ATIVO: "Ativo",
  ENCERRADO: "Encerrado",
  SUSPENSO: "Suspenso",
};

export const TIPO_COLABORADOR: Record<string, string> = {
  CLT: "CLT",
  PRESTADOR: "Prestador",
};
