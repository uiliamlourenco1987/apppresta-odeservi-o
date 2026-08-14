import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader, EmptyState, BotaoLink } from "@/components/ui";
import PreventivaForm from "../preventiva-form";

export default async function NovaPreventivaPage() {
  await exigirAdmin();
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
    nome: `${c.cliente.nome} — ${c.descricao}`,
  }));

  return (
    <div>
      <PageHeader titulo="Nova preventiva" subtitulo="Manutenção recorrente" />
      {clientes.length === 0 ? (
        <EmptyState
          titulo="Cadastre um cliente primeiro"
          descricao="É necessário ter ao menos um cliente ativo."
          acao={<BotaoLink href="/clientes/novo">+ Novo cliente</BotaoLink>}
        />
      ) : (
        <PreventivaForm
          clientes={clientes}
          contratos={contratoOpcoes}
          colaboradores={colaboradores}
        />
      )}
    </div>
  );
}
