"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { exigirSessao, exigirAdmin } from "@/lib/auth";

const STATUS = [
  "CHAMADO",
  "OS_ABERTA",
  "EM_EXECUCAO",
  "EXECUCAO_PARCIAL",
  "EXECUCAO_TOTAL",
  "CANCELADA",
] as const;

const schema = z.object({
  clienteId: z.string().min(1, "Selecione o cliente."),
  contratoId: z.string().optional(),
  colaboradorId: z.string().optional(),
  tipo: z.enum(["PREVENTIVA", "CORRETIVA"]),
  categoria: z.string().optional(),
  titulo: z.string().trim().min(1, "Informe o título."),
  descricao: z.string().trim().optional(),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA", "URGENTE"]),
  status: z.enum(STATUS),
  custo: z.coerce.number().min(0).default(0),
  dataAgendada: z.string().optional(),
  dataConclusao: z.string().optional(),
  observacoes: z.string().trim().optional(),
});

function ler(formData: FormData) {
  return schema.safeParse({
    clienteId: formData.get("clienteId"),
    contratoId: formData.get("contratoId") || undefined,
    colaboradorId: formData.get("colaboradorId") || undefined,
    tipo: formData.get("tipo"),
    categoria: formData.get("categoria") || undefined,
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao") || undefined,
    prioridade: formData.get("prioridade"),
    status: formData.get("status"),
    custo: formData.get("custo") || 0,
    dataAgendada: formData.get("dataAgendada") || undefined,
    dataConclusao: formData.get("dataConclusao") || undefined,
    observacoes: formData.get("observacoes") || undefined,
  });
}

export async function salvarOrdem(
  id: string | null,
  _prev: { erro?: string } | undefined,
  formData: FormData
): Promise<{ erro?: string }> {
  const sessao = await exigirSessao();
  const parsed = ler(formData);
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  const ehColaborador = sessao.role === "COLABORADOR";

  const data = {
    clienteId: d.clienteId,
    contratoId: d.contratoId || null,
    // Colaborador só pode atribuir a si mesmo.
    colaboradorId: ehColaborador
      ? sessao.colaboradorId
      : d.colaboradorId || null,
    tipo: d.tipo,
    categoria: d.categoria || null,
    titulo: d.titulo,
    descricao: d.descricao,
    prioridade: d.prioridade,
    status: d.status,
    custo: d.custo,
    dataAgendada: d.dataAgendada ? new Date(d.dataAgendada) : null,
    dataConclusao:
      d.status === "EXECUCAO_TOTAL"
        ? d.dataConclusao
          ? new Date(d.dataConclusao)
          : new Date()
        : d.dataConclusao
          ? new Date(d.dataConclusao)
          : null,
    observacoes: d.observacoes,
  };

  if (id) {
    const existente = await prisma.ordemServico.findUnique({ where: { id } });
    if (!existente) return { erro: "Ordem não encontrada." };
    if (ehColaborador && existente.colaboradorId !== sessao.colaboradorId) {
      return { erro: "Você não tem permissão para editar esta ordem." };
    }
    await prisma.ordemServico.update({ where: { id }, data });
  } else {
    const ultimo = await prisma.ordemServico.aggregate({
      _max: { numero: true },
    });
    const numero = (ultimo._max.numero ?? 0) + 1;
    await prisma.ordemServico.create({ data: { ...data, numero } });
  }

  revalidatePath("/ordens");
  redirect("/ordens");
}

export async function mudarStatusOrdem(id: string, status: string) {
  const sessao = await exigirSessao();
  if (!STATUS.includes(status as (typeof STATUS)[number])) return;

  const os = await prisma.ordemServico.findUnique({ where: { id } });
  if (!os) return;
  if (
    sessao.role === "COLABORADOR" &&
    os.colaboradorId !== sessao.colaboradorId
  ) {
    return;
  }

  await prisma.ordemServico.update({
    where: { id },
    data: {
      status,
      dataConclusao:
        status === "EXECUCAO_TOTAL"
          ? os.dataConclusao ?? new Date()
          : os.dataConclusao,
    },
  });
  revalidatePath("/ordens");
  revalidatePath(`/ordens/${id}`);
}

export async function excluirOrdem(id: string) {
  await exigirAdmin();
  await prisma.pagamentoColaborador.deleteMany({ where: { ordemId: id } });
  await prisma.ordemServico.delete({ where: { id } });
  revalidatePath("/ordens");
}
