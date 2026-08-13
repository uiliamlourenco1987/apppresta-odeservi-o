import { exigirAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import ColaboradorForm from "../colaborador-form";

export default async function NovoColaboradorPage() {
  await exigirAdmin();
  return (
    <div>
      <PageHeader titulo="Novo colaborador" subtitulo="Cadastrar membro da equipe" />
      <ColaboradorForm />
    </div>
  );
}
