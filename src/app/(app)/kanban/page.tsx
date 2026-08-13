import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/auth";
import { PageHeader, BotaoLink } from "@/components/ui";
import KanbanBoard from "./kanban-board";

export default async function KanbanPage() {
  const sessao = await exigirSessao();
  const ehAdmin = sessao.role === "ADMIN";

  const ordens = await prisma.ordemServico.findMany({
    where: ehAdmin
      ? {}
      : { colaboradorId: sessao.colaboradorId ?? "__nenhum__" },
    orderBy: [{ prioridade: "desc" }, { criadoEm: "desc" }],
    include: { cliente: true, colaborador: true },
  });

  const cards = ordens.map((os) => ({
    id: os.id,
    numero: os.numero,
    titulo: os.titulo,
    cliente: os.cliente.nome,
    colaborador: os.colaborador?.nome ?? null,
    prioridade: os.prioridade,
    categoria: os.categoria,
    status: os.status,
  }));

  return (
    <div>
      <PageHeader
        titulo="Quadro Kanban"
        subtitulo="Arraste os cards entre as colunas para atualizar o andamento"
        acao={<BotaoLink href="/ordens/novo">+ Nova OS</BotaoLink>}
      />
      <KanbanBoard cards={cards} />
    </div>
  );
}
