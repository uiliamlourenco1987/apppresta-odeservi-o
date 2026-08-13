import Link from "next/link";
import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/auth";
import { PageHeader, Badge } from "@/components/ui";
import { formatarData, STATUS_OS, PRIORIDADE_OS } from "@/lib/format";

function Stat({
  titulo,
  valor,
  cor,
}: {
  titulo: string;
  valor: string | number;
  cor: string;
}) {
  return (
    <div className="card p-5">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className={`mt-1 text-3xl font-bold ${cor}`}>{valor}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const sessao = await exigirSessao();
  const soDoColaborador =
    sessao.role === "COLABORADOR" && sessao.colaboradorId
      ? { colaboradorId: sessao.colaboradorId }
      : {};

  const [abertas, andamento, concluidas, contratosAtivos, ultimas] =
    await Promise.all([
      prisma.ordemServico.count({
        where: {
          status: { in: ["CHAMADO", "OS_ABERTA"] },
          ...soDoColaborador,
        },
      }),
      prisma.ordemServico.count({
        where: {
          status: { in: ["EM_EXECUCAO", "EXECUCAO_PARCIAL"] },
          ...soDoColaborador,
        },
      }),
      prisma.ordemServico.count({
        where: { status: "EXECUCAO_TOTAL", ...soDoColaborador },
      }),
      sessao.role === "ADMIN"
        ? prisma.contrato.count({ where: { status: "ATIVO" } })
        : Promise.resolve(0),
      prisma.ordemServico.findMany({
        where: { ...soDoColaborador },
        orderBy: { criadoEm: "desc" },
        take: 8,
        include: { cliente: true, colaborador: true },
      }),
    ]);

  return (
    <div>
      <PageHeader
        titulo={`Olá, ${sessao.nome.split(" ")[0]} 👋`}
        subtitulo="Resumo das suas operações"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat titulo="Chamados / abertas" valor={abertas} cor="text-blue-600" />
        <Stat titulo="Em execução" valor={andamento} cor="text-amber-600" />
        <Stat titulo="Execução total" valor={concluidas} cor="text-green-600" />
        {sessao.role === "ADMIN" && (
          <Stat
            titulo="Contratos ativos"
            valor={contratosAtivos}
            cor="text-brand-600"
          />
        )}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Últimas ordens de serviço
          </h2>
          <Link
            href="/ordens"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Ver todas →
          </Link>
        </div>

        {ultimas.length === 0 ? (
          <div className="card p-8 text-center text-sm text-gray-500">
            Nenhuma ordem de serviço ainda.
          </div>
        ) : (
          <div className="card divide-y divide-gray-100">
            {ultimas.map((os) => {
              const st = STATUS_OS[os.status];
              const pr = PRIORIDADE_OS[os.prioridade];
              return (
                <Link
                  key={os.id}
                  href={`/ordens/${os.id}`}
                  className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-gray-50"
                >
                  <span className="text-sm font-semibold text-gray-400">
                    #{os.numero}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {os.titulo}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {os.cliente.nome}
                      {os.colaborador ? ` • ${os.colaborador.nome}` : ""}
                    </p>
                  </div>
                  <Badge className={pr.cor}>{pr.label}</Badge>
                  <Badge className={st.cor}>{st.label}</Badge>
                  <span className="text-xs text-gray-400">
                    {formatarData(os.dataAbertura)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
