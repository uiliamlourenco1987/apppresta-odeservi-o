"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";

const schema = z.object({
  clienteId: z.string().min(1, "Selecione o cliente."),
  descricao: z.string().trim().min(1, "Informe a descrição."),
  escopo: z.string().trim().optional(),
  valorMensal: z.coerce.number().min(0).default(0),
  diaVencimento: z.coerce.number().int().min(1).max(31).default(10),
  dataInicio: z.string().min(1, "Informe a data de início."),
  dataFim: z.string().optional(),
  status: z.enum(["ATIVO", "ENCERRADO", "SUSPENSO"]),
});

function ler(formData: FormData) {
  return schema.safeParse({
    clienteId: formData.get("clienteId"),
    descricao: formData.get("descricao"),
    escopo: formData.get("escopo") || undefined,
    valorMensal: formData.get("valorMensal") || 0,
    diaVencimento: formData.get("diaVencimento") || 10,
    dataInicio: formData.get("dataInicio"),
    dataFim: formData.get("dataFim") || undefined,
    status: formData.get("status"),
  });
}

export async function salvarContrato(
  id: string | null,
  _prev: { erro?: string } | undefined,
  formData: FormData
): Promise<{ erro?: string }> {
  await exigirAdmin();
  const parsed = ler(formData);
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  const data = {
    clienteId: d.clienteId,
    descricao: d.descricao,
    escopo: d.escopo,
    valorMensal: d.valorMensal,
    diaVencimento: d.diaVencimento,
    dataInicio: new Date(d.dataInicio),
    dataFim: d.dataFim ? new Date(d.dataFim) : null,
    status: d.status,
  };

  if (id) {
    await prisma.contrato.update({ where: { id }, data });
  } else {
    await prisma.contrato.create({ data });
  }

  revalidatePath("/contratos");
  redirect("/contratos");
}

export async function excluirContrato(id: string) {
  await exigirAdmin();
  const ordens = await prisma.ordemServico.count({ where: { contratoId: id } });
  if (ordens > 0) {
    await prisma.contrato.update({
      where: { id },
      data: { status: "ENCERRADO" },
    });
  } else {
    await prisma.recebimento.deleteMany({ where: { contratoId: id } });
    await prisma.contrato.delete({ where: { id } });
  }
  revalidatePath("/contratos");
}
