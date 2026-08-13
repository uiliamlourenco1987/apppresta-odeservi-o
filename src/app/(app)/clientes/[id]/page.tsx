import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import ClienteForm from "../cliente-form";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirAdmin();
  const { id } = await params;
  const cliente = await prisma.cliente.findUnique({ where: { id } });
  if (!cliente) notFound();

  return (
    <div>
      <PageHeader titulo="Editar cliente" subtitulo={cliente.nome} />
      <ClienteForm cliente={cliente} />
    </div>
  );
}
