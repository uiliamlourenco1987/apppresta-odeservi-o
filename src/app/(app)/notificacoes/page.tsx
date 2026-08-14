import { prisma } from "@/lib/db";
import { exigirAdmin } from "@/lib/auth";
import { PageHeader, Badge, EmptyState } from "@/components/ui";
import { formatarData } from "@/lib/format";
import TesteForm from "./teste-form";
import { avisarVencidos } from "./actions";

const STATUS: Record<string, string> = {
  ENVIADO: "bg-green-100 text-green-800",
  SIMULADO: "bg-blue-100 text-blue-800",
  PENDENTE: "bg-amber-100 text-amber-800",
  ERRO: "bg-red-100 text-red-800",
};

export default async function NotificacoesPage() {
  await exigirAdmin();
  const configurado = !!process.env.NOTIFICACAO_WEBHOOK_URL;
  const notificacoes = await prisma.notificacao.findMany({
    orderBy: { criadoEm: "desc" },
    take: 50,
  });

  return (
    <div>
      <PageHeader
        titulo="Notificações"
        subtitulo="Avisos de OS e cobranças (e-mail / WhatsApp)"
        acao={
          <form action={avisarVencidos}>
            <button className="btn-secondary">Avisar cobranças vencidas</button>
          </form>
        }
      />

      <div
        className={`mb-4 rounded-lg border p-4 text-sm ${
          configurado
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-amber-200 bg-amber-50 text-amber-800"
        }`}
      >
        {configurado ? (
          <>✅ Envio ativo — webhook configurado.</>
        ) : (
          <>
            ⚙️ <b>Envio ainda não configurado.</b> As notificações estão sendo
            registradas como <b>SIMULADO</b>. Para enviar de verdade, defina a
            variável de ambiente <code>NOTIFICACAO_WEBHOOK_URL</code> apontando
            para um gateway de e-mail/WhatsApp (Zapier, n8n, ou API própria). O
            sistema envia um POST com <code>{`{ canal, destinatario, assunto, corpo }`}</code>.
          </>
        )}
      </div>

      <TesteForm />

      {notificacoes.length === 0 ? (
        <EmptyState
          titulo="Nenhuma notificação ainda"
          descricao="As notificações aparecem aqui conforme forem geradas (novas OS, cobranças, testes)."
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Canal</th>
                <th className="px-4 py-3">Destinatário</th>
                <th className="px-4 py-3">Assunto</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notificacoes.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{formatarData(n.criadoEm)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {n.canal === "EMAIL" ? "E-mail" : "WhatsApp"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{n.destinatario}</td>
                  <td className="px-4 py-3 text-gray-900">{n.assunto}</td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS[n.status] ?? ""}>{n.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
