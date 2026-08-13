"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Field } from "@/components/ui";
import { paraInputDate } from "@/lib/format";
import { salvarOrcamento } from "./actions";

type Orcamento = {
  id: string;
  clienteId: string;
  titulo: string;
  descricao: string | null;
  valor: number;
  status: string;
  validade: Date | null;
  observacoes: string | null;
};

function Salvar() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary" disabled={pending}>
      {pending ? "Salvando..." : "Salvar"}
    </button>
  );
}

export default function OrcamentoForm({
  orcamento,
  clientes,
}: {
  orcamento?: Orcamento;
  clientes: { id: string; nome: string }[];
}) {
  const action = salvarOrcamento.bind(null, orcamento?.id ?? null);
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="card max-w-2xl space-y-4 p-6">
      <Field label="Título *" hint="Ex: Reforma da fachada, Troca de bombas">
        <input name="titulo" className="input" defaultValue={orcamento?.titulo ?? ""} required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cliente *">
          <select
            name="clienteId"
            className="input"
            defaultValue={orcamento?.clienteId ?? ""}
            required
          >
            <option value="" disabled>
              Selecione
            </option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Valor (R$)">
          <input
            name="valor"
            type="number"
            step="0.01"
            min="0"
            className="input"
            defaultValue={orcamento?.valor ?? 0}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status">
          <select name="status" className="input" defaultValue={orcamento?.status ?? "SOLICITADO"}>
            <option value="SOLICITADO">Solicitado</option>
            <option value="ENVIADO">Enviado</option>
            <option value="APROVADO">Aprovado</option>
            <option value="REPROVADO">Reprovado</option>
          </select>
        </Field>
        <Field label="Validade da proposta">
          <input
            name="validade"
            type="date"
            className="input"
            defaultValue={paraInputDate(orcamento?.validade)}
          />
        </Field>
      </div>

      <Field label="Descrição / itens">
        <textarea
          name="descricao"
          className="input min-h-24"
          defaultValue={orcamento?.descricao ?? ""}
        />
      </Field>

      <Field label="Observações">
        <textarea
          name="observacoes"
          className="input min-h-20"
          defaultValue={orcamento?.observacoes ?? ""}
        />
      </Field>

      {state?.erro && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.erro}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Salvar />
        <Link href="/orcamentos" className="btn-secondary">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
