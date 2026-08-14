"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { enviarNotificacao } from "@/lib/notificacoes";

export async function enviarTeste(
  _prev: { msg?: string; erro?: string } | undefined,
  formData: FormData
): Promise<{ msg?: string; erro?: string }> {
  await exigirAdmin();
  const destinatario = String(formData.get("destinatario") || "").trim();
  const canal = String(formData.get("canal") || "EMAIL");
  if (!destinatario) return { erro: "Informe o destinatário." };

  await enviarNotificacao({
    canal: canal === "WHATSAPP" ? "WHATSAPP" : "EMAIL",
    destinatario,
    assunto: "Notificação de teste",
    corpo: "Esta é uma notificação de teste do Controle de Manutenção.",
  });

  revalidatePath("/notificacoes");
  return {
    msg: process.env.NOTIFICACAO_WEBHOOK_URL
      ? "Notificação enviada ao webhook configurado."
      : "Registrada como SIMULADO (configure NOTIFICACAO_WEBHOOK_URL para enviar de verdade).",
  };
}

/** Cria avisos para todos os recebimentos vencidos e não pagos. */
export async function avisarVencidos(): Promise<void> {
  await exigirAdmin();
  const hoje = new Date();
  const vencidos = await prisma.recebimento.findMany({
    where: { status: { not: "PAGO" }, vencimento: { lt: hoje } },
    include: { contrato: { include: { cliente: true } } },
  });
  for (const r of vencidos) {
    const email = r.contrato.cliente.email;
    const tel = r.contrato.cliente.telefone;
    const destinatario = email || tel;
    if (!destinatario) continue;
    await enviarNotificacao({
      canal: email ? "EMAIL" : "WHATSAPP",
      destinatario,
      assunto: `Cobrança em aberto — ${r.competencia}`,
      corpo: `Olá, ${r.contrato.cliente.nome}. Consta em aberto a mensalidade de ${r.competencia}.`,
    });
  }
  revalidatePath("/notificacoes");
}
