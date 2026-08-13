import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import ColaboradorForm from "../colaborador-form";

export default async function EditarColaboradorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirAdmin();
  const { id } = await params;
  const colaborador = await prisma.colaborador.findUnique({ where: { id } });
  if (!colaborador) notFound();

  return (
    <div>
      <PageHeader titulo="Editar colaborador" subtitulo={colaborador.nome} />
      <ColaboradorForm colaborador={colaborador} />
    </div>
  );
}
