# Controle de Manutenção — Prestação de Serviços

Sistema web para uma empresa que administra condomínios e prédios controlar
**contratos**, **colaboradores**, **ordens de serviço (manutenções)** e valores.

## Stack
- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS**
- **Prisma** + SQLite (desenvolvimento) — troca para PostgreSQL em produção
- Autenticação própria (JWT em cookie httpOnly) com perfis **ADMIN** e **COLABORADOR**

## Como rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Criar o banco e aplicar as migrações
npx prisma migrate dev

# 4. Popular com dados de exemplo (opcional)
npm run db:seed

# 5. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse http://localhost:3000

### Usuários de exemplo (após o seed)
| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | `admin@empresa.com` | `123456` |
| Colaborador | `joao@empresa.com` | `123456` |

## Perfis de acesso
- **ADMIN (escritório):** acesso total — clientes, contratos, colaboradores e todas as ordens de serviço.
- **COLABORADOR:** vê e atualiza apenas as **próprias** ordens de serviço.

## Funcionalidades (atual)
- Login com perfis e proteção de rotas
- Painel com resumo de OS e contratos
- CRUD de **Clientes** (condomínios/prédios)
- CRUD de **Contratos** (valor mensal, vencimento, vigência)
- CRUD de **Colaboradores** (função, tipo, valor padrão)
- **Ordens de Serviço**: criação, filtros por status/cliente/colaborador,
  mudança rápida de status, atribuição a colaborador

## Próximas etapas (planejadas)
- Pagamentos a colaboradores (lançamentos e baixa)
- Financeiro a receber por contrato (mensalidades/competências)
- Fotos nas ordens de serviço e relatórios
- Deploy em produção (Vercel + PostgreSQL gerenciado)

## Scripts úteis
- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run db:studio` — interface visual do banco (Prisma Studio)
- `npm run db:seed` — recria os dados de exemplo
