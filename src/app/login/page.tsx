import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/auth";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const sessao = await obterSessao();
  if (sessao) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-600 to-brand-700 p-4">
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-xl font-bold text-white">
            M
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Controle de Manutenção
          </h1>
          <p className="mt-1 text-sm text-gray-500">Acesse sua conta</p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-xs text-gray-400">
          Prestação de serviços • Condomínios e prédios
        </p>
      </div>
    </main>
  );
}
