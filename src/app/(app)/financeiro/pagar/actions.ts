"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";

const schema = z.object({
  colaboradorId: z.string().min(1, "Selecione o colaborador."),
  descricao: z.string().trim().min(1, "Informe a descrição."),
  valor: z.coerce.number().min(0),
  ordemId: z.string().optional(),
});

export async function criarPagamento(
  _prev: { erro?: string; msg?: string } | undefined,
  formData: FormData
): Promise<{ erro?: string; msg?: string }> {
  await exigirAdmin();
  const parsed = schema.safeParse({
    colaboradorId: formData.get("colaboradorId"),
    descricao: formData.get("descricao"),
    valor: formData.get("valor") || 0,
    ordemId: formData.get("ordemId") || undefined,
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  await prisma.pagamentoColaborador.create({
    data: {
      colaboradorId: d.colaboradorId,
      descricao: d.descricao,
      valor: d.valor,
      ordemId: d.ordemId || null,
      status: "PENDENTE",
    },
  });
  revalidatePath("/financeiro/pagar");
  return { msg: "Lançamento adicionado." };
}

export async function marcarPagamento(id: string, status: string) {
  await exigirAdmin();
  if (!["PENDENTE", "PAGO"].includes(status)) return;
  await prisma.pagamentoColaborador.update({ where: { id }, data: { status } });
  revalidatePath("/financeiro/pagar");
}

export async function excluirPagamento(id: string) {
  await exigirAdmin();
  await prisma.pagamentoColaborador.delete({ where: { id } });
  revalidatePath("/financeiro/pagar");
}
