# Backend - Registro de Ponto

Backend para sistema de registro de ponto desenvolvido com Node.js, Express e Prisma.

## Tecnologias

- Node.js 18+
- Express
- Prisma ORM
- PostgreSQL
- JWT para autenticação
- bcrypt para hash de senhas

## Estrutura do Projeto

```
backend/
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   └── seed.js            # Seeds iniciais
├── src/
│   ├── config/
│   │   └── database.js    # Configuração Prisma Client
│   ├── middlewares/
│   │   └── authMiddleware.js  # Middleware de autenticação JWT
│   ├── modules/
│   │   ├── auth/          # Módulo de autenticação
│   │   ├── usuarios/      # Módulo de usuários
│   │   ├── colaboradores/ # Módulo de colaboradores
│   │   ├── feriados/      # Módulo de feriados
│   │   ├── ponto/         # Módulo de registro de ponto
│   │   ├── cargos/        # Módulo de cargos
│   │   └── funcoes/       # Módulo de funções
│   ├── utils/
│   │   ├── AppError.js    # Classe de erro customizada
│   │   ├── catchAsync.js  # Wrapper para async handlers
│   │   └── errorHandler.js # Handler global de erros
│   └── server.js          # Arquivo principal
├── .env                   # Variáveis de ambiente
├── .env.example           # Exemplo de variáveis
├── package.json
└── Dockerfile
```

## Instalação Local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Gerar Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev

# Executar seeds
npm run prisma:seed

# Iniciar servidor
npm run dev
```

## Docker

```bash
# Build da imagem
docker build -t clockwork-backend .

# Executar container
docker run -p 3001:3001 --env-file .env clockwork-backend
```

## API Endpoints

### Autenticação (Público)
- `POST /api/auth/login` - Login
- `POST /api/auth/verify` - Verificar token
- `GET /api/auth/me` - Dados do usuário logado (requer auth)

### Usuários (Requer auth - Admin)
- `GET /api/usuarios` - Listar usuários
- `GET /api/usuarios/:id` - Buscar usuário
- `POST /api/usuarios` - Criar usuário
- `PUT /api/usuarios/:id` - Atualizar usuário
- `DELETE /api/usuarios/:id` - Deletar usuário
- `GET /api/usuarios/check-username?usuario=nome` - Verificar disponibilidade

### Colaboradores (Requer auth - Admin)
- `GET /api/colaboradores` - Listar colaboradores
- `GET /api/colaboradores/:id` - Buscar colaborador
- `POST /api/colaboradores` - Criar colaborador
- `PUT /api/colaboradores/:id` - Atualizar colaborador
- `DELETE /api/colaboradores/:id` - Deletar colaborador
- `GET /api/colaboradores/check-cpf?cpf=12345678900` - Verificar CPF
- `GET /api/colaboradores/generate-username?nome=Nome Sobrenome` - Gerar username

### Feriados (Requer auth)
- `GET /api/feriados` - Listar feriados
- `GET /api/feriados/:id` - Buscar feriado
- `POST /api/feriados` - Criar feriado (Admin)
- `PUT /api/feriados/:id` - Atualizar feriado (Admin)
- `DELETE /api/feriados/:id` - Deletar feriado (Admin)

### Registro de Ponto (Requer auth)
- `POST /api/ponto/registrar` - Registrar ponto
- `GET /api/ponto/meus-registros` - Meus registros
- `GET /api/ponto/hoje` - Registros de hoje
- `GET /api/ponto` - Todos os registros (Admin)

### Cargos e Funções (Requer auth)
- `GET /api/cargos` - Listar cargos
- `GET /api/funcoes` - Listar funções

## Autenticação

Todas as rotas (exceto `/api/auth/login`) requerem autenticação via JWT token no header:

```
Authorization: Bearer <token>
```

## Credenciais Padrão

Após executar o seed:
- Usuário: `admin`
- Senha: `12345678`

## Regras de Negócio Implementadas

### Colaboradores
- CPF único e validado
- Nome deve começar com maiúscula e ter sobrenome
- Email validado
- Username gerado automaticamente (nome_sobrenome)
- Validação de datas (rescisão não pode ser anterior à admissão)
- Quadro de horários com máximo de 44h semanais

### Registro de Ponto
- Alternância automática entre ENTRADA/SAIDA
- Validação de intervalo entre jornadas (11h)
- Validação de intervalo intrajornada (1h)
- Alerta de TAC para jornadas > 10h
- Alerta de horas extras
- Geolocalização obrigatória

### Usuários
- Senha mínima de 8 caracteres
- Hash com bcrypt
- Username único
- Tipos: ADMINISTRADOR ou COLABORADOR

## Códigos HTTP

- 200: Sucesso
- 201: Criado
- 204: Sem conteúdo (delete)
- 400: Requisição inválida
- 401: Não autenticado
- 403: Sem permissão
- 404: Não encontrado
- 409: Conflito (duplicado)
- 500: Erro interno

## Desenvolvimento

```bash
# Executar em modo desenvolvimento
npm run dev

# Executar testes
npm test

# Gerar nova migration
npx prisma migrate dev --name nome_da_migration

# Visualizar banco de dados
npx prisma studio
```
