import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader, BotaoLink, Badge, EmptyState } from "@/components/ui";
import FilterBar from "@/components/filter-bar";
import DeleteButton from "@/components/delete-button";
import { excluirCliente } from "./actions";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await exigirAdmin();
  const sp = await searchParams;

  const where: Prisma.ClienteWhereInput = {};
  if (sp.q) {
    where.OR = [
      { nome: { contains: sp.q } },
      { sindico: { contains: sp.q } },
      { cnpj: { contains: sp.q } },
    ];
  }
  if (sp.status === "ativo") where.ativo = true;
  if (sp.status === "inativo") where.ativo = false;

  const clientes = await prisma.cliente.findMany({
    where,
    orderBy: { nome: "asc" },
    include: { _count: { select: { contratos: true, ordens: true } } },
  });

  return (
    <div>
      <PageHeader
        titulo="Clientes"
        subtitulo="Condomínios e prédios atendidos"
        acao={<BotaoLink href="/clientes/novo">+ Novo cliente</BotaoLink>}
      />

      <FilterBar
        action="/clientes"
        temFiltroAtivo={!!(sp.q || sp.status)}
        campos={[
          { tipo: "busca", name: "q", placeholder: "Buscar por nome, síndico ou CNPJ", valor: sp.q },
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

      {clientes.length === 0 ? (
        <EmptyState
          titulo="Nenhum cliente encontrado"
          descricao="Ajuste os filtros ou cadastre um novo cliente."
          acao={<BotaoLink href="/clientes/novo">+ Novo cliente</BotaoLink>}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Contratos</th>
                <th className="px-4 py-3">OS</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/clientes/${c.id}`}
                      className="font-medium text-gray-900 hover:text-brand-600"
                    >
                      {c.nome}
                    </Link>
                    {c.endereco && (
                      <p className="text-xs text-gray-400">{c.endereco}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.sindico || "—"}
                    {c.telefone && (
                      <p className="text-xs text-gray-400">{c.telefone}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c._count.contratos}
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
                        href={`/clientes/${c.id}`}
                        className="text-sm font-medium text-brand-600 hover:underline"
                      >
                        Editar
                      </Link>
                      <DeleteButton
                        action={excluirCliente.bind(null, c.id)}
                        label={
                          c._count.contratos + c._count.ordens > 0
                            ? "Inativar"
                            : "Excluir"
                        }
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
