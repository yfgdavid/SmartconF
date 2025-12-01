# 🏢 SmartconF - Sistema de Gestão Condominial

Sistema completo de gestão condominial desenvolvido em React + TypeScript, oferecendo uma solução moderna e intuitiva para administração de condomínios.

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Edge%20Functions-3ECF8E?logo=supabase)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Usar](#como-usar)
- [Arquitetura](#arquitetura)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## 🎯 Sobre o Projeto

SmartconF é uma plataforma web completa para gestão condominial que permite:

- **Para Síndicos**: Gerenciar condomínio, unidades, moradores, ocorrências, espaços comuns, comunicados, finanças e boletos
- **Para Moradores**: Visualizar e criar ocorrências, reservar espaços comuns, visualizar comunicados, boletos e gerenciar perfil

### Características Principais

- ✅ Interface responsiva e moderna
- ✅ Sistema de autenticação seguro via Supabase Auth
- ✅ Atualização em tempo real (polling a cada 10 segundos)
- ✅ Tema claro/escuro
- ✅ Backend serverless usando Supabase Edge Functions
- ✅ Armazenamento de dados em Key-Value Store (KV Store)

## ✨ Funcionalidades

### 🔐 Autenticação
- Login e cadastro de usuários
- Dois tipos de perfil: Síndico e Morador
- Recuperação de senha
- Validação de formulários

### 👨‍💼 Dashboard do Síndico
- **Visão Geral**: Estatísticas em tempo real do condomínio
- **Condomínio**: Cadastro e edição de informações
- **Unidades**: Gerenciamento de unidades residenciais
- **Moradores**: Lista e gestão de moradores
- **Ocorrências**: Visualização e atualização de status
- **Espaços**: Gerenciamento de espaços comuns e reservas
- **Comunicados**: Criação e envio de comunicados
- **Financeiro**: Gestão de receitas/despesas e boletos

### 👤 Dashboard do Morador
- **Visão Geral**: Estatísticas pessoais
- **Ocorrências**: Criar e acompanhar ocorrências
- **Reservas**: Reservar espaços comuns
- **Comunicados**: Visualizar comunicados do condomínio
- **Boletos**: Visualizar e baixar boletos
- **Perfil**: Editar informações pessoais
- **Vincular Unidade**: Vincular conta a uma unidade

## 🛠️ Tecnologias

### Frontend
- **React 18.3.1** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite 6.3.5** - Build tool e dev server ultra-rápido
- **Tailwind CSS** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis e não estilizados
- **Lucide React** - Biblioteca de ícones
- **React Hook Form** - Biblioteca para gerenciamento de formulários
- **Sonner** - Sistema de notificações toast
- **Recharts** - Biblioteca de gráficos

### Backend
- **Hono** - Framework web minimalista para Edge Functions
- **Supabase Edge Functions** - Runtime serverless (Deno)
- **Supabase Auth** - Sistema de autenticação
- **KV Store** - Armazenamento chave-valor (PostgreSQL JSONB)

### Infraestrutura
- **Supabase** - Backend as a Service (BaaS)
  - Autenticação de usuários
  - Edge Functions serverless
  - PostgreSQL (via KV Store)

## 📁 Estrutura do Projeto

```
SmartconF/
├── src/
│   ├── components/              # Componentes React
│   │   ├── Login.tsx           # Tela de login/cadastro
│   │   ├── DashboardSindico.tsx # Dashboard do síndico
│   │   ├── DashboardMorador.tsx # Dashboard do morador
│   │   ├── sindico/            # Módulos do síndico
│   │   │   ├── OcorrenciasManager.tsx
│   │   │   ├── EspacosManager.tsx
│   │   │   ├── ComunicadosManager.tsx
│   │   │   ├── FinanceiroManager.tsx
│   │   │   ├── BoletosManager.tsx
│   │   │   ├── MoradoresManager.tsx
│   │   │   ├── UnidadesManager.tsx
│   │   │   └── CondominioInfo.tsx
│   │   ├── morador/            # Módulos do morador
│   │   │   ├── MinhasOcorrencias.tsx
│   │   │   ├── MinhasReservas.tsx
│   │   │   ├── MeusComunicados.tsx
│   │   │   ├── MeusBoletos.tsx
│   │   │   ├── MeuPerfil.tsx
│   │   │   └── VincularUnidade.tsx
│   │   └── ui/                 # Componentes UI reutilizáveis
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       └── ...
│   ├── utils/
│   │   ├── supabase/
│   │   │   ├── client.tsx      # Cliente Supabase e helpers
│   │   │   └── info.tsx        # Configurações do projeto
│   │   └── ThemeContext.tsx    # Gerenciamento de tema
│   ├── types/
│   │   └── index.ts            # Definições TypeScript
│   ├── supabase/
│   │   └── functions/
│   │       └── server/
│   │           ├── index.tsx   # API Backend principal
│   │           └── kv_store.tsx # Helper para KV Store
│   ├── App.tsx                 # Componente raiz
│   └── main.tsx                # Entry point
├── package.json
├── vite.config.ts
└── README.md
```

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Conta no Supabase (para backend)

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/SmartconF.git
cd SmartconF
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Supabase**

   - Crie um projeto no [Supabase](https://supabase.com)
   - Crie a tabela KV Store (ver documentação do Supabase)
   - Configure as variáveis de ambiente

4. **Configure as credenciais**

   Edite `src/utils/supabase/info.tsx` com suas credenciais do Supabase:
   ```typescript
   export const projectId = "seu-project-id"
   export const publicAnonKey = "sua-public-anon-key"
   ```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

6. **Acesse a aplicação**
```
http://localhost:3000
```

## ⚙️ Configuração

### Variáveis de Ambiente

O projeto usa credenciais do Supabase que devem ser configuradas em:
- `src/utils/supabase/info.tsx`

### Deploy do Backend (Edge Function)

1. **Instale o Supabase CLI**
```bash
npm install -g supabase
```

2. **Faça login**
```bash
supabase login
```

3. **Link com seu projeto**
```bash
supabase link --project-ref seu-project-ref
```

4. **Faça deploy da Edge Function**
```bash
supabase functions deploy make-server-fafb1703
```

## 💻 Como Usar

### Primeiro Acesso

1. Acesse a aplicação
2. Clique em "Cadastro"
3. Preencha os dados:
   - Nome completo
   - E-mail
   - Telefone (opcional)
   - Senha (mínimo 6 caracteres)
   - Tipo de usuário (Síndico ou Morador)
   - ID do Condomínio (opcional, deixe em branco para criar novo)
4. Clique em "Realizar Cadastro"
5. Faça login com suas credenciais

### Para Síndicos

- Após o login, você terá acesso completo ao dashboard
- Configure primeiro o condomínio (aba "Condomínio")
- Cadastre as unidades do condomínio
- Gerencie moradores, ocorrências, espaços, comunicados e finanças

### Para Moradores

- Faça login ou cadastre-se
- Vincule sua conta a uma unidade (se necessário)
- Visualize e crie ocorrências
- Reserve espaços comuns
- Visualize comunicados e boletos

## 🏗️ Arquitetura

### Visão Geral

```
┌─────────────────────────────────────┐
│      Frontend (React + TS)          │
│  Componentes, Hooks, Context API    │
└──────────────┬──────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────┐
│   Backend (Supabase Edge Function)  │
│   Hono Framework + Rotas REST       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Supabase Services              │
│  ┌────────────┐  ┌─────────────┐   │
│  │    Auth    │  │  KV Store   │   │
│  │  (JWT)     │  │  (Postgres) │   │
│  └────────────┘  └─────────────┘   │
└─────────────────────────────────────┘
```

### Fluxo de Dados

1. **Autenticação**: Frontend → Supabase Auth → JWT Token
2. **Requisições**: Frontend → Edge Function (com token JWT)
3. **Armazenamento**: Edge Function → KV Store (PostgreSQL)
4. **Resposta**: Edge Function → Frontend (JSON)

## 🔄 Sistema de Atualização em Tempo Real

O sistema utiliza **polling** para atualizar dados automaticamente:

- Atualização automática a cada **10 segundos**
- Implementado via `setInterval` nos componentes principais
- Simula atualização em tempo real sem necessidade de WebSocket

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Gera build de produção

# Deploy (requer Supabase CLI)
supabase functions deploy make-server-fafb1703
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ para facilitar a gestão condominial.

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma [Issue](https://github.com/seu-usuario/SmartconF/issues)
- Entre em contato através do e-mail

---

**⭐ Se este projeto foi útil para você, considere dar uma estrela!**
