import "server-only";
import { prisma } from "@/lib/db";

/**
 * Camada de notificações.
 *
 * Toda notificação é REGISTRADA no banco (tabela Notificacao). O envio real
 * depende de configuração via variáveis de ambiente:
 *
 *   NOTIFICACAO_WEBHOOK_URL = URL que recebe um POST JSON com a notificação.
 *
 * Aponte essa URL para um gateway seu (Zapier / n8n / API de e-mail ou de
 * WhatsApp). Sem a variável configurada, a notificação fica com status
 * "SIMULADO" — a estrutura funciona, só falta plugar o serviço de envio.
 */

type Canal = "EMAIL" | "WHATSAPP";

export async function enviarNotificacao(params: {
  canal: Canal;
  destinatario: string;
  assunto: string;
  corpo: string;
}): Promise<void> {
  const { canal, destinatario, assunto, corpo } = params;
  const webhook = process.env.NOTIFICACAO_WEBHOOK_URL;

  let status: "ENVIADO" | "SIMULADO" | "ERRO" = "SIMULADO";
  let erro: string | null = null;

  if (webhook) {
    try {
      const resp = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canal, destinatario, assunto, corpo }),
      });
      status = resp.ok ? "ENVIADO" : "ERRO";
      if (!resp.ok) erro = `HTTP ${resp.status}`;
    } catch (e) {
      status = "ERRO";
      erro = e instanceof Error ? e.message : "Falha ao enviar";
    }
  }

  await prisma.notificacao.create({
    data: {
      canal,
      destinatario,
      assunto,
      corpo,
      status,
      erro,
      enviadoEm: status === "ENVIADO" ? new Date() : null,
    },
  });
}

type OSNotif = {
  numero: number;
  titulo: string;
  cliente: { nome: string };
  colaborador: { nome: string; email: string | null; telefone: string | null } | null;
};

/** Notifica o colaborador responsável sobre uma nova OS (se houver contato). */
export async function notificarNovaOS(os: OSNotif): Promise<void> {
  const col = os.colaborador;
  if (!col) return;
  const destinatario = col.email || col.telefone;
  if (!destinatario) return;

  await enviarNotificacao({
    canal: col.email ? "EMAIL" : "WHATSAPP",
    destinatario,
    assunto: `Nova OS #${os.numero} — ${os.cliente.nome}`,
    corpo: `Olá, ${col.nome}. Você foi designado(a) para a OS #${os.numero}: "${os.titulo}" (${os.cliente.nome}).`,
  });
}
