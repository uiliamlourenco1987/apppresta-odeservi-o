import Link from "next/link";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader, BotaoLink, Badge, EmptyState } from "@/components/ui";
import DeleteButton from "@/components/delete-button";
import { formatarMoeda, TIPO_COLABORADOR } from "@/lib/format";
import { excluirColaborador } from "./actions";

export default async function ColaboradoresPage() {
  await exigirAdmin();
  const colaboradores = await prisma.colaborador.findMany({
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

      {colaboradores.length === 0 ? (
        <EmptyState
          titulo="Nenhum colaborador cadastrado"
          descricao="Cadastre a equipe que executa as manutenções."
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
