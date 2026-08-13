import { prisma } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

function csvCampo(v: unknown): string {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

function moeda(n: number) {
  return n.toFixed(2).replace(".", ",");
}

export async function GET() {
  const sessao = await obterSessao();
  if (!sessao || sessao.role !== "ADMIN") {
    return new Response("Não autorizado", { status: 403 });
  }

  const [receber, pagar] = await Promise.all([
    prisma.recebimento.findMany({
      orderBy: { vencimento: "asc" },
      include: { contrato: { include: { cliente: true } } },
    }),
    prisma.pagamentoColaborador.findMany({
      orderBy: { criadoEm: "desc" },
      include: { colaborador: true },
    }),
  ]);

  const linhas: string[] = [];
  linhas.push(["Tipo", "Referencia", "Descricao", "Competencia", "Vencimento", "Valor", "Status"].map(csvCampo).join(";"));

  for (const r of receber) {
    linhas.push(
      [
        "A RECEBER",
        r.contrato.cliente.nome,
        r.contrato.descricao,
        r.competencia,
        r.vencimento.toLocaleDateString("pt-BR"),
        moeda(r.valor),
        r.status,
      ]
        .map(csvCampo)
        .join(";")
    );
  }
  for (const p of pagar) {
    linhas.push(
      [
        "A PAGAR",
        p.colaborador.nome,
        p.descricao,
        "",
        p.data.toLocaleDateString("pt-BR"),
        moeda(p.valor),
        p.status,
      ]
        .map(csvCampo)
        .join(";")
    );
  }

  const csv = "﻿" + linhas.join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="financeiro.csv"',
    },
  });
}
