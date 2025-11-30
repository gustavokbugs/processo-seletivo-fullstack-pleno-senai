# Frontend - Registro de Ponto

Sistema de Registro de Ponto - Interface Web

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **React Router v6** - Roteamento e navegação
- **Tailwind CSS** - Framework CSS utilitário
- **Axios** - Cliente HTTP com interceptors
- **Lucide React** - Ícones modernos
- **Vite** - Build tool rápida

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout/          # Layout principal com sidebar
│   │   ├── ProtectedRoute/  # HOC para rotas protegidas
│   │   └── ConfirmModal/    # Modal de confirmação
│   ├── contexts/
│   │   └── AuthContext.jsx  # Context de autenticação
│   ├── pages/
│   │   ├── Login/           # Tela de login
│   │   ├── Colaboradores/   # CRUD de colaboradores
│   │   ├── Usuarios/        # CRUD de usuários
│   │   ├── Feriados/        # CRUD de feriados
│   │   └── Ponto/           # Registro de ponto
│   ├── services/
│   │   ├── api.js           # Configuração Axios + interceptors
│   │   └── index.js         # Serviços de API
│   ├── App.jsx              # Componente raiz com rotas
│   ├── main.jsx             # Entrada da aplicação
│   └── index.css            # Estilos globais Tailwind
├── Dockerfile               # Container production
├── nginx.conf               # Configuração Nginx
├── package.json
└── vite.config.js
```

## 🔐 Autenticação

### Context API
- `AuthContext` gerencia estado de autenticação
- Login salva JWT no localStorage
- Interceptor Axios adiciona token automaticamente
- Redirecionamento automático em 401

### Rotas Protegidas
```jsx
<ProtectedRoute requireAdmin>
  <Component />
</ProtectedRoute>
```

## 🎨 Componentes Principais

### Layout
- Sidebar responsiva com navegação
- Header com informações do usuário
- Logout integrado

### ConfirmModal
- Modal reutilizável para confirmações
- Usado em todos os deletes

### Páginas CRUD
Cada módulo (Colaboradores, Usuários, Feriados) possui:
- **List** - Listagem com tabela
- **Form** - Inserção e edição
- Validações inline
- Feedback de erro/sucesso
- Loading states

## 🔌 Integração com Backend

### Axios Interceptors

**Request Interceptor:**
```javascript
// Adiciona JWT token automaticamente
config.headers.Authorization = `Bearer ${token}`
```

**Response Interceptor:**
```javascript
// Trata erros 401 (token inválido)
// Trata erros 404, 409, 500
// Exibe mensagens amigáveis
```

### Serviços
- `authService` - Login, logout, verificação
- `colaboradorService` - CRUD colaboradores
- `usuarioService` - CRUD usuários
- `feriadoService` - CRUD feriados
- `pontoService` - Registro de ponto
- `cargoService` - Listagem de cargos
- `funcaoService` - Listagem de funções

## 🚦 Rotas

| Rota | Componente | Proteção |
|------|-----------|----------|
| `/login` | Login | Pública |
| `/` | Dashboard | Autenticado |
| `/colaboradores` | ColaboradorList | Admin |
| `/colaboradores/novo` | ColaboradorForm | Admin |
| `/colaboradores/editar/:id` | ColaboradorForm | Admin |
| `/usuarios` | UsuarioList | Admin |
| `/feriados` | FeriadoList | Admin |
| `/ponto` | RegistroPonto | Autenticado |

## 🎯 Funcionalidades Implementadas

### ✅ Login
- Validação de campos obrigatórios
- Feedback de erros do backend
- Loading state
- Redirecionamento após sucesso

### ✅ Colaboradores
- Lista com todas as informações
- Formulário com validações:
  - CPF único (verificação em tempo real)
  - Nome com formato correto
  - Email válido
  - Datas de admissão/rescisão
  - Username gerado automaticamente
- Edição bloqueando CPF
- Exclusão com confirmação

### ✅ Usuários
- Lista com tipo e status
- Formulário com:
  - Username único
  - Senha mínima 8 caracteres
  - Tipo (Admin/Colaborador)
- Edição sem alterar username
- Exclusão com confirmação

### ✅ Feriados
- Lista ordenada por data
- Formulário simples
- Validação de data única
- Exclusão com confirmação

## 🐳 Docker

### Dockerfile Multi-stage
1. **Build Stage**: Compila o app React
2. **Production Stage**: Serve com Nginx

### Nginx
- SPA routing (fallback para index.html)
- Gzip compression
- Cache de assets estáticos

## 🛠️ Desenvolvimento Local

```bash
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:3000

## 🔧 Variáveis de Ambiente

Backend URL configurada em `src/services/api.js`:
```javascript
baseURL: 'http://localhost:4000/api'
```

## 📦 Build

```bash
npm run build
```

Gera pasta `dist/` otimizada para produção.

## 🎨 Tailwind CSS

Classes customizadas em `index.css`:
- `.btn-primary` - Botão principal
- `.btn-secondary` - Botão secundário
- `.btn-danger` - Botão de exclusão
- `.input-field` - Campo de entrada
- `.card` - Container com sombra
- `.table-*` - Estilos de tabela

## ✨ Features

- ✅ Design responsivo
- ✅ Loading states
- ✅ Error handling
- ✅ Success feedback
- ✅ Confirmação de exclusão
- ✅ Validações inline
- ✅ Token JWT automático
- ✅ Logout funcional
- ✅ Proteção de rotas
- ✅ Sidebar colapsável

## 🔒 Segurança

- JWT armazenado em localStorage
- Token enviado em todas as requisições
- Logout limpa credenciais
- Redirecionamento automático em 401
- Rotas protegidas por tipo de usuário

## 📱 Responsividade

- Mobile-first design
- Sidebar adaptativa
- Tabelas com scroll horizontal
- Grid responsivo
- Botões touch-friendly
