-- CreateTable
CREATE TABLE "FotoOS" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ordemId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dados" TEXT NOT NULL,
    "legenda" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FotoOS_ordemId_fkey" FOREIGN KEY ("ordemId") REFERENCES "OrdemServico" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
