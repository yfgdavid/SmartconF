# 📦 Código Completo para Deploy Manual

## ⚠️ IMPORTANTE

O dashboard do Supabase não aceita múltiplos arquivos no deploy manual.

Você precisa usar **Supabase CLI** OU seguir as instruções abaixo para fazer deploy manual com arquivo único.

---

## 🚀 OPÇÃO RECOMENDADA: Usar Supabase CLI

```bash
# 1. Instalar o Supabase CLI
npm install -g supabase

# 2. Fazer login no Supabase
supabase login

# 3. Linkar com seu projeto
supabase link --project-ref lqes4n3icGVe3F00EOtd5a

# 4. Fazer deploy da função
cd /caminho/para/seu/projeto
supabase functions deploy make-server-fafb1703 --project-ref lqes4n3icGVe3F00EOtd5a
```

Isso vai:
- ✅ Copiar todos os arquivos automaticamente
- ✅ Incluir `index.tsx` e `kv_store.tsx`
- ✅ Fazer o deploy corretamente
- ✅ Funcionar de primeira

---

## 📋 Por que o deploy manual falhou?

O erro foi:
```
Module not found "file:///tmp/.../kv_store.tsx"
```

**Motivo:** Você copiou apenas o `index.tsx`, mas ele importa o `kv_store.tsx`:

```typescript
import * as kv from "./kv_store.tsx";  // ← Este arquivo estava faltando!
```

A Edge Function precisa de **2 arquivos**:
1. `index.tsx` - Código principal da API
2. `kv_store.tsx` - Helper para salvar dados

---

## 🔧 Alternativa: Deploy Manual via Dashboard (NÃO RECOMENDADO)

Se você realmente não pode usar o CLI, você precisa:

### Opção A: Criar a função com estrutura de pastas

Infelizmente, o dashboard do Supabase não permite upload de múltiplos arquivos facilmente. Você precisaria:

1. Criar a função via CLI uma vez
2. Depois editar via dashboard

### Opção B: Inline o código do kv_store.tsx

Não recomendo porque fica muito confuso, mas é tecnicamente possível substituir:

```typescript
import * as kv from "./kv_store.tsx";
```

Por todo o código do `kv_store.tsx` diretamente no arquivo.

---

## ✅ Solução Definitiva: Use o CLI!

### Passo a Passo Completo:

#### 1. Instale o Supabase CLI

**Windows:**
```bash
# Com npm (recomendado)
npm install -g supabase

# Ou com Scoop
scoop install supabase
```

**Mac:**
```bash
# Com npm
npm install -g supabase

# Ou com Homebrew
brew install supabase/tap/supabase
```

**Linux:**
```bash
# Com npm
npm install -g supabase
```

#### 2. Faça Login

```bash
supabase login
```

Isso abrirá o navegador para você fazer login.

#### 3. Navegue até a pasta do projeto

```bash
cd /caminho/onde/esta/o/projeto/smartcon
```

**Importante:** Você precisa estar na pasta raiz onde está a pasta `supabase/functions/`.

#### 4. Link com o projeto

```bash
supabase link --project-ref lqes4n3icGVe3F00EOtd5a
```

#### 5. Deploy!

```bash
supabase functions deploy make-server-fafb1703
```

Ou especificando o projeto:

```bash
supabase functions deploy make-server-fafb1703 --project-ref lqes4n3icGVe3F00EOtd5a
```

---

## 📊 Estrutura esperada do projeto:

```
seu-projeto/
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx      ← Código principal
│           └── kv_store.tsx   ← Helper KV
├── components/
├── types/
└── ...
```

Quando você roda `supabase functions deploy make-server-fafb1703`, o CLI:
1. Lê todos os arquivos em `supabase/functions/server/`
2. Faz upload de todos eles
3. Cria o bundle correto no Supabase
4. Deploy com sucesso! ✅

---

## 🆘 Troubleshooting

### "supabase: command not found"

Instale o CLI:
```bash
npm install -g supabase
```

### "Failed to link project"

1. Certifique-se de estar logado: `supabase login`
2. Verifique se o project-ref está correto: `lqes4n3icGVe3F00EOtd5a`
3. Verifique se você tem permissões no projeto

### "No such file or directory: supabase/functions"

Você está na pasta errada. Navegue até a raiz do projeto onde está a pasta `supabase/`.

### Ainda com erro?

Verifique a estrutura:
```bash
ls -la supabase/functions/server/
```

Deve mostrar:
```
index.tsx
kv_store.tsx
```

---

## ⏱️ Tempo estimado com CLI

- Instalação do CLI: 2-3 minutos
- Login e link: 1 minuto
- Deploy: 30 segundos

**Total: ~5 minutos** (muito mais rápido que tentar pelo dashboard!)

---

## ✨ Depois do Deploy

Teste o sistema:
1. Login no Smartcon
2. Crie uma reserva como morador → status "Aguardando Aprovação"
3. Login como síndico → veja a reserva pendente
4. Aprove a reserva → status muda para "Confirmada"
5. Volte como morador → veja a reserva confirmada

Tudo sincronizado em tempo real! 🎉
