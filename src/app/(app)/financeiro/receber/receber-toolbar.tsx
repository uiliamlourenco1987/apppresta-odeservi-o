"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { gerarMensalidades } from "./actions";

function Botao() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary whitespace-nowrap" disabled={pending}>
      {pending ? "Gerando..." : "Gerar mensalidades"}
    </button>
  );
}

export default function ReceberToolbar({ competenciaAtual }: { competenciaAtual: string }) {
  const [state, formAction] = useActionState(gerarMensalidades, {});

  return (
    <div className="card mb-4 p-4">
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Competência (mês)</label>
          <input
            type="month"
            name="competencia"
            defaultValue={competenciaAtual}
            className="input"
          />
        </div>
        <Botao />
        <p className="text-xs text-gray-500">
          Cria as mensalidades de todos os contratos ativos para o mês escolhido.
        </p>
      </form>
      {state?.msg && (
        <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.msg}
        </p>
      )}
      {state?.erro && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.erro}
        </p>
      )}
    </div>
  );
}
