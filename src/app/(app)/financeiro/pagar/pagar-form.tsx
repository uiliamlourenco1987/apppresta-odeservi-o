"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { criarPagamento } from "./actions";

function Botao() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary whitespace-nowrap" disabled={pending}>
      {pending ? "Salvando..." : "Adicionar"}
    </button>
  );
}

export default function PagarForm({
  colaboradores,
}: {
  colaboradores: { id: string; nome: string }[];
}) {
  const [state, formAction] = useActionState(criarPagamento, {});

  return (
    <div className="card mb-4 p-4">
      <p className="mb-3 text-sm font-medium text-gray-700">Novo lançamento a pagar</p>
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div className="min-w-40 flex-1">
          <label className="label">Colaborador</label>
          <select name="colaboradorId" className="input" required defaultValue="">
            <option value="" disabled>
              Selecione
            </option>
            {colaboradores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-48 flex-1">
          <label className="label">Descrição</label>
          <input name="descricao" className="input" placeholder="Ex: Serviço elétrico — OS #1" required />
        </div>
        <div className="w-32">
          <label className="label">Valor (R$)</label>
          <input name="valor" type="number" step="0.01" min="0" className="input" defaultValue={0} />
        </div>
        <Botao />
      </form>
      {state?.msg && (
        <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{state.msg}</p>
      )}
      {state?.erro && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.erro}</p>
      )}
    </div>
  );
}
