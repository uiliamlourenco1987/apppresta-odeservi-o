import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/auth";
import { PageHeader, EmptyState, BotaoLink } from "@/components/ui";
import OrdemForm from "../ordem-form";

export default async function NovaOrdemPage() {
  const sessao = await exigirSessao();

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
      <PageHeader titulo="Nova ordem de serviço" subtitulo="Registrar manutenção" />
      {clientes.length === 0 ? (
        <EmptyState
          titulo="Cadastre um cliente primeiro"
          descricao="É necessário ter ao menos um cliente ativo para abrir uma OS."
          acao={<BotaoLink href="/clientes/novo">+ Novo cliente</BotaoLink>}
        />
      ) : (
        <OrdemForm
          clientes={clientes}
          contratos={contratoOpcoes}
          colaboradores={colaboradores}
          role={sessao.role}
        />
      )}
    </div>
  );
}
