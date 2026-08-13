"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Field } from "@/components/ui";
import { salvarCliente } from "./actions";

type Cliente = {
  id: string;
  nome: string;
  cnpj: string | null;
  endereco: string | null;
  sindico: string | null;
  telefone: string | null;
  email: string | null;
  observacoes: string | null;
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

export default function ClienteForm({ cliente }: { cliente?: Cliente }) {
  const action = salvarCliente.bind(null, cliente?.id ?? null);
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="card max-w-2xl space-y-4 p-6">
      <Field label="Nome do condomínio / cliente *">
        <input
          name="nome"
          className="input"
          defaultValue={cliente?.nome ?? ""}
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="CNPJ">
          <input name="cnpj" className="input" defaultValue={cliente?.cnpj ?? ""} />
        </Field>
        <Field label="Telefone">
          <input
            name="telefone"
            className="input"
            defaultValue={cliente?.telefone ?? ""}
          />
        </Field>
      </div>

      <Field label="Endereço">
        <input
          name="endereco"
          className="input"
          defaultValue={cliente?.endereco ?? ""}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Síndico / contato">
          <input
            name="sindico"
            className="input"
            defaultValue={cliente?.sindico ?? ""}
          />
        </Field>
        <Field label="E-mail">
          <input
            name="email"
            type="email"
            className="input"
            defaultValue={cliente?.email ?? ""}
          />
        </Field>
      </div>

      <Field label="Observações">
        <textarea
          name="observacoes"
          className="input min-h-20"
          defaultValue={cliente?.observacoes ?? ""}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="ativo"
          defaultChecked={cliente?.ativo ?? true}
          className="h-4 w-4 rounded border-gray-300"
        />
        Cliente ativo
      </label>

      {state?.erro && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.erro}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Salvar />
        <Link href="/clientes" className="btn-secondary">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
