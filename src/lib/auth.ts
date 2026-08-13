import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "sessao";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-troque-em-producao"
);

export type Sessao = {
  userId: string;
  nome: string;
  role: "ADMIN" | "COLABORADOR";
  colaboradorId: string | null;
};

export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10);
}

export async function verificarSenha(
  senha: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

async function criarToken(sessao: Sessao): Promise<string> {
  return new SignJWT(sessao)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function criarSessao(sessao: Sessao): Promise<void> {
  const token = await criarToken(sessao);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function encerrarSessao(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function obterSessao(): Promise<Sessao | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      nome: payload.nome as string,
      role: payload.role as "ADMIN" | "COLABORADOR",
      colaboradorId: (payload.colaboradorId as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

/** Retorna a sessão ou lança — usar em páginas/ações protegidas. */
export async function exigirSessao(): Promise<Sessao> {
  const sessao = await obterSessao();
  if (!sessao) throw new Error("NAO_AUTENTICADO");
  return sessao;
}

export async function exigirAdmin(): Promise<Sessao> {
  const sessao = await exigirSessao();
  if (sessao.role !== "ADMIN") throw new Error("SEM_PERMISSAO");
  return sessao;
}

export async function autenticar(
  email: string,
  senha: string
): Promise<Sessao | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.ativo) return null;
  const ok = await verificarSenha(senha, user.senhaHash);
  if (!ok) return null;
  return {
    userId: user.id,
    nome: user.nome,
    role: user.role,
    colaboradorId: user.colaboradorId,
  };
}
