import Link from "next/link";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader, BotaoLink, Badge, EmptyState } from "@/components/ui";
import DeleteButton from "@/components/delete-button";
import { formatarData, FREQUENCIA, CATEGORIA_LABEL } from "@/lib/format";
import { gerarOSPreventiva, excluirPreventiva } from "./actions";

export default async function AgendaPage() {
  await exigirAdmin();
  const preventivas = await prisma.preventiva.findMany({
    where: { ativo: true },
    orderBy: { proximaData: "asc" },
    include: { cliente: true, colaborador: true },
  });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const limite30 = new Date(hoje);
  limite30.setDate(limite30.getDate() + 30);

  const vencidas = preventivas.filter((p) => p.proximaData < hoje);
  const proximas = preventivas.filter(
    (p) => p.proximaData >= hoje && p.proximaData <= limite30
  );

  return (
    <div>
      <PageHeader
        titulo="Agenda de Preventivas"
        subtitulo="Manutenções preventivas com recorrência automática"
        acao={<BotaoLink href="/agenda/nova">+ Nova preventiva</BotaoLink>}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Vencidas</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{vencidas.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Próximos 30 dias</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{proximas.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Ativas</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{preventivas.length}</p>
        </div>
      </div>

      {preventivas.length === 0 ? (
        <EmptyState
          titulo="Nenhuma preventiva cadastrada"
          descricao="Cadastre manutenções recorrentes (inspeções, limpezas) para não perder os prazos."
          acao={<BotaoLink href="/agenda/nova">+ Nova preventiva</BotaoLink>}
        />
      ) : (
        <div className="card divide-y divide-gray-100">
          {preventivas.map((p) => {
            const vencida = p.proximaData < hoje;
            const proxima = !vencida && p.proximaData <= limite30;
            return (
              <div key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div
                  className={`flex h-12 w-12 flex-col items-center justify-center rounded-lg text-center ${
                    vencida
                      ? "bg-red-50 text-red-700"
                      : proxima
                        ? "bg-amber-50 text-amber-700"
                        : "bg-gray-50 text-gray-600"
                  }`}
                >
                  <span className="text-sm font-bold leading-none">
                    {p.proximaData.getDate()}
                  </span>
                  <span className="text-[10px] uppercase">
                    {p.proximaData.toLocaleDateString("pt-BR", { month: "short" })}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">{p.titulo}</p>
                  <p className="truncate text-xs text-gray-500">
                    {p.cliente.nome}
                    {p.categoria ? ` • ${CATEGORIA_LABEL[p.categoria] ?? p.categoria}` : ""}
                    {p.colaborador ? ` • ${p.colaborador.nome}` : ""}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  {FREQUENCIA[p.frequencia]?.label ?? p.frequencia}
                </Badge>
                {vencida && <Badge className="bg-red-100 text-red-800">Vencida</Badge>}
                <span className="hidden text-xs text-gray-400 sm:block">
                  {formatarData(p.proximaData)}
                </span>
                <div className="flex items-center gap-3">
                  <form action={gerarOSPreventiva.bind(null, p.id)}>
                    <button className="text-sm font-medium text-brand-600 hover:underline">
                      Gerar OS
                    </button>
                  </form>
                  <Link
                    href={`/agenda/${p.id}`}
                    className="text-sm font-medium text-gray-500 hover:underline"
                  >
                    Editar
                  </Link>
                  <DeleteButton action={excluirPreventiva.bind(null, p.id)} label="Excluir" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
