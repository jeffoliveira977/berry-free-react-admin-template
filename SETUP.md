# 🚀 Setup e Início Rápido

## Pré-requisitos

- Node.js 16+
- Backend ERP TLT rodando em `http://localhost:8080`

## Instalação

```bash
# Instalar dependências
yarn install

# ou
npm install
```

## Configuração do Ambiente

1. **Crie um arquivo `.env` na raiz do projeto:**

```env
# URL do Backend
VITE_API_URL=http://localhost:8080

# Base da aplicação (alterar se publicada em subdiretório)
VITE_APP_BASE_NAME=/
```

2. **Se o backend está em outro host:**

```env
VITE_API_URL=https://seu-backend.com.br
VITE_APP_BASE_NAME=/
```

## Executar o Projeto

```bash
# Modo desenvolvimento com reloading
yarn start

# ou
npm start
```

A aplicação abrirá automaticamente em `http://localhost:3000`

## 🔐 Login

1. Acesse: `http://localhost:3000/pages/login`
2. Use as credenciais de um usuário cadastrado no backend:
   - Email: `usuario@example.com`
   - Senha: `sua_senha`

## 📋 Rotas Disponíveis

### Públicas (sem autenticação)
- `/pages/login` - Tela de login
- `/pages/register` - Tela de registro (se disponível)

### Protegidas (requerem autenticação)
- `/` - Dashboard
- `/dashboard/default` - Dashboard padrão
- `/tickets` - Lista de tickets
- `/tickets/create` - Criar novo ticket
- `/tickets/{id}` - Detalhes do ticket
- `/typography` - Utilidades: Tipografia
- `/color` - Utilidades: Cores
- `/shadow` - Utilidades: Sombras

## 📦 Build para Produção

```bash
# Gerar build otimizado
yarn build

# ou
npm run build
```

A pasta `dist/` terá os arquivos prontos para deploy.

## 🧪 Testar a Integração

### 1. Verificar Login
```bash
# No console do navegador (F12), após fazer login:
localStorage.getItem('token')
localStorage.getItem('user')
```

### 2. Testar Requisição Autenticada
```javascript
// No console do navegador:
const token = localStorage.getItem('token');
fetch('http://localhost:8080/api/tickets', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(r => r.json()).then(console.log);
```

## 🐛 Troubleshooting

### Problema: "CORS error"
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solução**: O backend precisa ter CORS configurado para aceitar requisições de `http://localhost:3000`

### Problema: "401 Unauthorized"
```
Error 401: Unauthorized
```
**Solução**: 
- Verifique se o token está sendo enviado corretamente
- Verifique se o token não expirou
- Tente fazer login novamente

### Problema: "Cannot find module"
```
Error: Cannot find module 'contexts/AuthContext'
```
**Solução**: Execute `yarn install` para garantir todas as dependências

### Problema: Usuário é deslogado automaticamente
**Solução**:
- Verifique o tempo de expiração do token no backend
- Verifique se o refresh token está funcionando
- Limpe o cache do navegador

## 📚 Documentação

Para informações detalhadas sobre a integração com o backend, consulte: [INTEGRAÇÃO_BACKEND.md](./INTEGRAÇÃO_BACKEND.md)

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## 📝 Notas Importantes

- O arquivo `.env` **não deve ser versionado** (adicione à `.gitignore`)
- Nunca exponha tokens em URLs
- Use HTTPS em produção
- Revise as credenciais antes de fazer commit

## 🆘 Suporte

Para dúvidas sobre o setup, consulte a equipe de desenvolvimento ou o repositório do backend.
