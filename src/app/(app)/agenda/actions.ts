"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { proximaDataApos } from "@/lib/format";
import { notificarNovaOS } from "@/lib/notificacoes";

const schema = z.object({
  clienteId: z.string().min(1, "Selecione o cliente."),
  contratoId: z.string().optional(),
  colaboradorId: z.string().optional(),
  titulo: z.string().trim().min(1, "Informe o título."),
  categoria: z.string().optional(),
  frequencia: z.enum(["MENSAL", "BIMESTRAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"]),
  proximaData: z.string().min(1, "Informe a próxima data."),
  ativo: z.boolean(),
  observacoes: z.string().trim().optional(),
});

export async function salvarPreventiva(
  id: string | null,
  _prev: { erro?: string } | undefined,
  formData: FormData
): Promise<{ erro?: string }> {
  await exigirAdmin();
  const parsed = schema.safeParse({
    clienteId: formData.get("clienteId"),
    contratoId: formData.get("contratoId") || undefined,
    colaboradorId: formData.get("colaboradorId") || undefined,
    titulo: formData.get("titulo"),
    categoria: formData.get("categoria") || undefined,
    frequencia: formData.get("frequencia"),
    proximaData: formData.get("proximaData"),
    ativo: formData.get("ativo") === "on",
    observacoes: formData.get("observacoes") || undefined,
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  const data = {
    clienteId: d.clienteId,
    contratoId: d.contratoId || null,
    colaboradorId: d.colaboradorId || null,
    titulo: d.titulo,
    categoria: d.categoria || null,
    frequencia: d.frequencia,
    proximaData: new Date(d.proximaData),
    ativo: d.ativo,
    observacoes: d.observacoes,
  };

  if (id) {
    await prisma.preventiva.update({ where: { id }, data });
  } else {
    await prisma.preventiva.create({ data });
  }

  revalidatePath("/agenda");
  redirect("/agenda");
}

/** Gera a OS da preventiva e avança a próxima data conforme a frequência. */
export async function gerarOSPreventiva(id: string) {
  await exigirAdmin();
  const p = await prisma.preventiva.findUnique({ where: { id } });
  if (!p) return;

  const ultimo = await prisma.ordemServico.aggregate({ _max: { numero: true } });
  const os = await prisma.ordemServico.create({
    data: {
      numero: (ultimo._max.numero ?? 0) + 1,
      clienteId: p.clienteId,
      contratoId: p.contratoId,
      colaboradorId: p.colaboradorId,
      titulo: p.titulo,
      categoria: p.categoria,
      tipo: "PREVENTIVA",
      prioridade: "MEDIA",
      status: "OS_ABERTA",
      dataAgendada: p.proximaData,
      observacoes: p.observacoes,
    },
    include: { cliente: true, colaborador: true },
  });

  await prisma.preventiva.update({
    where: { id },
    data: { proximaData: proximaDataApos(p.proximaData, p.frequencia) },
  });

  await notificarNovaOS(os);

  revalidatePath("/agenda");
  revalidatePath("/ordens");
  redirect("/ordens");
}

export async function excluirPreventiva(id: string) {
  await exigirAdmin();
  await prisma.preventiva.delete({ where: { id } });
  revalidatePath("/agenda");
}
