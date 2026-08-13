"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KANBAN_COLUNAS, STATUS_OS, PRIORIDADE_OS } from "@/lib/format";
import { mudarStatusOrdem } from "../ordens/actions";

type Card = {
  id: string;
  numero: number;
  titulo: string;
  cliente: string;
  colaborador: string | null;
  prioridade: string;
  categoria: string | null;
  status: string;
};

export default function KanbanBoard({ cards: iniciais }: { cards: Card[] }) {
  const [cards, setCards] = useState<Card[]>(iniciais);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function mover(id: string, novoStatus: string) {
    const card = cards.find((c) => c.id === id);
    if (!card || card.status === novoStatus) return;
    // Atualização otimista
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: novoStatus } : c))
    );
    startTransition(async () => {
      await mudarStatusOrdem(id, novoStatus);
      router.refresh();
    });
  }

  function onDrop(status: string) {
    if (arrastando) mover(arrastando, status);
    setArrastando(null);
    setAlvo(null);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUNAS.map((status) => {
        const info = STATUS_OS[status];
        const daColuna = cards.filter((c) => c.status === status);
        const destacar = alvo === status;
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setAlvo(status);
            }}
            onDragLeave={() => setAlvo((a) => (a === status ? null : a))}
            onDrop={() => onDrop(status)}
            className={`flex w-72 flex-shrink-0 flex-col rounded-xl border ${info.corColuna} ${
              destacar ? "ring-2 ring-brand-400" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2 px-3 py-3">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${info.corBarra}`} />
                <span className="text-sm font-semibold text-gray-700">
                  {info.label}
                </span>
              </div>
              <span className="badge bg-white text-gray-500">
                {daColuna.length}
              </span>
            </div>

            <div className="flex min-h-24 flex-1 flex-col gap-2 px-2 pb-3">
              {daColuna.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-gray-400">
                  Solte um card aqui
                </p>
              )}
              {daColuna.map((card) => {
                const pr = PRIORIDADE_OS[card.prioridade];
                return (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => setArrastando(card.id)}
                    onDragEnd={() => {
                      setArrastando(null);
                      setAlvo(null);
                    }}
                    className={`cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm active:cursor-grabbing ${
                      arrastando === card.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400">
                        #{card.numero}
                      </span>
                      <span className={`badge ${pr.cor}`}>{pr.label}</span>
                    </div>
                    <p className="text-sm font-medium leading-snug text-gray-900">
                      {card.titulo}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{card.cliente}</p>
                    <p className="text-xs text-gray-400">
                      {card.colaborador ?? "Não atribuída"}
                    </p>

                    {/* Mover por seletor (útil no celular/touch) */}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <select
                        value={card.status}
                        onChange={(e) => mover(card.id, e.target.value)}
                        className="w-full rounded border border-gray-200 bg-gray-50 px-1.5 py-1 text-xs text-gray-600 outline-none focus:border-brand-500"
                      >
                        {Object.entries(STATUS_OS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                      <Link
                        href={`/ordens/${card.id}`}
                        className="shrink-0 text-xs font-medium text-brand-600 hover:underline"
                      >
                        Abrir →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
