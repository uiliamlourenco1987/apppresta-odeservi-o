"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";

const schema = z.object({
  nome: z.string().trim().min(1, "Informe o nome."),
  cnpj: z.string().trim().optional(),
  endereco: z.string().trim().optional(),
  sindico: z.string().trim().optional(),
  telefone: z.string().trim().optional(),
  email: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
  ativo: z.boolean(),
});

function ler(formData: FormData) {
  return schema.safeParse({
    nome: formData.get("nome"),
    cnpj: formData.get("cnpj") || undefined,
    endereco: formData.get("endereco") || undefined,
    sindico: formData.get("sindico") || undefined,
    telefone: formData.get("telefone") || undefined,
    email: formData.get("email") || undefined,
    observacoes: formData.get("observacoes") || undefined,
    ativo: formData.get("ativo") === "on",
  });
}

export async function salvarCliente(
  id: string | null,
  _prev: { erro?: string } | undefined,
  formData: FormData
): Promise<{ erro?: string }> {
  await exigirAdmin();
  const parsed = ler(formData);
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const dados = parsed.data;

  if (id) {
    await prisma.cliente.update({ where: { id }, data: dados });
  } else {
    await prisma.cliente.create({ data: dados });
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function excluirCliente(id: string) {
  await exigirAdmin();
  const contratos = await prisma.contrato.count({ where: { clienteId: id } });
  const ordens = await prisma.ordemServico.count({ where: { clienteId: id } });
  if (contratos > 0 || ordens > 0) {
    // Não apaga clientes com histórico — apenas inativa.
    await prisma.cliente.update({ where: { id }, data: { ativo: false } });
  } else {
    await prisma.cliente.delete({ where: { id } });
  }
  revalidatePath("/clientes");
}
