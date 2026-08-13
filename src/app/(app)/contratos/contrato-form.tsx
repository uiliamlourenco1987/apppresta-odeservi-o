"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Field } from "@/components/ui";
import { paraInputDate } from "@/lib/format";
import { salvarContrato } from "./actions";

type Contrato = {
  id: string;
  clienteId: string;
  descricao: string;
  escopo: string | null;
  valorMensal: number;
  diaVencimento: number;
  dataInicio: Date;
  dataFim: Date | null;
  status: string;
};

function Salvar() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary" disabled={pending}>
      {pending ? "Salvando..." : "Salvar"}
    </button>
  );
}

export default function ContratoForm({
  contrato,
  clientes,
}: {
  contrato?: Contrato;
  clientes: { id: string; nome: string }[];
}) {
  const action = salvarContrato.bind(null, contrato?.id ?? null);
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="card max-w-2xl space-y-4 p-6">
      <Field label="Cliente *">
        <select
          name="clienteId"
          className="input"
          defaultValue={contrato?.clienteId ?? ""}
          required
        >
          <option value="" disabled>
            Selecione o cliente
          </option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Descrição *" hint="Ex: Contrato de manutenção predial mensal">
        <input
          name="descricao"
          className="input"
          defaultValue={contrato?.descricao ?? ""}
          required
        />
      </Field>

      <Field label="Escopo dos serviços">
        <textarea
          name="escopo"
          className="input min-h-20"
          defaultValue={contrato?.escopo ?? ""}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Valor mensal (R$)">
          <input
            name="valorMensal"
            type="number"
            step="0.01"
            min="0"
            className="input"
            defaultValue={contrato?.valorMensal ?? 0}
          />
        </Field>
        <Field label="Dia de vencimento">
          <input
            name="diaVencimento"
            type="number"
            min="1"
            max="31"
            className="input"
            defaultValue={contrato?.diaVencimento ?? 10}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Data de início *">
          <input
            name="dataInicio"
            type="date"
            className="input"
            defaultValue={paraInputDate(contrato?.dataInicio ?? new Date())}
            required
          />
        </Field>
        <Field label="Data de fim" hint="Deixe em branco se não houver">
          <input
            name="dataFim"
            type="date"
            className="input"
            defaultValue={paraInputDate(contrato?.dataFim)}
          />
        </Field>
      </div>

      <Field label="Status">
        <select
          name="status"
          className="input"
          defaultValue={contrato?.status ?? "ATIVO"}
        >
          <option value="ATIVO">Ativo</option>
          <option value="SUSPENSO">Suspenso</option>
          <option value="ENCERRADO">Encerrado</option>
        </select>
      </Field>

      {state?.erro && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.erro}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Salvar />
        <Link href="/contratos" className="btn-secondary">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
