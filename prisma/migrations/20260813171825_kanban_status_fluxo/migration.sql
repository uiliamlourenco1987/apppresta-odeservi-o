-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrdemServico" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "clienteId" TEXT NOT NULL,
    "contratoId" TEXT,
    "colaboradorId" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'CORRETIVA',
    "categoria" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "prioridade" TEXT NOT NULL DEFAULT 'MEDIA',
    "status" TEXT NOT NULL DEFAULT 'CHAMADO',
    "custo" REAL NOT NULL DEFAULT 0,
    "dataAbertura" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAgendada" DATETIME,
    "dataConclusao" DATETIME,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "OrdemServico_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrdemServico_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrdemServico_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrdemServico" ("atualizadoEm", "categoria", "clienteId", "colaboradorId", "contratoId", "criadoEm", "custo", "dataAbertura", "dataAgendada", "dataConclusao", "descricao", "id", "numero", "observacoes", "prioridade", "status", "tipo", "titulo") SELECT "atualizadoEm", "categoria", "clienteId", "colaboradorId", "contratoId", "criadoEm", "custo", "dataAbertura", "dataAgendada", "dataConclusao", "descricao", "id", "numero", "observacoes", "prioridade", "status", "tipo", "titulo" FROM "OrdemServico";
DROP TABLE "OrdemServico";
ALTER TABLE "new_OrdemServico" RENAME TO "OrdemServico";
CREATE UNIQUE INDEX "OrdemServico_numero_key" ON "OrdemServico"("numero");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
