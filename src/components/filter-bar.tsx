import Link from "next/link";

type Campo =
  | {
      tipo: "busca";
      name: string;
      placeholder?: string;
      valor?: string;
    }
  | {
      tipo: "select";
      name: string;
      valor?: string;
      opcoes: { valor: string; label: string }[];
      placeholderOpcao?: string;
    };

/**
 * Barra de filtros reutilizável. Renderiza um formulário GET — os valores
 * viram query params na URL, lidos por `searchParams` na página.
 */
export default function FilterBar({
  action,
  campos,
  temFiltroAtivo,
}: {
  action: string;
  campos: Campo[];
  temFiltroAtivo?: boolean;
}) {
  return (
    <form
      method="get"
      action={action}
      className="card mb-4 flex flex-wrap items-center gap-3 p-3"
    >
      {campos.map((c) =>
        c.tipo === "busca" ? (
          <input
            key={c.name}
            type="search"
            name={c.name}
            defaultValue={c.valor ?? ""}
            placeholder={c.placeholder ?? "Buscar..."}
            className="input max-w-xs flex-1"
          />
        ) : (
          <select
            key={c.name}
            name={c.name}
            defaultValue={c.valor ?? ""}
            className="input max-w-xs"
          >
            <option value="">{c.placeholderOpcao ?? "Todos"}</option>
            {c.opcoes.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.label}
              </option>
            ))}
          </select>
        )
      )}
      <button type="submit" className="btn-primary">
        Filtrar
      </button>
      {temFiltroAtivo && (
        <Link href={action} className="text-sm font-medium text-gray-500 hover:underline">
          Limpar
        </Link>
      )}
    </form>
  );
}
