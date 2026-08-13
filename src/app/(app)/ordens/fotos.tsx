"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { uploadFoto, excluirFoto } from "./fotos-actions";

type Foto = { id: string; dados: string; nome: string; legenda: string | null };

function BotaoEnviar() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary" disabled={pending}>
      {pending ? "Enviando..." : "Anexar foto"}
    </button>
  );
}

export default function Fotos({
  ordemId,
  fotos,
}: {
  ordemId: string;
  fotos: Foto[];
}) {
  const action = uploadFoto.bind(null, ordemId);
  const [state, formAction] = useActionState(action, {});

  return (
    <div className="card mb-6 p-4">
      <p className="mb-3 text-sm font-medium text-gray-700">
        Fotos e anexos ({fotos.length})
      </p>

      {fotos.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {fotos.map((f) => (
            <div key={f.id} className="group relative overflow-hidden rounded-lg border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.dados} alt={f.legenda ?? f.nome} className="h-32 w-full object-cover" />
              <form action={excluirFoto.bind(null, f.id)} className="absolute right-1 top-1">
                <button
                  className="rounded-full bg-black/60 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
                  title="Excluir"
                >
                  ✕
                </button>
              </form>
              {f.legenda && (
                <p className="truncate bg-white px-2 py-1 text-xs text-gray-500">
                  {f.legenda}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Imagem (máx. 3 MB)</label>
          <input
            type="file"
            name="foto"
            accept="image/*"
            className="text-sm"
            required
          />
        </div>
        <div className="min-w-40 flex-1">
          <label className="label">Legenda (opcional)</label>
          <input name="legenda" className="input" placeholder="Ex: Antes / Depois" />
        </div>
        <BotaoEnviar />
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
