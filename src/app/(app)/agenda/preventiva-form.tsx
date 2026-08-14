"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Field } from "@/components/ui";
import { paraInputDate, CATEGORIAS_OS, CATEGORIA_LABEL, FREQUENCIA } from "@/lib/format";
import { salvarPreventiva } from "./actions";

type Preventiva = {
  id: string;
  clienteId: string;
  contratoId: string | null;
  colaboradorId: string | null;
  titulo: string;
  categoria: string | null;
  frequencia: string;
  proximaData: Date;
  ativo: boolean;
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

export default function PreventivaForm({
  preventiva,
  clientes,
  contratos,
  colaboradores,
}: {
  preventiva?: Preventiva;
  clientes: { id: string; nome: string }[];
  contratos: { id: string; nome: string }[];
  colaboradores: { id: string; nome: string }[];
}) {
  const action = salvarPreventiva.bind(null, preventiva?.id ?? null);
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="card max-w-2xl space-y-4 p-6">
      <Field label="Título *" hint="Ex: Inspeção dos elevadores, Limpeza da caixa d'água">
        <input name="titulo" className="input" defaultValue={preventiva?.titulo ?? ""} required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cliente *">
          <select name="clienteId" className="input" defaultValue={preventiva?.clienteId ?? ""} required>
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
        <Field label="Contrato">
          <select name="contratoId" className="input" defaultValue={preventiva?.contratoId ?? ""}>
            <option value="">Sem contrato</option>
            {contratos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Frequência">
          <select name="frequencia" className="input" defaultValue={preventiva?.frequencia ?? "MENSAL"}>
            {Object.entries(FREQUENCIA).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Próxima data *">
          <input
            name="proximaData"
            type="date"
            className="input"
            defaultValue={paraInputDate(preventiva?.proximaData ?? new Date())}
            required
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Categoria">
          <select name="categoria" className="input" defaultValue={preventiva?.categoria ?? ""}>
            <option value="">—</option>
            {CATEGORIAS_OS.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORIA_LABEL[cat]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Colaborador">
          <select name="colaboradorId" className="input" defaultValue={preventiva?.colaboradorId ?? ""}>
            <option value="">Não atribuído</option>
            {colaboradores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Observações">
        <textarea name="observacoes" className="input min-h-20" defaultValue={preventiva?.observacoes ?? ""} />
      </Field>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="ativo" defaultChecked={preventiva?.ativo ?? true} className="h-4 w-4 rounded border-gray-300" />
        Ativa (aparece na agenda)
      </label>

      {state?.erro && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.erro}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Salvar />
        <Link href="/agenda" className="btn-secondary">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
