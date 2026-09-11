# Integração com Backend - Guia de Implementação

## 📋 Resumo das Mudanças

Este documento descreve todas as mudanças realizadas para integrar o frontend com o backend ERP.

### ✅ Mudanças Implementadas

#### 1. **Configuração da API (`src/utils/api.js`)**
   - ✅ Adicionado suporte para Authorization header com Bearer token
   - ✅ Token é enviado automaticamente em todas as requisições autenticadas
   - ✅ Refresh token automático ao receber erro 401/403
   - ✅ Limpeza de token ao fazer logout ou sessão expirar

#### 2. **Serviço de Autenticação (`src/services/authService.js`)**
   - ✅ Função `login(email, password)` - Faz login e armazena token
   - ✅ Função `logout()` - Faz logout e limpa dados locais
   - ✅ Função `refreshToken()` - Renova o token de acesso
   - ✅ Função `getUser()` - Obtém dados do usuário do localStorage
   - ✅ Função `isAuthenticated()` - Verifica se usuário está autenticado

#### 3. **Contexto de Autenticação (`src/contexts/AuthContext.jsx`)**
   - ✅ Gerencia estado de autenticação da aplicação
   - ✅ Persiste estado ao carregar a página
   - ✅ Disponibiliza dados do usuário para toda a aplicação

#### 4. **Hook de Autenticação (`src/hooks/useAuth.js`)**
   - ✅ Hook para acessar o contexto de autenticação em qualquer componente

#### 5. **Tela de Login (`src/views/pages/auth-forms/AuthLogin.jsx`)**
   - ✅ Removidos valores hardcoded
   - ✅ Integrada chamada real ao serviço de autenticação
   - ✅ Validação de campos (email e senha obrigatórios)
   - ✅ Mensagens de erro ao usuário
   - ✅ Loading indicator durante requisição
   - ✅ Redirecionamento automático ao dashboard após login bem-sucedido

#### 6. **Serviço de Tickets (`src/services/ticketService.js`)**
   - ✅ Funções já existentes atualizadas para trabalhar com novo api.js
   - ✅ `getTickets()` - Lista tickets do usuário
   - ✅ `getTicketById(id)` - Obtém detalhes de um ticket
   - ✅ `createTicket(ticketData)` - Cria novo ticket

#### 7. **Lista de Tickets (`src/views/tickets/TicketList.jsx`)**
   - ✅ Busca tickets da API
   - ✅ Tratamento robusto de respostas
   - ✅ Tratamento de erros com mensagem clara

#### 8. **Criação de Tickets (`src/views/tickets/TicketCreate.jsx`)**
   - ✅ Formulário com prioridade e descrição
   - ✅ Validação de campos
   - ✅ Tratamento de erros
   - ✅ Redirecionamento ao visualizar ticket criado

#### 9. **App Component (`src/App.jsx`)**
   - ✅ AuthProvider adicionado como wrapper

#### 10. **Variáveis de Ambiente**
   - ✅ `.env.example` criado com configurações necessárias

---

## 🚀 Como Usar

### Configuração Inicial

1. **Crie um arquivo `.env` na raiz do projeto** (se não existir):
```env
VITE_API_URL=http://localhost:8080
VITE_APP_BASE_NAME=/
```

Ajuste a `VITE_API_URL` para apontar para seu backend.

### Fluxo de Login

1. Usuário acessa `/login`
2. Preenche email e senha
3. Sistema faz requisição POST para `/api/auth/login`
4. Backend retorna token e dados do usuário
5. Token é armazenado em `localStorage`
6. Usuário é redirecionado para `/dashboard/default`

### Fluxo de Tickets

1. Usuário acessa `/tickets`
2. Sistema faz requisição GET para `/api/tickets` com Bearer token
3. Lista de tickets é exibida
4. Ao clicar em "Novo Chamado", vai para `/tickets/create`
5. Preenche formulário e envia
6. Sistema faz requisição POST para `/api/tickets` com dados do ticket
7. Ao sucesso, redireciona para `/tickets/{id}`

---

## 🔌 Endpoints da API Utilizados

### Authentication
```
POST /api/auth/login
- Sem autenticação
- Body: { email, password }
- Response: { token, name, email, role }

POST /api/auth/refresh
- Sem autenticação (usa refreshToken no cookie)
- Response: { token, name, email, role }

POST /api/auth/logout
- Com autenticação (Bearer token)
- Response: {}
```

### Tickets
```
GET /api/tickets
- Com autenticação (Bearer token)
- Response: Array de tickets

POST /api/tickets
- Com autenticação (Bearer token)
- Body: { title, description, priority, category, departmentId }
- Response: { id, title, description, ... }

GET /api/tickets/{id}
- Com autenticação (Bearer token)
- Response: { id, title, description, ... }
```

---

## 🔐 Segurança

### Token Management
- Access token é armazenado em `localStorage`
- Refresh token é armazenado em cookie HttpOnly (automático do servidor)
- Token é enviado automaticamente em todas as requisições autenticadas
- Token é renovado automaticamente ao expirar (erro 401)

### Proteção Contra Erros
- Ao receber 401/403 não-autenticados, sistema faz logout automático
- Usuário é redirecionado para login
- Token e dados de usuário são limpos

---

## 📝 Estrutura de Arquivos Criados/Modificados

```
src/
├── services/
│   ├── authService.js (CRIADO) - Serviço de autenticação
│   └── ticketService.js (MODIFICADO) - Atualizado para nova API
├── contexts/
│   └── AuthContext.jsx (CRIADO) - Contexto de autenticação
├── hooks/
│   └── useAuth.js (CRIADO) - Hook para usar contexto
├── utils/
│   └── api.js (MODIFICADO) - Adicionado Authorization header
├── views/
│   ├── pages/
│   │   └── auth-forms/
│   │       └── AuthLogin.jsx (MODIFICADO) - Login real
│   └── tickets/
│       └── TicketCreate.jsx (MODIFICADO) - Tratamento de erro
└── App.jsx (MODIFICADO) - AuthProvider adicionado

.env (JÁ EXISTE - verificar configuração)
.env.example (CRIADO) - Exemplo de variáveis
```

---

## 🧪 Testando a Integração

### 1. Testar Login
```bash
# Verifique se o backend está rodando em http://localhost:8080
# Acesse http://localhost:3000/login
# Use credenciais válidas de um usuário cadastrado no backend
```

### 2. Testar Listagem de Tickets
```bash
# Após login bem-sucedido
# Acesse http://localhost:3000/tickets
# Sistema deve buscar e exibir tickets
```

### 3. Testar Criação de Tickets
```bash
# Em http://localhost:3000/tickets
# Clique em "Novo Chamado"
# Preencha os dados e envie
# Sistema deve criar ticket no backend
```

---

## 🐛 Troubleshooting

### Problema: CORS Error
**Solução**: Certifique-se que o backend está com CORS configurado para aceitar `http://localhost:3000`

### Problema: Token não é enviado
**Solução**: Verifique se:
- Token está armazenado em `localStorage` com chave `token`
- Backend está recebendo o header `Authorization: Bearer <token>`

### Problema: Usuário é deslogado automaticamente
**Solução**: Verifique se:
- Token está expirando muito rápido
- Refresh token está sendo enviado no cookie
- Backend está respondendo corretamente ao `/api/auth/refresh`

### Problema: Erro "Sessão expirada"
**Solução**:
- Faça login novamente
- Limpe localStorage (F12 > Application > Local Storage)
- Limpe cookies

---

## 📞 Suporte

Para dúvidas sobre a integração, verifique:
1. Console do navegador (F12) para erros
2. Logs do backend para erros na API
3. Documentação do backend
4. Este arquivo de guia

---

**Última atualização**: 2026-09-11
