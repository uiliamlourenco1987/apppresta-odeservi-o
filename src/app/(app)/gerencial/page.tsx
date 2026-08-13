import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import {
  formatarMoeda,
  STATUS_OS,
  PRIORIDADE_OS,
  CATEGORIA_LABEL,
  KANBAN_COLUNAS,
} from "@/lib/format";

function Stat({
  titulo,
  valor,
  cor = "text-gray-900",
  sub,
}: {
  titulo: string;
  valor: string | number;
  cor?: string;
  sub?: string;
}) {
  return (
    <div className="card p-5">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className={`mt-1 text-2xl font-bold ${cor}`}>{valor}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function Barras({
  titulo,
  dados,
}: {
  titulo: string;
  dados: { label: string; valor: number; cor?: string; extra?: string }[];
}) {
  const max = Math.max(1, ...dados.map((d) => d.valor));
  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">{titulo}</h3>
      {dados.length === 0 ? (
        <p className="text-sm text-gray-400">Sem dados.</p>
      ) : (
        <div className="space-y-3">
          {dados.map((d) => (
            <div key={d.label}>
              <div className="mb-1 flex justify-between text-xs text-gray-600">
                <span>{d.label}</span>
                <span className="font-medium">{d.extra ?? d.valor}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${d.cor ?? "bg-brand-500"}`}
                  style={{ width: `${(d.valor / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function GerencialPage() {
  await exigirAdmin();

  const [
    porStatus,
    porPrioridade,
    porCategoria,
    porColaborador,
    colaboradores,
    contratosAtivos,
    receita,
    custoOS,
    pagPendentes,
    recPendentes,
    totClientes,
    totContratos,
    totColaboradores,
    totOS,
  ] = await Promise.all([
    prisma.ordemServico.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.ordemServico.groupBy({ by: ["prioridade"], _count: { _all: true } }),
    prisma.ordemServico.groupBy({ by: ["categoria"], _count: { _all: true } }),
    prisma.ordemServico.groupBy({
      by: ["colaboradorId"],
      _count: { _all: true },
      _sum: { custo: true },
    }),
    prisma.colaborador.findMany({ select: { id: true, nome: true } }),
    prisma.contrato.count({ where: { status: "ATIVO" } }),
    prisma.contrato.aggregate({
      where: { status: "ATIVO" },
      _sum: { valorMensal: true },
    }),
    prisma.ordemServico.aggregate({ _sum: { custo: true } }),
    prisma.pagamentoColaborador.aggregate({
      where: { status: "PENDENTE" },
      _sum: { valor: true },
    }),
    prisma.recebimento.aggregate({
      where: { status: { in: ["PENDENTE", "ATRASADO"] } },
      _sum: { valor: true },
    }),
    prisma.cliente.count({ where: { ativo: true } }),
    prisma.contrato.count(),
    prisma.colaborador.count({ where: { ativo: true } }),
    prisma.ordemServico.count(),
  ]);

  const nomeCol = new Map(colaboradores.map((c) => [c.id, c.nome]));
  const statusMap = new Map(porStatus.map((s) => [s.status, s._count._all]));
  const barrasStatus = KANBAN_COLUNAS.map((st) => ({
    label: STATUS_OS[st].label,
    valor: statusMap.get(st) ?? 0,
    cor: STATUS_OS[st].corBarra,
  }));

  const barrasPrioridade = ["URGENTE", "ALTA", "MEDIA", "BAIXA"].map((p) => ({
    label: PRIORIDADE_OS[p].label,
    valor: porPrioridade.find((x) => x.prioridade === p)?._count._all ?? 0,
    cor:
      p === "URGENTE"
        ? "bg-red-500"
        : p === "ALTA"
          ? "bg-orange-500"
          : p === "MEDIA"
            ? "bg-blue-500"
            : "bg-gray-400",
  }));

  const barrasCategoria = porCategoria
    .map((c) => ({
      label: c.categoria ? CATEGORIA_LABEL[c.categoria] ?? c.categoria : "Sem categoria",
      valor: c._count._all,
    }))
    .sort((a, b) => b.valor - a.valor);

  const barrasColaborador = porColaborador
    .map((c) => ({
      label: c.colaboradorId
        ? nomeCol.get(c.colaboradorId) ?? "—"
        : "Não atribuída",
      valor: c._count._all,
      extra: `${c._count._all} OS • ${formatarMoeda(c._sum.custo ?? 0)}`,
      cor: "bg-brand-500",
    }))
    .sort((a, b) => b.valor - a.valor);

  const abertas =
    (statusMap.get("CHAMADO") ?? 0) + (statusMap.get("OS_ABERTA") ?? 0);
  const emExec =
    (statusMap.get("EM_EXECUCAO") ?? 0) +
    (statusMap.get("EXECUCAO_PARCIAL") ?? 0);
  const concluidas = statusMap.get("EXECUCAO_TOTAL") ?? 0;

  return (
    <div>
      <PageHeader
        titulo="Painel Gerencial"
        subtitulo="Visão consolidada da operação e das finanças"
      />

      {/* KPIs financeiros */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          titulo="Receita mensal contratada"
          valor={formatarMoeda(receita._sum.valorMensal ?? 0)}
          cor="text-brand-600"
          sub={`${contratosAtivos} contratos ativos`}
        />
        <Stat
          titulo="A receber (em aberto)"
          valor={formatarMoeda(recPendentes._sum.valor ?? 0)}
          cor="text-green-600"
        />
        <Stat
          titulo="A pagar colaboradores"
          valor={formatarMoeda(pagPendentes._sum.valor ?? 0)}
          cor="text-red-600"
        />
        <Stat
          titulo="Custo total das OS"
          valor={formatarMoeda(custoOS._sum.custo ?? 0)}
          cor="text-amber-600"
        />
      </div>

      {/* KPIs operacionais */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat titulo="Total de OS" valor={totOS} />
        <Stat titulo="Chamados / abertas" valor={abertas} cor="text-blue-600" />
        <Stat titulo="Em execução" valor={emExec} cor="text-amber-600" />
        <Stat titulo="Execução total" valor={concluidas} cor="text-green-600" />
      </div>

      {/* Gráficos */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Barras titulo="Ordens de serviço por etapa" dados={barrasStatus} />
        <Barras titulo="Ordens de serviço por prioridade" dados={barrasPrioridade} />
        <Barras titulo="Ordens de serviço por categoria" dados={barrasCategoria} />
        <Barras titulo="Ordens por colaborador" dados={barrasColaborador} />
      </div>

      {/* Cadastros */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <Stat titulo="Clientes ativos" valor={totClientes} />
        <Stat titulo="Contratos" valor={totContratos} />
        <Stat titulo="Colaboradores ativos" valor={totColaboradores} />
      </div>
    </div>
  );
}
