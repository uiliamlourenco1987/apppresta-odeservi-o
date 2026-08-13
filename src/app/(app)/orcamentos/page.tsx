import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader, BotaoLink, EmptyState } from "@/components/ui";
import { formatarMoeda } from "@/lib/format";
import OrcamentoBoard from "./orcamento-board";

export default async function OrcamentosPage() {
  await exigirAdmin();
  const orcamentos = await prisma.orcamento.findMany({
    orderBy: { criadoEm: "desc" },
    include: { cliente: true },
  });

  const cards = orcamentos.map((o) => ({
    id: o.id,
    numero: o.numero,
    titulo: o.titulo,
    cliente: o.cliente.nome,
    valor: formatarMoeda(o.valor),
    status: o.status,
  }));

  const totalAprovado = orcamentos
    .filter((o) => o.status === "APROVADO")
    .reduce((s, o) => s + o.valor, 0);

  return (
    <div>
      <PageHeader
        titulo="Quadro de Orçamentos"
        subtitulo={`Aprovados: ${formatarMoeda(totalAprovado)} • arraste os cards entre as colunas`}
        acao={<BotaoLink href="/orcamentos/novo">+ Novo orçamento</BotaoLink>}
      />

      {orcamentos.length === 0 ? (
        <EmptyState
          titulo="Nenhum orçamento"
          descricao="Crie orçamentos para os clientes e acompanhe a aprovação no quadro."
          acao={<BotaoLink href="/orcamentos/novo">+ Novo orçamento</BotaoLink>}
        />
      ) : (
        <OrcamentoBoard cards={cards} />
      )}
    </div>
  );
}
