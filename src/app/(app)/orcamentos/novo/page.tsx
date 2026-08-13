import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader, EmptyState, BotaoLink } from "@/components/ui";
import OrcamentoForm from "../orcamento-form";

export default async function NovoOrcamentoPage() {
  await exigirAdmin();
  const clientes = await prisma.cliente.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });

  return (
    <div>
      <PageHeader titulo="Novo orçamento" subtitulo="Proposta de serviço para um cliente" />
      {clientes.length === 0 ? (
        <EmptyState
          titulo="Cadastre um cliente primeiro"
          descricao="É necessário ter ao menos um cliente ativo para criar um orçamento."
          acao={<BotaoLink href="/clientes/novo">+ Novo cliente</BotaoLink>}
        />
      ) : (
        <OrcamentoForm clientes={clientes} />
      )}
    </div>
  );
}
