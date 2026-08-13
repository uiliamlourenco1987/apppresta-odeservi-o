import { prisma } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { STATUS_OS, PRIORIDADE_OS, TIPO_OS, CATEGORIA_LABEL } from "@/lib/format";

function csvCampo(v: unknown): string {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const sessao = await obterSessao();
  if (!sessao || sessao.role !== "ADMIN") {
    return new Response("Não autorizado", { status: 403 });
  }

  const ordens = await prisma.ordemServico.findMany({
    orderBy: { numero: "asc" },
    include: { cliente: true, colaborador: true },
  });

  const cab = [
    "Numero",
    "Titulo",
    "Cliente",
    "Colaborador",
    "Tipo",
    "Categoria",
    "Prioridade",
    "Status",
    "Custo",
    "Abertura",
    "Conclusao",
  ];
  const linhas = ordens.map((o) =>
    [
      o.numero,
      o.titulo,
      o.cliente.nome,
      o.colaborador?.nome ?? "",
      TIPO_OS[o.tipo] ?? o.tipo,
      o.categoria ? CATEGORIA_LABEL[o.categoria] ?? o.categoria : "",
      PRIORIDADE_OS[o.prioridade]?.label ?? o.prioridade,
      STATUS_OS[o.status]?.label ?? o.status,
      o.custo.toFixed(2).replace(".", ","),
      o.dataAbertura.toLocaleDateString("pt-BR"),
      o.dataConclusao ? o.dataConclusao.toLocaleDateString("pt-BR") : "",
    ]
      .map(csvCampo)
      .join(";")
  );

  const csv = "﻿" + [cab.map(csvCampo).join(";"), ...linhas].join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ordens-servico.csv"',
    },
  });
}
