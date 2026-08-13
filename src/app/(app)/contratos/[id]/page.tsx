import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import ContratoForm from "../contrato-form";

export default async function EditarContratoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirAdmin();
  const { id } = await params;
  const [contrato, clientes] = await Promise.all([
    prisma.contrato.findUnique({ where: { id }, include: { cliente: true } }),
    prisma.cliente.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);
  if (!contrato) notFound();

  // Garante que o cliente atual apareça na lista mesmo se estiver inativo.
  const listaClientes = clientes.some((c) => c.id === contrato.clienteId)
    ? clientes
    : [{ id: contrato.cliente.id, nome: contrato.cliente.nome }, ...clientes];

  return (
    <div>
      <PageHeader titulo="Editar contrato" subtitulo={contrato.cliente.nome} />
      <ContratoForm contrato={contrato} clientes={listaClientes} />
    </div>
  );
}
