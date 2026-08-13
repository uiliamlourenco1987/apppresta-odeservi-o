"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Field } from "@/components/ui";
import {
  paraInputDate,
  CATEGORIAS_OS,
  CATEGORIA_LABEL,
} from "@/lib/format";
import { salvarOrdem } from "./actions";

type Ordem = {
  id: string;
  clienteId: string;
  contratoId: string | null;
  colaboradorId: string | null;
  tipo: string;
  categoria: string | null;
  titulo: string;
  descricao: string | null;
  prioridade: string;
  status: string;
  custo: number;
  dataAgendada: Date | null;
  dataConclusao: Date | null;
  observacoes: string | null;
};

type Opcao = { id: string; nome: string };
type ContratoOpcao = { id: string; nome: string; clienteId: string };

function Salvar() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary" disabled={pending}>
      {pending ? "Salvando..." : "Salvar"}
    </button>
  );
}

export default function OrdemForm({
  ordem,
  clientes,
  contratos,
  colaboradores,
  role,
}: {
  ordem?: Ordem;
  clientes: Opcao[];
  contratos: ContratoOpcao[];
  colaboradores: Opcao[];
  role: "ADMIN" | "COLABORADOR";
}) {
  const action = salvarOrdem.bind(null, ordem?.id ?? null);
  const [state, formAction] = useActionState(action, {});
  const ehAdmin = role === "ADMIN";

  return (
    <form action={formAction} className="card max-w-2xl space-y-4 p-6">
      <Field label="Título *" hint="Ex: Vazamento na garagem, Troca de lâmpadas">
        <input
          name="titulo"
          className="input"
          defaultValue={ordem?.titulo ?? ""}
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cliente *">
          <select
            name="clienteId"
            className="input"
            defaultValue={ordem?.clienteId ?? ""}
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
        <Field label="Contrato" hint="Opcional">
          <select
            name="contratoId"
            className="input"
            defaultValue={ordem?.contratoId ?? ""}
          >
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
        <Field label="Tipo">
          <select
            name="tipo"
            className="input"
            defaultValue={ordem?.tipo ?? "CORRETIVA"}
          >
            <option value="CORRETIVA">Corretiva</option>
            <option value="PREVENTIVA">Preventiva</option>
          </select>
        </Field>
        <Field label="Categoria">
          <select
            name="categoria"
            className="input"
            defaultValue={ordem?.categoria ?? ""}
          >
            <option value="">—</option>
            {CATEGORIAS_OS.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORIA_LABEL[cat]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prioridade">
          <select
            name="prioridade"
            className="input"
            defaultValue={ordem?.prioridade ?? "MEDIA"}
          >
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Média</option>
            <option value="ALTA">Alta</option>
            <option value="URGENTE">Urgente</option>
          </select>
        </Field>
        <Field label="Status">
          <select
            name="status"
            className="input"
            defaultValue={ordem?.status ?? "CHAMADO"}
          >
            <option value="CHAMADO">Chamado</option>
            <option value="OS_ABERTA">OS Aberta</option>
            <option value="EM_EXECUCAO">Em Execução</option>
            <option value="EXECUCAO_PARCIAL">Execução Parcial</option>
            <option value="EXECUCAO_TOTAL">Execução Total</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </Field>
      </div>

      {ehAdmin && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Colaborador responsável">
            <select
              name="colaboradorId"
              className="input"
              defaultValue={ordem?.colaboradorId ?? ""}
            >
              <option value="">Não atribuído</option>
              {colaboradores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Custo / valor (R$)">
            <input
              name="custo"
              type="number"
              step="0.01"
              min="0"
              className="input"
              defaultValue={ordem?.custo ?? 0}
            />
          </Field>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Data agendada">
          <input
            name="dataAgendada"
            type="date"
            className="input"
            defaultValue={paraInputDate(ordem?.dataAgendada)}
          />
        </Field>
        <Field label="Data de conclusão">
          <input
            name="dataConclusao"
            type="date"
            className="input"
            defaultValue={paraInputDate(ordem?.dataConclusao)}
          />
        </Field>
      </div>

      <Field label="Descrição">
        <textarea
          name="descricao"
          className="input min-h-20"
          defaultValue={ordem?.descricao ?? ""}
        />
      </Field>

      <Field label="Observações">
        <textarea
          name="observacoes"
          className="input min-h-20"
          defaultValue={ordem?.observacoes ?? ""}
        />
      </Field>

      {state?.erro && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.erro}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Salvar />
        <Link href="/ordens" className="btn-secondary">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
