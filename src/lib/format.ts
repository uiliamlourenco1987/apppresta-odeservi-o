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

// Fluxo de status das ordens de serviço (etapas do Kanban, em ordem)
export const STATUS_OS: Record<
  string,
  { label: string; cor: string; corColuna: string; corBarra: string }
> = {
  CHAMADO: {
    label: "Chamado",
    cor: "bg-slate-100 text-slate-700",
    corColuna: "bg-slate-50 border-slate-200",
    corBarra: "bg-slate-400",
  },
  OS_ABERTA: {
    label: "OS Aberta",
    cor: "bg-blue-100 text-blue-800",
    corColuna: "bg-blue-50 border-blue-200",
    corBarra: "bg-blue-500",
  },
  EM_EXECUCAO: {
    label: "Em Execução",
    cor: "bg-amber-100 text-amber-800",
    corColuna: "bg-amber-50 border-amber-200",
    corBarra: "bg-amber-500",
  },
  EXECUCAO_PARCIAL: {
    label: "Execução Parcial",
    cor: "bg-orange-100 text-orange-800",
    corColuna: "bg-orange-50 border-orange-200",
    corBarra: "bg-orange-500",
  },
  EXECUCAO_TOTAL: {
    label: "Execução Total",
    cor: "bg-green-100 text-green-800",
    corColuna: "bg-green-50 border-green-200",
    corBarra: "bg-green-500",
  },
  CANCELADA: {
    label: "Cancelada",
    cor: "bg-gray-200 text-gray-700",
    corColuna: "bg-gray-50 border-gray-200",
    corBarra: "bg-gray-400",
  },
};

// Colunas do quadro Kanban, na ordem do fluxo de trabalho
export const KANBAN_COLUNAS = [
  "CHAMADO",
  "OS_ABERTA",
  "EM_EXECUCAO",
  "EXECUCAO_PARCIAL",
  "EXECUCAO_TOTAL",
] as const;

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

// Fluxo dos orçamentos (colunas do quadro)
export const STATUS_ORCAMENTO: Record<
  string,
  { label: string; cor: string; corColuna: string; corBarra: string }
> = {
  SOLICITADO: {
    label: "Solicitado",
    cor: "bg-slate-100 text-slate-700",
    corColuna: "bg-slate-50 border-slate-200",
    corBarra: "bg-slate-400",
  },
  ENVIADO: {
    label: "Enviado",
    cor: "bg-blue-100 text-blue-800",
    corColuna: "bg-blue-50 border-blue-200",
    corBarra: "bg-blue-500",
  },
  APROVADO: {
    label: "Aprovado",
    cor: "bg-green-100 text-green-800",
    corColuna: "bg-green-50 border-green-200",
    corBarra: "bg-green-500",
  },
  REPROVADO: {
    label: "Reprovado",
    cor: "bg-red-100 text-red-800",
    corColuna: "bg-red-50 border-red-200",
    corBarra: "bg-red-500",
  },
};

export const ORCAMENTO_COLUNAS = [
  "SOLICITADO",
  "ENVIADO",
  "APROVADO",
  "REPROVADO",
] as const;

export const STATUS_CONTRATO: Record<string, string> = {
  ATIVO: "Ativo",
  ENCERRADO: "Encerrado",
  SUSPENSO: "Suspenso",
};

export const TIPO_COLABORADOR: Record<string, string> = {
  CLT: "CLT",
  PRESTADOR: "Prestador",
};
