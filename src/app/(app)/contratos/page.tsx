import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader, BotaoLink, Badge, EmptyState } from "@/components/ui";
import FilterBar from "@/components/filter-bar";
import DeleteButton from "@/components/delete-button";
import { formatarMoeda, formatarData, STATUS_CONTRATO } from "@/lib/format";
import { excluirContrato } from "./actions";

const CORES_STATUS: Record<string, string> = {
  ATIVO: "bg-green-100 text-green-800",
  SUSPENSO: "bg-amber-100 text-amber-800",
  ENCERRADO: "bg-gray-200 text-gray-600",
};

export default async function ContratosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; cliente?: string }>;
}) {
  await exigirAdmin();
  const sp = await searchParams;

  const where: Prisma.ContratoWhereInput = {};
  if (sp.q) {
    where.OR = [
      { descricao: { contains: sp.q } },
      { cliente: { nome: { contains: sp.q } } },
    ];
  }
  if (sp.status) where.status = sp.status;
  if (sp.cliente) where.clienteId = sp.cliente;

  const [contratos, clientes] = await Promise.all([
    prisma.contrato.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      include: { cliente: true, _count: { select: { ordens: true } } },
    }),
    prisma.cliente.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);

  const totalMensal = contratos
    .filter((c) => c.status === "ATIVO")
    .reduce((s, c) => s + c.valorMensal, 0);

  return (
    <div>
      <PageHeader
        titulo="Contratos"
        subtitulo={`Receita mensal ativa: ${formatarMoeda(totalMensal)}`}
        acao={<BotaoLink href="/contratos/novo">+ Novo contrato</BotaoLink>}
      />

      <FilterBar
        action="/contratos"
        temFiltroAtivo={!!(sp.q || sp.status || sp.cliente)}
        campos={[
          { tipo: "busca", name: "q", placeholder: "Buscar por cliente ou descrição", valor: sp.q },
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
              { valor: "ATIVO", label: "Ativo" },
              { valor: "SUSPENSO", label: "Suspenso" },
              { valor: "ENCERRADO", label: "Encerrado" },
            ],
          },
        ]}
      />

      {contratos.length === 0 ? (
        <EmptyState
          titulo="Nenhum contrato encontrado"
          descricao="Ajuste os filtros ou cadastre um novo contrato."
          acao={<BotaoLink href="/contratos/novo">+ Novo contrato</BotaoLink>}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Cliente / descrição</th>
                <th className="px-4 py-3">Valor mensal</th>
                <th className="px-4 py-3">Venc.</th>
                <th className="px-4 py-3">Início</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contratos.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/contratos/${c.id}`}
                      className="font-medium text-gray-900 hover:text-brand-600"
                    >
                      {c.cliente.nome}
                    </Link>
                    <p className="text-xs text-gray-400">{c.descricao}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatarMoeda(c.valorMensal)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">dia {c.diaVencimento}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatarData(c.dataInicio)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={CORES_STATUS[c.status] ?? ""}>
                      {STATUS_CONTRATO[c.status] ?? c.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/contratos/${c.id}`}
                        className="text-sm font-medium text-brand-600 hover:underline"
                      >
                        Editar
                      </Link>
                      <DeleteButton
                        action={excluirContrato.bind(null, c.id)}
                        label={c._count.ordens > 0 ? "Encerrar" : "Excluir"}
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
