import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Populando banco com dados de exemplo...");

  const senhaHash = await bcrypt.hash("123456", 10);

  // Colaboradores
  const joao = await prisma.colaborador.create({
    data: {
      nome: "João Silva",
      funcao: "Elétrica",
      telefone: "(11) 98888-1111",
      tipo: "PRESTADOR",
      valorPadrao: 250,
    },
  });
  const maria = await prisma.colaborador.create({
    data: {
      nome: "Maria Souza",
      funcao: "Hidráulica",
      telefone: "(11) 97777-2222",
      tipo: "CLT",
      valorPadrao: 200,
    },
  });

  // Usuários (login)
  await prisma.user.create({
    data: {
      nome: "Administrador",
      email: "admin@empresa.com",
      senhaHash,
      role: "ADMIN",
    },
  });
  await prisma.user.create({
    data: {
      nome: "João Silva",
      email: "joao@empresa.com",
      senhaHash,
      role: "COLABORADOR",
      colaboradorId: joao.id,
    },
  });

  // Clientes
  const alpha = await prisma.cliente.create({
    data: {
      nome: "Condomínio Alpha",
      cnpj: "12.345.678/0001-90",
      endereco: "Rua das Flores, 100 — São Paulo/SP",
      sindico: "Carlos Mendes",
      telefone: "(11) 3333-4444",
      email: "sindico@alpha.com",
    },
  });
  const beta = await prisma.cliente.create({
    data: {
      nome: "Edifício Beta",
      cnpj: "98.765.432/0001-10",
      endereco: "Av. Central, 500 — São Paulo/SP",
      sindico: "Ana Paula",
      telefone: "(11) 5555-6666",
    },
  });

  // Contratos
  const contratoAlpha = await prisma.contrato.create({
    data: {
      clienteId: alpha.id,
      descricao: "Manutenção predial mensal",
      escopo: "Elétrica, hidráulica e áreas comuns",
      valorMensal: 2500,
      diaVencimento: 10,
      dataInicio: new Date("2026-01-01"),
      status: "ATIVO",
    },
  });
  await prisma.contrato.create({
    data: {
      clienteId: beta.id,
      descricao: "Manutenção preventiva trimestral",
      escopo: "Elevadores e bombas",
      valorMensal: 1800,
      diaVencimento: 5,
      dataInicio: new Date("2026-03-01"),
      status: "ATIVO",
    },
  });

  // Ordens de serviço
  await prisma.ordemServico.createMany({
    data: [
      {
        numero: 1,
        clienteId: alpha.id,
        contratoId: contratoAlpha.id,
        colaboradorId: joao.id,
        tipo: "CORRETIVA",
        categoria: "ELETRICA",
        titulo: "Troca de disjuntor queimado",
        descricao: "Disjuntor do hall de entrada desarmando.",
        prioridade: "ALTA",
        status: "EM_EXECUCAO",
        custo: 180,
      },
      {
        numero: 2,
        clienteId: alpha.id,
        contratoId: contratoAlpha.id,
        colaboradorId: maria.id,
        tipo: "CORRETIVA",
        categoria: "HIDRAULICA",
        titulo: "Vazamento na garagem",
        prioridade: "URGENTE",
        status: "CHAMADO",
      },
      {
        numero: 3,
        clienteId: beta.id,
        colaboradorId: joao.id,
        tipo: "PREVENTIVA",
        categoria: "ELEVADOR",
        titulo: "Inspeção trimestral dos elevadores",
        prioridade: "MEDIA",
        status: "OS_ABERTA",
        dataAgendada: new Date("2026-09-15"),
      },
      {
        numero: 4,
        clienteId: beta.id,
        colaboradorId: maria.id,
        tipo: "CORRETIVA",
        categoria: "PINTURA",
        titulo: "Pintura do corredor do 3º andar",
        descricao: "Falta finalizar acabamento das bordas.",
        prioridade: "BAIXA",
        status: "EXECUCAO_PARCIAL",
        custo: 400,
      },
      {
        numero: 5,
        clienteId: alpha.id,
        contratoId: contratoAlpha.id,
        colaboradorId: joao.id,
        tipo: "CORRETIVA",
        categoria: "LIMPEZA",
        titulo: "Desentupimento da caixa de gordura",
        prioridade: "MEDIA",
        status: "EXECUCAO_TOTAL",
        custo: 320,
        dataConclusao: new Date("2026-08-10"),
      },
    ],
  });

  // Pagamentos a colaboradores
  await prisma.pagamentoColaborador.create({
    data: {
      colaboradorId: joao.id,
      descricao: "Serviço elétrico — OS #1",
      valor: 250,
      status: "PENDENTE",
    },
  });

  // Recebimentos
  await prisma.recebimento.create({
    data: {
      contratoId: contratoAlpha.id,
      competencia: "2026-08",
      valor: 2500,
      vencimento: new Date("2026-08-10"),
      status: "PENDENTE",
    },
  });

  // Orçamentos
  await prisma.orcamento.createMany({
    data: [
      {
        numero: 1,
        clienteId: alpha.id,
        titulo: "Reforma da fachada",
        descricao: "Pintura completa e reparos no reboco.",
        valor: 8500,
        status: "ENVIADO",
      },
      {
        numero: 2,
        clienteId: beta.id,
        titulo: "Modernização do quadro elétrico",
        valor: 4200,
        status: "SOLICITADO",
      },
      {
        numero: 3,
        clienteId: alpha.id,
        titulo: "Troca de bomba d'água",
        valor: 2300,
        status: "APROVADO",
      },
    ],
  });

  // Preventivas (agenda)
  const hoje = new Date();
  await prisma.preventiva.createMany({
    data: [
      {
        clienteId: beta.id,
        contratoId: null,
        colaboradorId: joao.id,
        titulo: "Inspeção dos elevadores",
        categoria: "ELEVADOR",
        frequencia: "TRIMESTRAL",
        proximaData: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 12),
      },
      {
        clienteId: alpha.id,
        contratoId: contratoAlpha.id,
        colaboradorId: maria.id,
        titulo: "Limpeza da caixa d'água",
        categoria: "LIMPEZA",
        frequencia: "SEMESTRAL",
        proximaData: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 3),
      },
    ],
  });

  console.log("✅ Concluído!");
  console.log("   Admin:       admin@empresa.com / 123456");
  console.log("   Colaborador: joao@empresa.com / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
