"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/auth";

const TAMANHO_MAX = 3_000_000; // 3 MB

async function podeEditar(ordemId: string) {
  const sessao = await exigirSessao();
  const ordem = await prisma.ordemServico.findUnique({ where: { id: ordemId } });
  if (!ordem) return false;
  if (sessao.role === "COLABORADOR" && ordem.colaboradorId !== sessao.colaboradorId) {
    return false;
  }
  return true;
}

export async function uploadFoto(
  ordemId: string,
  _prev: { erro?: string; msg?: string } | undefined,
  formData: FormData
): Promise<{ erro?: string; msg?: string }> {
  if (!(await podeEditar(ordemId))) {
    return { erro: "Sem permissão para anexar nesta OS." };
  }

  const file = formData.get("foto") as File | null;
  if (!file || file.size === 0) return { erro: "Selecione uma imagem." };
  if (!file.type.startsWith("image/")) return { erro: "Envie um arquivo de imagem." };
  if (file.size > TAMANHO_MAX) return { erro: "Imagem muito grande (máx. 3 MB)." };

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
  const legenda = String(formData.get("legenda") || "").trim() || null;

  await prisma.fotoOS.create({
    data: { ordemId, nome: file.name, dados: dataUrl, legenda },
  });

  revalidatePath(`/ordens/${ordemId}`);
  return { msg: "Foto adicionada." };
}

export async function excluirFoto(id: string) {
  const foto = await prisma.fotoOS.findUnique({ where: { id } });
  if (!foto) return;
  if (!(await podeEditar(foto.ordemId))) return;
  await prisma.fotoOS.delete({ where: { id } });
  revalidatePath(`/ordens/${foto.ordemId}`);
}
