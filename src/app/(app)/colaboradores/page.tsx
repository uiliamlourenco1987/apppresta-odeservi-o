import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader, BotaoLink, Badge, EmptyState } from "@/components/ui";
import FilterBar from "@/components/filter-bar";
import DeleteButton from "@/components/delete-button";
import { formatarMoeda, TIPO_COLABORADOR } from "@/lib/format";
import { excluirColaborador } from "./actions";

export default async function ColaboradoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tipo?: string; status?: string }>;
}) {
  await exigirAdmin();
  const sp = await searchParams;

  const where: Prisma.ColaboradorWhereInput = {};
  if (sp.q) {
    where.OR = [
      { nome: { contains: sp.q } },
      { funcao: { contains: sp.q } },
    ];
  }
  if (sp.tipo) where.tipo = sp.tipo;
  if (sp.status === "ativo") where.ativo = true;
  if (sp.status === "inativo") where.ativo = false;

  const colaboradores = await prisma.colaborador.findMany({
    where,
    orderBy: { nome: "asc" },
    include: { _count: { select: { ordens: true } } },
  });

  return (
    <div>
      <PageHeader
        titulo="Colaboradores"
        subtitulo="Equipe e prestadores de serviço"
        acao={
          <BotaoLink href="/colaboradores/novo">+ Novo colaborador</BotaoLink>
        }
      />

      <FilterBar
        action="/colaboradores"
        temFiltroAtivo={!!(sp.q || sp.tipo || sp.status)}
        campos={[
          { tipo: "busca", name: "q", placeholder: "Buscar por nome ou função", valor: sp.q },
          {
            tipo: "select",
            name: "tipo",
            valor: sp.tipo,
            placeholderOpcao: "Todos os tipos",
            opcoes: [
              { valor: "CLT", label: "CLT" },
              { valor: "PRESTADOR", label: "Prestador" },
            ],
          },
          {
            tipo: "select",
            name: "status",
            valor: sp.status,
            placeholderOpcao: "Todos os status",
            opcoes: [
              { valor: "ativo", label: "Ativos" },
              { valor: "inativo", label: "Inativos" },
            ],
          },
        ]}
      />

      {colaboradores.length === 0 ? (
        <EmptyState
          titulo="Nenhum colaborador encontrado"
          descricao="Ajuste os filtros ou cadastre um novo colaborador."
          acao={
            <BotaoLink href="/colaboradores/novo">+ Novo colaborador</BotaoLink>
          }
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Função</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Valor padrão</th>
                <th className="px-4 py-3">OS</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {colaboradores.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/colaboradores/${c.id}`}
                      className="font-medium text-gray-900 hover:text-brand-600"
                    >
                      {c.nome}
                    </Link>
                    {c.telefone && (
                      <p className="text-xs text-gray-400">{c.telefone}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.funcao || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {TIPO_COLABORADOR[c.tipo] ?? c.tipo}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatarMoeda(c.valorPadrao)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c._count.ordens}</td>
                  <td className="px-4 py-3">
                    {c.ativo ? (
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    ) : (
                      <Badge className="bg-gray-200 text-gray-600">Inativo</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/colaboradores/${c.id}`}
                        className="text-sm font-medium text-brand-600 hover:underline"
                      >
                        Editar
                      </Link>
                      <DeleteButton
                        action={excluirColaborador.bind(null, c.id)}
                        label={c._count.ordens > 0 ? "Inativar" : "Excluir"}
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
