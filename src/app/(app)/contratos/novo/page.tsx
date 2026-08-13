import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader, EmptyState, BotaoLink } from "@/components/ui";
import ContratoForm from "../contrato-form";

export default async function NovoContratoPage() {
  await exigirAdmin();
  const clientes = await prisma.cliente.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });

  return (
    <div>
      <PageHeader titulo="Novo contrato" subtitulo="Vincular contrato a um cliente" />
      {clientes.length === 0 ? (
        <EmptyState
          titulo="Cadastre um cliente primeiro"
          descricao="Você precisa ter ao menos um cliente ativo para criar um contrato."
          acao={<BotaoLink href="/clientes/novo">+ Novo cliente</BotaoLink>}
        />
      ) : (
        <ContratoForm clientes={clientes} />
      )}
    </div>
  );
}
