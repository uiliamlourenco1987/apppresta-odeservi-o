import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader, Badge, EmptyState } from "@/components/ui";
import FilterBar from "@/components/filter-bar";
import DeleteButton from "@/components/delete-button";
import { formatarMoeda, formatarData } from "@/lib/format";
import PagarForm from "./pagar-form";
import { marcarPagamento, excluirPagamento } from "./actions";

export default async function PagarPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; colaborador?: string }>;
}) {
  await exigirAdmin();
  const sp = await searchParams;

  const where: Prisma.PagamentoColaboradorWhereInput = {};
  if (sp.status) where.status = sp.status;
  if (sp.colaborador) where.colaboradorId = sp.colaborador;

  const [pagamentos, colaboradores] = await Promise.all([
    prisma.pagamentoColaborador.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      include: { colaborador: true, ordem: true },
    }),
    prisma.colaborador.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);

  const totalPendente = pagamentos
    .filter((p) => p.status === "PENDENTE")
    .reduce((s, p) => s + p.valor, 0);
  const totalPago = pagamentos
    .filter((p) => p.status === "PAGO")
    .reduce((s, p) => s + p.valor, 0);

  return (
    <div>
      <PageHeader
        titulo="Contas a Pagar"
        subtitulo="Valores a pagar aos colaboradores"
      />

      <PagarForm colaboradores={colaboradores} />

      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-sm text-gray-500">A pagar</p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            {formatarMoeda(totalPendente)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Pago</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {formatarMoeda(totalPago)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Lançamentos</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {pagamentos.length}
          </p>
        </div>
      </div>

      <FilterBar
        action="/financeiro/pagar"
        temFiltroAtivo={!!(sp.status || sp.colaborador)}
        campos={[
          {
            tipo: "select",
            name: "colaborador",
            valor: sp.colaborador,
            placeholderOpcao: "Todos os colaboradores",
            opcoes: colaboradores.map((c) => ({ valor: c.id, label: c.nome })),
          },
          {
            tipo: "select",
            name: "status",
            valor: sp.status,
            placeholderOpcao: "Todos os status",
            opcoes: [
              { valor: "PENDENTE", label: "Pendente" },
              { valor: "PAGO", label: "Pago" },
            ],
          },
        ]}
      />

      {pagamentos.length === 0 ? (
        <EmptyState
          titulo="Nenhum lançamento"
          descricao="Adicione valores a pagar aos colaboradores usando o formulário acima."
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Colaborador</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagamentos.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.colaborador.nome}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.descricao}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatarData(p.data)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {formatarMoeda(p.valor)}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === "PAGO" ? (
                      <Badge className="bg-green-100 text-green-800">Pago</Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800">Pendente</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {p.status !== "PAGO" ? (
                        <form action={marcarPagamento.bind(null, p.id, "PAGO")}>
                          <button className="text-sm font-medium text-green-600 hover:underline">
                            Marcar pago
                          </button>
                        </form>
                      ) : (
                        <form action={marcarPagamento.bind(null, p.id, "PENDENTE")}>
                          <button className="text-sm font-medium text-gray-500 hover:underline">
                            Reabrir
                          </button>
                        </form>
                      )}
                      <DeleteButton
                        action={excluirPagamento.bind(null, p.id)}
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
