import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader, Badge, EmptyState } from "@/components/ui";
import FilterBar from "@/components/filter-bar";
import DeleteButton from "@/components/delete-button";
import { formatarMoeda, formatarData } from "@/lib/format";
import ReceberToolbar from "./receber-toolbar";
import { marcarRecebimento, excluirRecebimento } from "./actions";

const STATUS: Record<string, { label: string; cor: string }> = {
  PENDENTE: { label: "Pendente", cor: "bg-amber-100 text-amber-800" },
  PAGO: { label: "Pago", cor: "bg-green-100 text-green-800" },
  ATRASADO: { label: "Atrasado", cor: "bg-red-100 text-red-800" },
};

export default async function ReceberPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; cliente?: string; competencia?: string }>;
}) {
  await exigirAdmin();
  const sp = await searchParams;
  const hoje = new Date();
  const competenciaAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

  const where: Prisma.RecebimentoWhereInput = {};
  if (sp.status) where.status = sp.status;
  if (sp.competencia) where.competencia = sp.competencia;
  if (sp.cliente) where.contrato = { clienteId: sp.cliente };

  const [recebimentos, clientes] = await Promise.all([
    prisma.recebimento.findMany({
      where,
      orderBy: [{ vencimento: "asc" }],
      include: { contrato: { include: { cliente: true } } },
    }),
    prisma.cliente.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);

  const totalPendente = recebimentos
    .filter((r) => r.status !== "PAGO")
    .reduce((s, r) => s + r.valor, 0);
  const totalPago = recebimentos
    .filter((r) => r.status === "PAGO")
    .reduce((s, r) => s + r.valor, 0);

  return (
    <div>
      <PageHeader
        titulo="Contas a Receber"
        subtitulo="Mensalidades e valores a receber por contrato"
      />

      <ReceberToolbar competenciaAtual={competenciaAtual} />

      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Em aberto</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {formatarMoeda(totalPendente)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Recebido</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {formatarMoeda(totalPago)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Lançamentos</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {recebimentos.length}
          </p>
        </div>
      </div>

      <FilterBar
        action="/financeiro/receber"
        temFiltroAtivo={!!(sp.status || sp.cliente || sp.competencia)}
        campos={[
          {
            tipo: "select",
            name: "cliente",
            valor: sp.cliente,
            placeholderOpcao: "Todos os clientes",
            opcoes: clientes.map((c) => ({ valor: c.id, label: c.nome })),
          },
          {
            tipo: "select",
            name: "status",
            valor: sp.status,
            placeholderOpcao: "Todos os status",
            opcoes: [
              { valor: "PENDENTE", label: "Pendente" },
              { valor: "PAGO", label: "Pago" },
              { valor: "ATRASADO", label: "Atrasado" },
            ],
          },
        ]}
      />

      {recebimentos.length === 0 ? (
        <EmptyState
          titulo="Nenhum recebimento"
          descricao="Gere as mensalidades do mês para começar a controlar o que há a receber."
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Cliente / contrato</th>
                <th className="px-4 py-3">Competência</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recebimentos.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {r.contrato.cliente.nome}
                    </p>
                    <p className="text-xs text-gray-400">{r.contrato.descricao}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.competencia}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatarData(r.vencimento)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {formatarMoeda(r.valor)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS[r.status]?.cor ?? ""}>
                      {STATUS[r.status]?.label ?? r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {r.status !== "PAGO" ? (
                        <form action={marcarRecebimento.bind(null, r.id, "PAGO")}>
                          <button className="text-sm font-medium text-green-600 hover:underline">
                            Dar baixa
                          </button>
                        </form>
                      ) : (
                        <form action={marcarRecebimento.bind(null, r.id, "PENDENTE")}>
                          <button className="text-sm font-medium text-gray-500 hover:underline">
                            Reabrir
                          </button>
                        </form>
                      )}
                      <DeleteButton
                        action={excluirRecebimento.bind(null, r.id)}
                        label="Excluir"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
