"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";

const schema = z.object({
  nome: z.string().trim().min(1, "Informe o nome."),
  funcao: z.string().trim().optional(),
  telefone: z.string().trim().optional(),
  email: z.string().trim().optional(),
  tipo: z.enum(["CLT", "PRESTADOR"]),
  valorPadrao: z.coerce.number().min(0).default(0),
  ativo: z.boolean(),
});

function ler(formData: FormData) {
  return schema.safeParse({
    nome: formData.get("nome"),
    funcao: formData.get("funcao") || undefined,
    telefone: formData.get("telefone") || undefined,
    email: formData.get("email") || undefined,
    tipo: formData.get("tipo"),
    valorPadrao: formData.get("valorPadrao") || 0,
    ativo: formData.get("ativo") === "on",
  });
}

export async function salvarColaborador(
  id: string | null,
  _prev: { erro?: string } | undefined,
  formData: FormData
): Promise<{ erro?: string }> {
  await exigirAdmin();
  const parsed = ler(formData);
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  if (id) {
    await prisma.colaborador.update({ where: { id }, data: parsed.data });
  } else {
    await prisma.colaborador.create({ data: parsed.data });
  }

  revalidatePath("/colaboradores");
  redirect("/colaboradores");
}

export async function excluirColaborador(id: string) {
  await exigirAdmin();
  const ordens = await prisma.ordemServico.count({
    where: { colaboradorId: id },
  });
  const pagamentos = await prisma.pagamentoColaborador.count({
    where: { colaboradorId: id },
  });
  if (ordens > 0 || pagamentos > 0) {
    await prisma.colaborador.update({ where: { id }, data: { ativo: false } });
  } else {
    await prisma.colaborador.delete({ where: { id } });
  }
  revalidatePath("/colaboradores");
}
