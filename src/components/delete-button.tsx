"use client";

import { useFormStatus } from "react-dom";

function Btn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
      disabled={pending}
      onClick={(e) => {
        if (!confirm("Tem certeza? Esta ação não pode ser desfeita.")) {
          e.preventDefault();
        }
      }}
    >
      {pending ? "..." : label}
    </button>
  );
}

export default function DeleteButton({
  action,
  label = "Excluir",
}: {
  action: () => Promise<void>;
  label?: string;
}) {
  return (
    <form action={action} className="inline">
      <Btn label={label} />
    </form>
  );
}
