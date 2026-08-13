"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ORCAMENTO_COLUNAS, STATUS_ORCAMENTO } from "@/lib/format";
import { mudarStatusOrcamento, aprovarEGerarOS } from "./actions";

type Card = {
  id: string;
  numero: number;
  titulo: string;
  cliente: string;
  valor: string;
  status: string;
};

export default function OrcamentoBoard({ cards: iniciais }: { cards: Card[] }) {
  const [cards, setCards] = useState<Card[]>(iniciais);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function mover(id: string, novo: string) {
    const card = cards.find((c) => c.id === id);
    if (!card || card.status === novo) return;
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, status: novo } : c)));
    startTransition(async () => {
      await mudarStatusOrcamento(id, novo);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {ORCAMENTO_COLUNAS.map((status) => {
        const info = STATUS_ORCAMENTO[status];
        const daColuna = cards.filter((c) => c.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setAlvo(status);
            }}
            onDragLeave={() => setAlvo((a) => (a === status ? null : a))}
            onDrop={() => {
              if (arrastando) mover(arrastando, status);
              setArrastando(null);
              setAlvo(null);
            }}
            className={`flex w-72 flex-shrink-0 flex-col rounded-xl border ${info.corColuna} ${
              alvo === status ? "ring-2 ring-brand-400" : ""
            }`}
          >
            <div className="flex items-center justify-between px-3 py-3">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${info.corBarra}`} />
                <span className="text-sm font-semibold text-gray-700">
                  {info.label}
                </span>
              </div>
              <span className="badge bg-white text-gray-500">{daColuna.length}</span>
            </div>

            <div className="flex min-h-24 flex-1 flex-col gap-2 px-2 pb-3">
              {daColuna.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-gray-400">
                  Solte um orçamento aqui
                </p>
              )}
              {daColuna.map((card) => (
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
                    <span className="text-sm font-bold text-gray-900">
                      {card.valor}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-snug text-gray-900">
                    {card.titulo}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{card.cliente}</p>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <select
                      value={card.status}
                      onChange={(e) => mover(card.id, e.target.value)}
                      className="rounded border border-gray-200 bg-gray-50 px-1.5 py-1 text-xs text-gray-600 outline-none focus:border-brand-500"
                    >
                      {ORCAMENTO_COLUNAS.map((k) => (
                        <option key={k} value={k}>
                          {STATUS_ORCAMENTO[k].label}
                        </option>
                      ))}
                    </select>
                    <Link
                      href={`/orcamentos/${card.id}`}
                      className="text-xs font-medium text-brand-600 hover:underline"
                    >
                      Editar
                    </Link>
                  </div>

                  {card.status !== "APROVADO" && (
                    <form action={aprovarEGerarOS.bind(null, card.id)} className="mt-2">
                      <button className="w-full rounded-md bg-green-50 px-2 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100">
                        ✓ Aprovar e gerar OS
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
