"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";

const STATUS = ["SOLICITADO", "ENVIADO", "APROVADO", "REPROVADO"] as const;

const schema = z.object({
  clienteId: z.string().min(1, "Selecione o cliente."),
  titulo: z.string().trim().min(1, "Informe o título."),
  descricao: z.string().trim().optional(),
  valor: z.coerce.number().min(0).default(0),
  status: z.enum(STATUS),
  validade: z.string().optional(),
  observacoes: z.string().trim().optional(),
});

export async function salvarOrcamento(
  id: string | null,
  _prev: { erro?: string } | undefined,
  formData: FormData
): Promise<{ erro?: string }> {
  await exigirAdmin();
  const parsed = schema.safeParse({
    clienteId: formData.get("clienteId"),
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao") || undefined,
    valor: formData.get("valor") || 0,
    status: formData.get("status"),
    validade: formData.get("validade") || undefined,
    observacoes: formData.get("observacoes") || undefined,
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  const data = {
    clienteId: d.clienteId,
    titulo: d.titulo,
    descricao: d.descricao,
    valor: d.valor,
    status: d.status,
    validade: d.validade ? new Date(d.validade) : null,
    observacoes: d.observacoes,
  };

  if (id) {
    await prisma.orcamento.update({ where: { id }, data });
  } else {
    const ultimo = await prisma.orcamento.aggregate({ _max: { numero: true } });
    await prisma.orcamento.create({
      data: { ...data, numero: (ultimo._max.numero ?? 0) + 1 },
    });
  }

  revalidatePath("/orcamentos");
  redirect("/orcamentos");
}

export async function mudarStatusOrcamento(id: string, status: string) {
  await exigirAdmin();
  if (!STATUS.includes(status as (typeof STATUS)[number])) return;
  await prisma.orcamento.update({ where: { id }, data: { status } });
  revalidatePath("/orcamentos");
}

/** Aprova o orçamento e cria uma OS a partir dele. */
export async function aprovarEGerarOS(id: string) {
  await exigirAdmin();
  const orc = await prisma.orcamento.findUnique({ where: { id } });
  if (!orc) return;

  await prisma.orcamento.update({
    where: { id },
    data: { status: "APROVADO" },
  });

  const ultimo = await prisma.ordemServico.aggregate({ _max: { numero: true } });
  await prisma.ordemServico.create({
    data: {
      numero: (ultimo._max.numero ?? 0) + 1,
      clienteId: orc.clienteId,
      titulo: orc.titulo,
      descricao: orc.descricao,
      custo: orc.valor,
      tipo: "CORRETIVA",
      prioridade: "MEDIA",
      status: "OS_ABERTA",
      observacoes: `Gerada a partir do orçamento #${orc.numero}.`,
    },
  });

  revalidatePath("/orcamentos");
  revalidatePath("/ordens");
  redirect("/ordens");
}

export async function excluirOrcamento(id: string) {
  await exigirAdmin();
  await prisma.orcamento.delete({ where: { id } });
  revalidatePath("/orcamentos");
}
