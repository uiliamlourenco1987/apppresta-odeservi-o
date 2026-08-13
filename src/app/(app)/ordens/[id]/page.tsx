import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/auth";
import { PageHeader, Badge } from "@/components/ui";
import DeleteButton from "@/components/delete-button";
import { STATUS_OS } from "@/lib/format";
import OrdemForm from "../ordem-form";
import { mudarStatusOrdem, excluirOrdem } from "../actions";

export default async function EditarOrdemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sessao = await exigirSessao();
  const { id } = await params;

  const ordem = await prisma.ordemServico.findUnique({
    where: { id },
    include: { cliente: true },
  });
  if (!ordem) notFound();

  const ehAdmin = sessao.role === "ADMIN";
  if (!ehAdmin && ordem.colaboradorId !== sessao.colaboradorId) {
    notFound();
  }

  const [clientes, contratos, colaboradores] = await Promise.all([
    prisma.cliente.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    prisma.contrato.findMany({
      where: { status: "ATIVO" },
      orderBy: { criadoEm: "desc" },
      include: { cliente: true },
    }),
    prisma.colaborador.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);

  const contratoOpcoes = contratos.map((c) => ({
    id: c.id,
    clienteId: c.clienteId,
    nome: `${c.cliente.nome} — ${c.descricao}`,
  }));

  return (
    <div>
      <PageHeader
        titulo={`OS #${ordem.numero}`}
        subtitulo={`${ordem.cliente.nome} • ${ordem.titulo}`}
        acao={
          ehAdmin ? (
            <DeleteButton action={excluirOrdem.bind(null, ordem.id)} label="Excluir OS" />
          ) : undefined
        }
      />

      {/* Mudança rápida de status */}
      <div className="card mb-6 p-4">
        <p className="mb-3 text-sm font-medium text-gray-700">Alterar status</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_OS).map(([key, v]) => {
            const ativo = ordem.status === key;
            return (
              <form key={key} action={mudarStatusOrdem.bind(null, ordem.id, key)}>
                <button
                  type="submit"
                  className={`badge cursor-pointer border ${
                    ativo
                      ? `${v.cor} border-transparent ring-2 ring-brand-300`
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {v.label}
                </button>
              </form>
            );
          })}
          <span className="ml-auto flex items-center">
            <Badge className={STATUS_OS[ordem.status].cor}>
              Atual: {STATUS_OS[ordem.status].label}
            </Badge>
          </span>
        </div>
      </div>

      <OrdemForm
        ordem={ordem}
        clientes={clientes}
        contratos={contratoOpcoes}
        colaboradores={colaboradores}
        role={sessao.role}
      />
    </div>
  );
}
