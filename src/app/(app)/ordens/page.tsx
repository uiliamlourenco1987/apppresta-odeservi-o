import Link from "next/link";
import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/auth";
import { PageHeader, BotaoLink, Badge, EmptyState } from "@/components/ui";
import {
  formatarData,
  STATUS_OS,
  PRIORIDADE_OS,
  TIPO_OS,
} from "@/lib/format";
import type { Prisma } from "@prisma/client";

export default async function OrdensPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    cliente?: string;
    colaborador?: string;
    prioridade?: string;
    q?: string;
  }>;
}) {
  const sessao = await exigirSessao();
  const sp = await searchParams;
  const ehAdmin = sessao.role === "ADMIN";

  const where: Prisma.OrdemServicoWhereInput = {};
  if (!ehAdmin) where.colaboradorId = sessao.colaboradorId ?? "__nenhum__";
  if (sp.status) where.status = sp.status;
  if (sp.cliente) where.clienteId = sp.cliente;
  if (ehAdmin && sp.colaborador) where.colaboradorId = sp.colaborador;
  if (sp.prioridade) where.prioridade = sp.prioridade;
  if (sp.q) {
    where.OR = [
      { titulo: { contains: sp.q } },
      { descricao: { contains: sp.q } },
    ];
  }

  const [ordens, clientes, colaboradores] = await Promise.all([
    prisma.ordemServico.findMany({
      where,
      orderBy: [{ status: "asc" }, { criadoEm: "desc" }],
      include: { cliente: true, colaborador: true },
    }),
    ehAdmin
      ? prisma.cliente.findMany({
          orderBy: { nome: "asc" },
          select: { id: true, nome: true },
        })
      : Promise.resolve([]),
    ehAdmin
      ? prisma.colaborador.findMany({
          orderBy: { nome: "asc" },
          select: { id: true, nome: true },
        })
      : Promise.resolve([]),
  ]);

  const filtroBase = (extra: Record<string, string>) => {
    const p = new URLSearchParams();
    if (sp.status) p.set("status", sp.status);
    if (sp.cliente) p.set("cliente", sp.cliente);
    if (sp.colaborador) p.set("colaborador", sp.colaborador);
    if (sp.prioridade) p.set("prioridade", sp.prioridade);
    if (sp.q) p.set("q", sp.q);
    for (const [k, v] of Object.entries(extra)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    const s = p.toString();
    return s ? `/ordens?${s}` : "/ordens";
  };

  return (
    <div>
      <PageHeader
        titulo="Ordens de Serviço"
        subtitulo={ehAdmin ? "Todas as manutenções" : "Suas manutenções"}
        acao={<BotaoLink href="/ordens/novo">+ Nova OS</BotaoLink>}
      />

      {/* Filtros por status */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href={filtroBase({ status: "" })}
          className={`badge ${!sp.status ? "bg-brand-600 text-white" : "bg-white text-gray-600 border border-gray-200"}`}
        >
          Todas
        </Link>
        {Object.entries(STATUS_OS).map(([key, v]) => (
          <Link
            key={key}
            href={filtroBase({ status: key })}
            className={`badge ${sp.status === key ? "bg-brand-600 text-white" : "bg-white text-gray-600 border border-gray-200"}`}
          >
            {v.label}
          </Link>
        ))}
      </div>

      {/* Busca e filtros adicionais */}
      <form className="card mb-4 flex flex-wrap items-center gap-3 p-3" method="get">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <input
          type="search"
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Buscar por título ou descrição"
          className="input max-w-xs flex-1"
        />
        <select
          name="prioridade"
          defaultValue={sp.prioridade ?? ""}
          className="input max-w-xs"
        >
          <option value="">Todas as prioridades</option>
          {Object.entries(PRIORIDADE_OS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        {ehAdmin && (
          <select name="cliente" defaultValue={sp.cliente ?? ""} className="input max-w-xs">
            <option value="">Todos os clientes</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        )}
        {ehAdmin && (
          <select
            name="colaborador"
            defaultValue={sp.colaborador ?? ""}
            className="input max-w-xs"
          >
            <option value="">Todos os colaboradores</option>
            {colaboradores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        )}
        <button className="btn-primary" type="submit">
          Filtrar
        </button>
        {(sp.q || sp.prioridade || sp.cliente || sp.colaborador) && (
          <Link
            href={filtroBase({ q: "", prioridade: "", cliente: "", colaborador: "" })}
            className="text-sm font-medium text-gray-500 hover:underline"
          >
            Limpar
          </Link>
        )}
        </form>

      {ordens.length === 0 ? (
        <EmptyState
          titulo="Nenhuma ordem de serviço"
          descricao="Registre chamados e manutenções para acompanhá-los aqui."
          acao={<BotaoLink href="/ordens/novo">+ Nova OS</BotaoLink>}
        />
      ) : (
        <div className="card divide-y divide-gray-100">
          {ordens.map((os) => {
            const st = STATUS_OS[os.status];
            const pr = PRIORIDADE_OS[os.prioridade];
            const atrasada =
              os.prazo &&
              new Date(os.prazo) < new Date() &&
              !["EXECUCAO_TOTAL", "CANCELADA"].includes(os.status);
            return (
              <Link
                key={os.id}
                href={`/ordens/${os.id}`}
                className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <span className="w-10 text-sm font-semibold text-gray-400">
                  #{os.numero}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">
                    {os.titulo}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {os.cliente.nome}
                    {os.local ? ` • ${os.local}` : ""}
                    {os.colaborador ? ` • ${os.colaborador.nome}` : " • não atribuída"}
                    {` • ${TIPO_OS[os.tipo]}`}
                  </p>
                </div>
                {atrasada && (
                  <Badge className="bg-red-100 text-red-800">Atrasada</Badge>
                )}
                <Badge className={pr.cor}>{pr.label}</Badge>
                <Badge className={st.cor}>{st.label}</Badge>
                <span className="hidden w-20 text-right text-xs text-gray-400 sm:block">
                  {formatarData(os.dataAbertura)}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
