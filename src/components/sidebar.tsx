"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/(app)/actions";

type Item = { href: string; label: string; icon: string; adminOnly?: boolean };

const ITENS: Item[] = [
  { href: "/dashboard", label: "Painel", icon: "◧" },
  { href: "/gerencial", label: "Painel Gerencial", icon: "◑", adminOnly: true },
  { href: "/kanban", label: "Quadro Kanban", icon: "▦" },
  { href: "/orcamentos", label: "Orçamentos", icon: "▢", adminOnly: true },
  { href: "/ordens", label: "Ordens de Serviço", icon: "⚒" },
  { href: "/financeiro/receber", label: "Contas a Receber", icon: "▼", adminOnly: true },
  { href: "/financeiro/pagar", label: "Contas a Pagar", icon: "▲", adminOnly: true },
  { href: "/relatorios", label: "Relatórios", icon: "▧", adminOnly: true },
  { href: "/clientes", label: "Clientes", icon: "◲", adminOnly: true },
  { href: "/contratos", label: "Contratos", icon: "▤", adminOnly: true },
  { href: "/colaboradores", label: "Colaboradores", icon: "☺", adminOnly: true },
];

export default function Sidebar({
  nome,
  role,
}: {
  nome: string;
  role: "ADMIN" | "COLABORADOR";
}) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const itens = ITENS.filter((i) => !i.adminOnly || role === "ADMIN");

  return (
    <>
      {/* Topo mobile */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <span className="font-bold text-gray-900">Manutenção</span>
        <button
          className="btn-secondary px-3 py-1"
          onClick={() => setAberto((v) => !v)}
        >
          ☰
        </button>
      </div>

      <aside
        className={`${
          aberto ? "block" : "hidden"
        } w-full border-b border-gray-200 bg-white md:block md:h-screen md:w-64 md:border-b-0 md:border-r`}
      >
        <div className="flex h-full flex-col">
          <div className="hidden items-center gap-2 border-b border-gray-200 px-5 py-4 md:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">
              M
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-gray-900">
                Manutenção
              </p>
              <p className="text-xs text-gray-400">Prestação de serviços</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {itens.map((item) => {
              const ativo =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setAberto(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                    ativo
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-200 p-3">
            <div className="mb-2 px-2">
              <p className="truncate text-sm font-medium text-gray-900">
                {nome}
              </p>
              <p className="text-xs text-gray-400">
                {role === "ADMIN" ? "Administrador" : "Colaborador"}
              </p>
            </div>
            <form action={logoutAction}>
              <button className="btn-secondary w-full" type="submit">
                Sair
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
