"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { enviarTeste } from "./actions";

function Botao() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary whitespace-nowrap" disabled={pending}>
      {pending ? "Enviando..." : "Enviar teste"}
    </button>
  );
}

export default function TesteForm() {
  const [state, formAction] = useActionState(enviarTeste, {});
  return (
    <div className="card mb-4 p-4">
      <p className="mb-3 text-sm font-medium text-gray-700">Enviar notificação de teste</p>
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Canal</label>
          <select name="canal" className="input">
            <option value="EMAIL">E-mail</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        </div>
        <div className="min-w-56 flex-1">
          <label className="label">Destinatário</label>
          <input name="destinatario" className="input" placeholder="e-mail ou telefone" />
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
