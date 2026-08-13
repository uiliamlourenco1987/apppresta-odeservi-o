import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import {
  formatarMoeda,
  STATUS_OS,
  KANBAN_COLUNAS,
  CATEGORIA_LABEL,
} from "@/lib/format";
import PrintButton from "./print-button";

function Linha({ label, valor }: { label: string; valor: string | number }) {
  return (
    <div className="flex justify-between border-b border-gray-100 py-2 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{valor}</span>
    </div>
  );
}

export default async function RelatoriosPage() {
  await exigirAdmin();

  const [
    porStatus,
    porCategoria,
    receita,
    custoOS,
    recPend,
    recPago,
    pagPend,
    pagPago,
    totOS,
  ] = await Promise.all([
    prisma.ordemServico.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.ordemServico.groupBy({ by: ["categoria"], _count: { _all: true } }),
    prisma.contrato.aggregate({ where: { status: "ATIVO" }, _sum: { valorMensal: true } }),
    prisma.ordemServico.aggregate({ _sum: { custo: true } }),
    prisma.recebimento.aggregate({ where: { status: { not: "PAGO" } }, _sum: { valor: true } }),
    prisma.recebimento.aggregate({ where: { status: "PAGO" }, _sum: { valor: true } }),
    prisma.pagamentoColaborador.aggregate({ where: { status: "PENDENTE" }, _sum: { valor: true } }),
    prisma.pagamentoColaborador.aggregate({ where: { status: "PAGO" }, _sum: { valor: true } }),
    prisma.ordemServico.count(),
  ]);

  const statusMap = new Map(porStatus.map((s) => [s.status, s._count._all]));

  return (
    <div>
      <PageHeader
        titulo="Relatórios"
        subtitulo="Resumo consolidado e exportação de dados"
        acao={
          <div className="flex flex-wrap gap-2 print:hidden">
            <a href="/api/relatorios/os" className="btn-secondary">
              ⬇ Exportar OS (CSV)
            </a>
            <a href="/api/relatorios/financeiro" className="btn-secondary">
              ⬇ Exportar Financeiro (CSV)
            </a>
            <PrintButton />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Financeiro</h3>
          <Linha label="Receita mensal contratada" valor={formatarMoeda(receita._sum.valorMensal ?? 0)} />
          <Linha label="A receber (em aberto)" valor={formatarMoeda(recPend._sum.valor ?? 0)} />
          <Linha label="Já recebido" valor={formatarMoeda(recPago._sum.valor ?? 0)} />
          <Linha label="A pagar colaboradores" valor={formatarMoeda(pagPend._sum.valor ?? 0)} />
          <Linha label="Já pago" valor={formatarMoeda(pagPago._sum.valor ?? 0)} />
          <Linha label="Custo total das OS" valor={formatarMoeda(custoOS._sum.custo ?? 0)} />
        </div>

        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            Ordens de serviço ({totOS})
          </h3>
          {KANBAN_COLUNAS.map((st) => (
            <Linha key={st} label={STATUS_OS[st].label} valor={statusMap.get(st) ?? 0} />
          ))}
        </div>

        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Por categoria</h3>
          {porCategoria.length === 0 ? (
            <p className="text-sm text-gray-400">Sem dados.</p>
          ) : (
            porCategoria
              .sort((a, b) => b._count._all - a._count._all)
              .map((c) => (
                <Linha
                  key={c.categoria ?? "sem"}
                  label={c.categoria ? CATEGORIA_LABEL[c.categoria] ?? c.categoria : "Sem categoria"}
                  valor={c._count._all}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
}
