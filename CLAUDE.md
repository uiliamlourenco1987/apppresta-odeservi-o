# CLAUDE.md — Controle de Manutenção

Guia para agentes de IA e desenvolvedores que forem trabalhar neste projeto.

## Visão geral

Sistema **web** para uma empresa de **prestação de serviços** que administra
condomínios e prédios. Controla contratos, colaboradores, ordens de serviço
(manutenções), orçamentos, financeiro, agenda de preventivas e notificações.

Idioma da interface e do código de domínio: **português (pt-BR)**.

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **React 19**
- **Tailwind CSS 3** (utilitários + componentes em `globals.css`)
- **Prisma ORM** + **SQLite** (dev). Em produção, trocar para PostgreSQL
- **Autenticação própria**: JWT em cookie httpOnly (`jose`) + `bcryptjs`
- Sem bibliotecas de UI externas (componentes escritos à mão)
- Mutações via **Server Actions**; leituras via **Server Components**

## Comandos

```bash
npm install                 # instala dependências (roda prisma generate)
cp .env.example .env        # configura variáveis
npx prisma migrate deploy   # aplica migrações (ou: npx prisma migrate dev)
npm run db:seed             # popula dados de exemplo
npm run dev                 # desenvolvimento em http://localhost:3000
npm run build               # build de produção (valida tipos) — SEMPRE rodar antes de commit
npm run db:studio           # Prisma Studio (inspeção do banco)
```

Para recriar o banco do zero em dev (troca de status/enum no seed):
`rm -f prisma/dev.db && npx prisma migrate deploy && npm run db:seed`

## Usuários de exemplo (após o seed)

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@empresa.com` | `123456` |
| Colaborador | `joao@empresa.com` | `123456` |

## Perfis de acesso (roles)

- **ADMIN** (escritório): acesso total a todos os módulos.
- **COLABORADOR**: vê/edita apenas as **próprias** OS (Painel, Kanban, Ordens).
  Não vê cadastros, financeiro, orçamentos, agenda nem notificações.

Regra de menu: itens com `adminOnly: true` em `src/components/sidebar.tsx`.

## Autenticação (`src/lib/auth.ts`)

- `autenticar(email, senha)` valida credenciais.
- `criarSessao(sessao)` grava o cookie JWT (`sessao`), expira em 7 dias.
- `obterSessao()` lê/valida o cookie (retorna `Sessao | null`).
- `exigirSessao()` / `exigirAdmin()` protegem páginas e actions (lançam erro).
- Proteção de rotas é feita nos **layouts/páginas** (server components), não em
  middleware. `src/app/(app)/layout.tsx` redireciona para `/login` se não houver
  sessão. Páginas admin chamam `exigirAdmin()`.

## Modelo de dados (`prisma/schema.prisma`)

- **User** — login; `role` ADMIN|COLABORADOR; vínculo opcional a Colaborador.
- **Cliente** — condomínio/prédio (nome, cnpj, endereço, síndico, contato...).
- **Contrato** — do cliente; valorMensal, diaVencimento, vigência, status.
- **Colaborador** — nome, função, tipo (CLT|PRESTADOR), valorPadrao.
- **OrdemServico** — `numero` (int sequencial, atribuído na aplicação), cliente,
  contrato?, colaborador?, tipo (PREVENTIVA|CORRETIVA), categoria, prioridade,
  **status** (fluxo Kanban), `local`, `prazo` (SLA), custo, datas, observações.
- **FotoOS** — foto da OS (imagem em **data URL base64** no campo `dados`).
- **PagamentoColaborador** — a pagar; colaborador, descrição, valor, status.
- **Recebimento** — a receber; contrato, competência (AAAA-MM), vencimento, status.
- **Orcamento** — `numero`, cliente, valor, **status** (fluxo Kanban), validade.
- **Preventiva** — manutenção recorrente; frequência, `proximaData`, colaborador?.
- **Notificacao** — log de avisos (canal, destinatário, assunto, status).

### Enums/fluxos (strings — ver `src/lib/format.ts`)

- **Status da OS** (`KANBAN_COLUNAS`): `CHAMADO → OS_ABERTA → EM_EXECUCAO →
  EXECUCAO_PARCIAL → EXECUCAO_TOTAL` (+ `CANCELADA`). Default: `CHAMADO`.
- **Status do Orçamento** (`ORCAMENTO_COLUNAS`): `SOLICITADO → ENVIADO →
  APROVADO → REPROVADO`.
- **Prioridade**: BAIXA|MEDIA|ALTA|URGENTE. **Categoria**: ELETRICA, HIDRAULICA,
  PINTURA, LIMPEZA, JARDINAGEM, ELEVADOR, OUTRO.
- **Frequência preventiva**: MENSAL|BIMESTRAL|TRIMESTRAL|SEMESTRAL|ANUAL.

`format.ts` centraliza rótulos, cores (classes Tailwind) e helpers de formatação
(`formatarMoeda`, `formatarData`, `paraInputDate`, `proximaDataApos`).

## Estrutura de rotas (`src/app`)

```
login/                         Tela de login (público)
(app)/                         Área autenticada (layout com sidebar)
  dashboard/                   Painel resumido
  gerencial/                   Painel Gerencial (KPIs + gráficos de barra CSS)
  kanban/                      Quadro Kanban de OS (drag & drop)
  agenda/  [nova] [id]         Agenda de preventivas (recorrência)
  orcamentos/  [novo] [id]     Quadro de Orçamentos (drag & drop; aprovar → OS)
  ordens/  [novo] [id]         Ordens de Serviço (form, status, fotos, filtros)
  financeiro/receber/          Contas a Receber (gerar mensalidades, baixa)
  financeiro/pagar/            Contas a Pagar (lançar, marcar pago)
  relatorios/                  Resumo + botões de exportação/impressão
  notificacoes/                Log + teste + avisar vencidos
  clientes/  [novo] [id]       CRUD
  contratos/  [novo] [id]      CRUD
  colaboradores/  [novo] [id]  CRUD
api/relatorios/os/             Exporta OS em CSV (route handler)
api/relatorios/financeiro/     Exporta financeiro em CSV
```

## Padrões e convenções

- **CRUD**: cada módulo tem `actions.ts` (server actions com validação `zod`),
  um `*-form.tsx` (client component com `useActionState` + `useFormStatus`),
  `page.tsx` (lista), `novo/page.tsx` e `[id]/page.tsx`.
- **Server actions** validam permissão no início (`exigirAdmin()` etc.), validam
  entrada com `zod`, chamam Prisma, `revalidatePath(...)` e `redirect(...)`.
- Ações com id são vinculadas com `.bind(null, id)` (ex.: botões de excluir).
- **Exclusão preserva histórico**: registros com dependências (OS, contratos)
  são **inativados** em vez de apagados (ver `excluirCliente`, `excluirContrato`).
- **Filtros**: componente reutilizável `src/components/filter-bar.tsx` (form GET
  → query params lidos por `searchParams` na página). Presente em clientes,
  contratos, colaboradores, ordens e no financeiro.
- **Numeração** de OS e Orçamento: `max(numero)+1` calculado na action (SQLite
  não permite `autoincrement()` fora do `@id`).
- **UI**: helpers em `src/components/ui.tsx` (`PageHeader`, `Badge`, `EmptyState`,
  `Field`, `BotaoLink`) e classes utilitárias em `globals.css` (`.btn-primary`,
  `.card`, `.input`, `.badge`, `.label`).
- **Quadros Kanban** (`kanban-board.tsx`, `orcamento-board.tsx`): client
  components com drag & drop nativo (HTML5) + atualização otimista + `router
  .refresh()`; cada card também tem um `<select>` de status (usável no celular).

## Regras de negócio importantes

- OS marcada como **EXECUCAO_TOTAL** preenche `dataConclusao` automaticamente.
- **Colaborador** só cria/edita OS atribuídas a si; ao criar, a OS já entra no
  nome dele (o campo "responsável" some no formulário).
- **Orçamento aprovado** → `aprovarEGerarOS` cria uma OS vinculada ao cliente.
- **Preventiva** → `gerarOSPreventiva` cria a OS (tipo PREVENTIVA) e avança
  `proximaData` conforme a frequência (`proximaDataApos`).
- **Recebimentos**: `gerarMensalidades(competencia)` cria uma cobrança para cada
  contrato ATIVO no mês (sem duplicar).
- **SLA**: OS com `prazo` vencido e status não concluído mostra selo "Atrasada".

## Notificações (`src/lib/notificacoes.ts`)

- Toda notificação é **registrada** na tabela `Notificacao`.
- Envio real depende de `NOTIFICACAO_WEBHOOK_URL` (POST JSON com
  `{ canal, destinatario, assunto, corpo }`). Sem a variável → status `SIMULADO`.
- Aponte o webhook para Zapier / n8n / API de e-mail (Resend) ou WhatsApp.
- `notificarNovaOS(os)` avisa o colaborador; `avisarVencidos()` avisa clientes
  com recebimentos em aberto.

## Variáveis de ambiente (`.env`)

```
DATABASE_URL="file:./dev.db"     # SQLite em dev; Postgres em produção
AUTH_SECRET="<chave-aleatoria-longa>"
NOTIFICACAO_WEBHOOK_URL="..."    # opcional (envio de notificações)
```

## Observações para produção

- Trocar SQLite por **PostgreSQL** (Neon/Supabase): ajustar `datasource` e rodar
  as migrações. Alguns filtros usam `contains` (case-insensitive no SQLite);
  no Postgres, usar `mode: "insensitive"` se necessário.
- **Fotos** hoje ficam como base64 no banco — migrar para armazenamento de
  objetos (S3 / Supabase Storage) guardando apenas a URL em `FotoOS.dados`.
- Deploy sugerido: **Vercel** + banco gerenciado.
- Integração fiscal (nota/boleto) pode ser feita depois via **Bling** (API).

## Git / fluxo de trabalho

- Branch de desenvolvimento: `claude/maintenance-control-system-974720`.
- Sempre rodar `npm run build` antes de commitar (valida tipos e rotas).
- Mensagens de commit descritivas em português.

## Próximos passos (ideias)

- Publicar online (Vercel + Postgres) para acesso mobile.
- Integração de e-mail/WhatsApp direta (Resend/Twilio) além do webhook.
- Múltiplos colaboradores por OS; campos SLA em horas.
- Integração com Bling (emissão fiscal e financeiro).
