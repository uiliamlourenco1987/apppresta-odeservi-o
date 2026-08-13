"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Field } from "@/components/ui";
import { salvarColaborador } from "./actions";

type Colaborador = {
  id: string;
  nome: string;
  funcao: string | null;
  telefone: string | null;
  email: string | null;
  tipo: string;
  valorPadrao: number;
  ativo: boolean;
};

function Salvar() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary" disabled={pending}>
      {pending ? "Salvando..." : "Salvar"}
    </button>
  );
}

export default function ColaboradorForm({
  colaborador,
}: {
  colaborador?: Colaborador;
}) {
  const action = salvarColaborador.bind(null, colaborador?.id ?? null);
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="card max-w-2xl space-y-4 p-6">
      <Field label="Nome *">
        <input
          name="nome"
          className="input"
          defaultValue={colaborador?.nome ?? ""}
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Função / especialidade" hint="Ex: Elétrica, Hidráulica, Pintura">
          <input
            name="funcao"
            className="input"
            defaultValue={colaborador?.funcao ?? ""}
          />
        </Field>
        <Field label="Telefone">
          <input
            name="telefone"
            className="input"
            defaultValue={colaborador?.telefone ?? ""}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo">
          <select
            name="tipo"
            className="input"
            defaultValue={colaborador?.tipo ?? "PRESTADOR"}
          >
            <option value="PRESTADOR">Prestador</option>
            <option value="CLT">CLT</option>
          </select>
        </Field>
        <Field label="Valor padrão (R$)" hint="Diária ou hora">
          <input
            name="valorPadrao"
            type="number"
            step="0.01"
            min="0"
            className="input"
            defaultValue={colaborador?.valorPadrao ?? 0}
          />
        </Field>
      </div>

      <Field label="E-mail">
        <input
          name="email"
          type="email"
          className="input"
          defaultValue={colaborador?.email ?? ""}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="ativo"
          defaultChecked={colaborador?.ativo ?? true}
          className="h-4 w-4 rounded border-gray-300"
        />
        Colaborador ativo
      </label>

      {state?.erro && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.erro}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Salvar />
        <Link href="/colaboradores" className="btn-secondary">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
