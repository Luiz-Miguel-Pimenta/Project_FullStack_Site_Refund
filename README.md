# 💸 Refund — Sistema de Solicitação de Reembolso

Aplicação **fullstack** para gerenciamento de pedidos de reembolso corporativo. Funcionários submetem despesas com comprovantes; gestores visualizam, filtram e aprovam as solicitações em um dashboard dedicado.

---

## 📋 Sobre o Projeto

O **Refund** é um sistema web composto por uma **API REST** (Node.js + TypeScript) e um **frontend SPA** (React + TypeScript). O acesso é controlado por dois perfis distintos — `employee` e `manager` — cada um com rotas e telas exclusivas. A autenticação é feita via **JWT** e os arquivos de comprovante são armazenados localmente via **Multer**.

---

## 🗂️ Estrutura do Monorepo

```
Refund/
├── Api/       # Backend — Node.js, Express, Prisma, SQLite
└── Web/       # Frontend — React, Vite, Tailwind CSS
```

---

## 🔧 Backend — API REST

### Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | — | Runtime |
| TypeScript | ^5.7 | Tipagem estática |
| Express | ^4.19 | Servidor HTTP |
| Prisma ORM | ^6.2 | Acesso ao banco de dados |
| SQLite | — | Banco de dados (arquivo `dev.db`) |
| JWT (jsonwebtoken) | ^9.0 | Autenticação com tokens |
| Bcrypt | ^5.1 | Hash de senhas |
| Multer | ^1.4 | Upload de arquivos |
| Zod | ^3.24 | Validação de dados |
| tsx | ^4.19 | Execução TypeScript em desenvolvimento |

### Estrutura da API

```
Api/
├── prisma/
│   ├── schema.prisma         # Modelos do banco de dados
│   ├── dev.db                # Banco SQLite local
│   └── migrations/           # Histórico de migrações
├── src/
│   ├── app.ts                # Configuração do Express
│   ├── server.ts             # Inicialização do servidor
│   ├── configs/
│   │   ├── auth.ts           # Configuração JWT (secret + expiração)
│   │   └── upload.ts         # Configuração Multer (tamanho, tipos aceitos)
│   ├── controllers/
│   │   ├── users-controller.ts
│   │   ├── sessions-controller.ts
│   │   ├── refunds-controller.ts
│   │   └── uploads-controller.ts
│   ├── database/
│   │   └── prisma.ts         # Instância do Prisma Client
│   ├── middlewares/
│   │   ├── ensure-authenticated.ts     # Verifica token JWT
│   │   ├── verify-user-Authorization.ts # Verifica role do usuário
│   │   └── error-handling.ts           # Tratamento global de erros
│   ├── providers/
│   │   └── disk-storage.ts   # Salva/deleta arquivos no disco
│   ├── routes/
│   │   ├── index.ts
│   │   ├── users-routes.ts
│   │   ├── sessions-routes.ts
│   │   ├── refunds-routes.ts
│   │   └── uploads-routes.ts
│   ├── types/
│   │   └── express.d.ts      # Extensão do tipo Request (user: { id, role })
│   └── utils/
│       └── AppError.ts       # Classe de erros personalizados
└── tmp/
    └── uploads/              # Comprovantes enviados pelos funcionários
```

### Banco de Dados

**Modelos Prisma (SQLite):**

```
User
├── id         String   (UUID)
├── name       String
├── email      String   (único)
├── password   String   (hash bcrypt)
├── role       UserRole (employee | manager) — padrão: employee
├── refunds    Refunds[]
├── createdAt  DateTime
└── updatedAt  DateTime?

Refunds
├── id         String   (UUID)
├── name       String
├── amount     Float
├── category   Category (food | accommodation | services | transport | others)
├── filename   String   (nome do arquivo no servidor)
├── userId     String   (FK → User)
├── createdAt  DateTime
└── updatedAt  DateTime?
```

### Rotas da API

#### 🔓 Rotas Públicas

| Método | Rota | Descrição | Body |
|---|---|---|---|
| `POST` | `/users` | Cadastrar usuário | `{ name, email, password, role? }` |
| `POST` | `/sessions` | Login / gerar token JWT | `{ email, password }` |

#### 🔐 Rotas Privadas (requerem `Authorization: Bearer <token>`)

| Método | Rota | Descrição | Role | Query Params |
|---|---|---|---|---|
| `POST` | `/refunds` | Criar solicitação de reembolso | `employee` | — |
| `GET` | `/refunds` | Listar todas as solicitações | `manager` | `name`, `page`, `perPage` |
| `GET` | `/refunds/:id` | Ver detalhes de uma solicitação | `employee` ou `manager` | — |
| `POST` | `/uploads` | Enviar arquivo de comprovante | `employee` | — |

> **Upload:** `POST /uploads` recebe `multipart/form-data` com o campo `file`. Aceita `image/jpeg`, `image/jpg` e `image/png`. Tamanho máximo: **1MB**. Retorna `{ filename }` para ser usado na criação do reembolso.

> **Paginação:** `GET /refunds` suporta `?name=João&page=1&perPage=10`. A resposta inclui o objeto `pagination: { page, perPage, totalRecords, totalPages }`.

#### Exemplo de Response — `POST /sessions`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "employee",
    "createdAt": "2025-01-15T17:53:39.000Z"
  }
}
```

### Como Rodar a API

**1. Instale as dependências:**
```bash
cd Api
npm install
```

**2. Configure as variáveis de ambiente:**

> A API usa SQLite com arquivo local, portanto **não precisa de `DATABASE_URL` no `.env`** — o banco fica em `prisma/dev.db`. O `authConfig` já está embutido em `src/configs/auth.ts`.

**3. Execute as migrações do banco:**
```bash
npx prisma migrate dev
```

**4. Inicie o servidor em modo desenvolvimento:**
```bash
npm run dev
```

A API ficará disponível em `http://localhost:3333`.

---

## 🖥️ Frontend — SPA React

### Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| React | ^19.2 | Biblioteca de UI |
| TypeScript | ~6.0 | Tipagem estática |
| Vite | ^8.0 | Bundler e dev server |
| Tailwind CSS | ^4.2 | Estilização utilitária |
| React Router | ^7.14 | Roteamento |
| Axios | ^1.15 | Requisições HTTP |
| Zod | ^4.3 | Validação de formulários |
| clsx + tailwind-merge | — | Utilitários de classes CSS |

### Estrutura do Frontend

```
Web/
├── public/
│   └── icon.svg
├── src/
│   ├── App.tsx                  # Raiz: AuthProvider + Routes
│   ├── main.tsx                 # Entry point
│   ├── index.css                # Estilos globais Tailwind
│   ├── assets/                  # SVGs (categorias, ícones, logo)
│   ├── components/
│   │   ├── AppLayout.tsx        # Layout autenticado (com Header)
│   │   ├── AuthLayout.tsx       # Layout de autenticação (sem Header)
│   │   ├── Header.tsx           # Cabeçalho com logo e botão de logout
│   │   ├── Button.tsx           # Botão reutilizável (com variante icon + loading)
│   │   ├── Input.tsx            # Campo de input com legenda
│   │   ├── Select.tsx           # Select com legenda
│   │   ├── Upload.tsx           # Componente de upload de arquivos
│   │   ├── RefundItem.tsx       # Card de solicitação no Dashboard
│   │   ├── Pagination.tsx       # Controles de paginação (anterior / próximo)
│   │   └── Loading.tsx          # Tela de carregamento
│   ├── contexts/
│   │   └── AuthContext.tsx      # Contexto global de autenticação (JWT + localStorage)
│   ├── hooks/
│   │   └── useAuth.tsx          # Hook para consumir AuthContext
│   ├── dtos/
│   │   ├── user.d.ts            # Tipo UserAPIResponse
│   │   ├── refund.d.ts          # Tipos RefundAPIResponse, RefundsPaginationAPIResponse
│   │   └── categories.d.ts      # Tipo das categorias
│   ├── pages/
│   │   ├── SignIn.tsx           # Login
│   │   ├── SignUp.tsx           # Cadastro
│   │   ├── Dashboard.tsx        # Lista de solicitações (manager)
│   │   ├── Refund.tsx           # Formulário de solicitação (employee) / Visualização (manager)
│   │   ├── Confirm.tsx          # Confirmação de envio
│   │   └── NotFound.tsx         # Página 404
│   ├── routes/
│   │   ├── index.tsx            # Roteador principal (detecta role)
│   │   ├── AuthRoutes.tsx       # Rotas públicas (login, cadastro)
│   │   ├── EmploeeRoutes.tsx    # Rotas do funcionário
│   │   └── ManagerRoutes.tsx    # Rotas do gestor
│   ├── services/
│   │   └── api.ts               # Instância Axios (baseURL: localhost:3333)
│   └── utils/
│       ├── categories.ts        # Mapa categoria → nome PT-BR + ícone SVG
│       ├── formatCurrency.ts    # Formata valores como moeda
│       └── classMerge.ts        # Utilitário clsx + tailwind-merge
```

### Fluxo de Autenticação

O `AuthContext` gerencia a sessão via **localStorage**:
- `@refund:token` — JWT salvo após login
- `@refund:user` — dados do usuário serializados

Ao carregar a aplicação, o contexto restaura a sessão e injeta o token no header `Authorization` do Axios automaticamente.

### Roteamento por Perfil

O roteador principal detecta o `role` do usuário logado e renderiza o conjunto de rotas correto:

```
Não autenticado  →  AuthRoutes    →  /        (SignIn)
                                     /signup  (SignUp)

employee         →  EmployeeRoutes →  /        (formulário de solicitação)
                                      /confirm  (confirmação de envio)

manager          →  ManagerRoutes  →  /           (Dashboard com listagem)
                                      /refund/:id  (visualização de solicitação)
```

### Categorias de Despesa

| Chave | Nome exibido | Ícone |
|---|---|---|
| `food` | Alimentação | 🍽️ |
| `accommodation` | Hospedagem | 🏨 |
| `services` | Serviços | 🛠️ |
| `transport` | Transporte | 🚗 |
| `others` | Outros | 📦 |

### Como Rodar o Frontend

**1. Instale as dependências:**
```bash
cd Web
npm install
```

**2. Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

O frontend ficará disponível em `http://localhost:5173`.

> ⚠️ Certifique-se de que a API já está rodando em `http://localhost:3333` antes de acessar o frontend.

---

## 🚀 Rodando o Projeto Completo

Em dois terminais separados:

```bash
# Terminal 1 — API
cd Api
npm install
npx prisma migrate dev
npm run dev

# Terminal 2 — Frontend
cd Web
npm install
npm run dev
```

Acesse: `http://localhost:5173`

---

## 📁 Scripts Disponíveis

### API (`/Api`)
| Script | Comando | Descrição |
|---|---|---|
| `dev` | `tsx watch src/server.ts` | Servidor com hot reload |

### Web (`/Web`)
| Script | Comando | Descrição |
|---|---|---|
| `dev` | `vite` | Dev server com HMR |
| `build` | `tsc -b && vite build` | Build de produção |
| `preview` | `vite preview` | Preview do build |

---

## 🔒 Segurança

- Senhas armazenadas com **bcrypt** (salt rounds: 8)
- Autenticação via **JWT** com expiração de 1 dia
- Rotas privadas protegidas pelos middlewares `ensureAuthenticated` e `verifyUserAuthorization`
- Validação de entrada em todos os endpoints com **Zod**
- Upload restrito a arquivos `JPEG/JPG/PNG` com limite de tamanho de **1MB**
