-- AlterTable
ALTER TABLE "OrdemServico" ADD COLUMN "local" TEXT;
ALTER TABLE "OrdemServico" ADD COLUMN "prazo" DATETIME;

-- CreateTable
CREATE TABLE "Preventiva" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "contratoId" TEXT,
    "colaboradorId" TEXT,
    "titulo" TEXT NOT NULL,
    "categoria" TEXT,
    "frequencia" TEXT NOT NULL,
    "proximaData" DATETIME NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Preventiva_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Preventiva_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Preventiva_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "canal" TEXT NOT NULL,
    "destinatario" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "erro" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enviadoEm" DATETIME
);
