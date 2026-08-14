import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import PreventivaForm from "../preventiva-form";

export default async function EditarPreventivaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirAdmin();
  const { id } = await params;
  const [preventiva, clientes, contratos, colaboradores] = await Promise.all([
    prisma.preventiva.findUnique({ where: { id } }),
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
  if (!preventiva) notFound();

  const contratoOpcoes = contratos.map((c) => ({
    id: c.id,
    nome: `${c.cliente.nome} — ${c.descricao}`,
  }));

  return (
    <div>
      <PageHeader titulo="Editar preventiva" subtitulo={preventiva.titulo} />
      <PreventivaForm
        preventiva={preventiva}
        clientes={clientes}
        contratos={contratoOpcoes}
        colaboradores={colaboradores}
      />
    </div>
  );
}
