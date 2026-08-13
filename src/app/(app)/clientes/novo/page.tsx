import { exigirAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import ClienteForm from "../cliente-form";

export default async function NovoClientePage() {
  await exigirAdmin();
  return (
    <div>
      <PageHeader titulo="Novo cliente" subtitulo="Cadastrar condomínio ou prédio" />
      <ClienteForm />
    </div>
  );
}
