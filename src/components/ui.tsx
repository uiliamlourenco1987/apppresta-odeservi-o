import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  titulo,
  subtitulo,
  acao,
}: {
  titulo: string;
  subtitulo?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-gray-500">{subtitulo}</p>}
      </div>
      {acao}
    </div>
  );
}

export function BotaoLink({
  href,
  children,
  variante = "primary",
}: {
  href: string;
  children: ReactNode;
  variante?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={variante === "primary" ? "btn-primary" : "btn-secondary"}
    >
      {children}
    </Link>
  );
}

export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`badge ${className}`}>{children}</span>;
}

export function EmptyState({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 p-12 text-center">
      <p className="text-lg font-medium text-gray-900">{titulo}</p>
      {descricao && <p className="max-w-sm text-sm text-gray-500">{descricao}</p>}
      {acao}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
