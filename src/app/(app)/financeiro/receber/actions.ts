"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";

/** Gera as mensalidades (recebimentos) de todos os contratos ativos para uma competência. */
export async function gerarMensalidades(
  _prev: { msg?: string; erro?: string } | undefined,
  formData: FormData
): Promise<{ msg?: string; erro?: string }> {
  await exigirAdmin();
  const competencia = String(formData.get("competencia") || "");
  if (!/^\d{4}-\d{2}$/.test(competencia)) {
    return { erro: "Informe a competência no formato AAAA-MM." };
  }

  const contratos = await prisma.contrato.findMany({
    where: { status: "ATIVO" },
  });
  const [ano, mes] = competencia.split("-").map(Number);

  let criados = 0;
  for (const c of contratos) {
    const existe = await prisma.recebimento.findFirst({
      where: { contratoId: c.id, competencia },
    });
    if (existe) continue;
    const dia = Math.min(c.diaVencimento || 10, 28);
    await prisma.recebimento.create({
      data: {
        contratoId: c.id,
        competencia,
        valor: c.valorMensal,
        vencimento: new Date(ano, mes - 1, dia),
        status: "PENDENTE",
      },
    });
    criados++;
  }

  revalidatePath("/financeiro/receber");
  return {
    msg:
      criados > 0
        ? `${criados} mensalidade(s) gerada(s) para ${competencia}.`
        : `Nenhuma nova mensalidade — já existiam para ${competencia}.`,
  };
}

export async function marcarRecebimento(id: string, status: string) {
  await exigirAdmin();
  if (!["PENDENTE", "PAGO", "ATRASADO"].includes(status)) return;
  await prisma.recebimento.update({
    where: { id },
    data: { status, pagoEm: status === "PAGO" ? new Date() : null },
  });
  revalidatePath("/financeiro/receber");
}

const schemaAvulso = z.object({
  contratoId: z.string().min(1, "Selecione o contrato."),
  competencia: z.string().regex(/^\d{4}-\d{2}$/, "Competência inválida (AAAA-MM)."),
  valor: z.coerce.number().min(0),
  vencimento: z.string().min(1, "Informe o vencimento."),
});

export async function criarRecebimento(
  _prev: { erro?: string } | undefined,
  formData: FormData
): Promise<{ erro?: string; msg?: string }> {
  await exigirAdmin();
  const parsed = schemaAvulso.safeParse({
    contratoId: formData.get("contratoId"),
    competencia: formData.get("competencia"),
    valor: formData.get("valor") || 0,
    vencimento: formData.get("vencimento"),
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  await prisma.recebimento.create({
    data: {
      contratoId: d.contratoId,
      competencia: d.competencia,
      valor: d.valor,
      vencimento: new Date(d.vencimento),
      status: "PENDENTE",
    },
  });
  revalidatePath("/financeiro/receber");
  return { msg: "Lançamento criado." };
}

export async function excluirRecebimento(id: string) {
  await exigirAdmin();
  await prisma.recebimento.delete({ where: { id } });
  revalidatePath("/financeiro/receber");
}
