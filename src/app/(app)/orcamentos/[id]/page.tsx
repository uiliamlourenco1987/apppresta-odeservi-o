import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import DeleteButton from "@/components/delete-button";
import OrcamentoForm from "../orcamento-form";
import { excluirOrcamento } from "../actions";

export default async function EditarOrcamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirAdmin();
  const { id } = await params;
  const [orcamento, clientes] = await Promise.all([
    prisma.orcamento.findUnique({ where: { id }, include: { cliente: true } }),
    prisma.cliente.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);
  if (!orcamento) notFound();

  const lista = clientes.some((c) => c.id === orcamento.clienteId)
    ? clientes
    : [{ id: orcamento.cliente.id, nome: orcamento.cliente.nome }, ...clientes];

  return (
    <div>
      <PageHeader
        titulo={`Orçamento #${orcamento.numero}`}
        subtitulo={orcamento.cliente.nome}
        acao={
          <DeleteButton
            action={excluirOrcamento.bind(null, orcamento.id)}
            label="Excluir"
          />
        }
      />
      <OrcamentoForm orcamento={orcamento} clientes={lista} />
    </div>
  );
}
