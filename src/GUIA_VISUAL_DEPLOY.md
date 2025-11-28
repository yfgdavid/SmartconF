# 🎯 Guia Visual - Deploy Manual da Edge Function

## Resumo Rápido

**O que fazer:** Copiar o código do arquivo `index.tsx` e colar no Dashboard do Supabase

**Tempo estimado:** 3-5 minutos

---

## 📍 Passo 1: Acesse o Supabase Dashboard

```
🌐 URL: https://supabase.com/dashboard/project/lqes4n3icGVe3F00EOtd5a
```

1. Abra a URL acima no seu navegador
2. Faça login se necessário

---

## 📍 Passo 2: Encontre a Edge Function

### 2.1 - Menu Lateral Esquerdo

Procure no menu lateral esquerdo por:

```
📁 Database
📁 Authentication  
📁 Storage
⚡ Edge Functions  ← CLIQUE AQUI
📁 SQL Editor
...
```

### 2.2 - Lista de Funções

Você verá algo assim:

```
┌─────────────────────────────────────────────┐
│ Edge Functions                               │
├─────────────────────────────────────────────┤
│                                              │
│  📄 make-server-fafb1703      [Deploy]      │ ← CLIQUE AQUI
│     Status: Active                           │
│     Region: All regions                      │
│                                              │
└─────────────────────────────────────────────┘
```

Clique no nome **`make-server-fafb1703`**

---

## 📍 Passo 3: Abra o Editor

Você verá abas no topo:

```
┌─────────────────────────────────────────────┐
│  Details  │  Logs  │  Invocations  │  Code  │
└─────────────────────────────────────────────┘
```

**Opção A:** Clique na aba **"Code"**

**Opção B:** Procure um botão **"Edit function"** ou **"Deploy new version"**

---

## 📍 Passo 4: Substitua o Código

### 4.1 - Selecione Tudo

No editor de código que aparecer:

1. Clique dentro do editor
2. Pressione `Ctrl+A` (Windows/Linux) ou `Cmd+A` (Mac)
3. Todo o código ficará selecionado (azul)

### 4.2 - Delete o Código Antigo

1. Pressione `Delete` ou `Backspace`
2. O editor ficará vazio

### 4.3 - Copie o Código Novo

**IMPORTANTE:** Você precisa copiar EXATAMENTE como está no arquivo `/supabase/functions/server/index.tsx`

#### Como copiar:

**Método 1 - Pelo Figma Make:**
1. No Figma Make, clique no arquivo `/supabase/functions/server/index.tsx` na árvore de arquivos
2. Pressione `Ctrl+A` ou `Cmd+A` para selecionar tudo
3. Pressione `Ctrl+C` ou `Cmd+C` para copiar

**Método 2 - Por este guia:**
O arquivo completo está disponível logo abaixo neste documento (seção "CÓDIGO COMPLETO")

### 4.4 - Cole no Editor do Supabase

1. Clique no editor vazio no Supabase
2. Pressione `Ctrl+V` (Windows/Linux) ou `Cmd+V` (Mac)
3. Verifique se o código foi colado completamente

**Verificação:**
- O código deve começar com: `import { Hono } from "npm:hono";`
- O código deve terminar com: `Deno.serve(app.fetch);`
- O arquivo deve ter aproximadamente 950+ linhas

---

## 📍 Passo 5: Faça o Deploy

Procure no canto superior direito por um botão:

```
[ Deploy ]  ou  [ Save ]  ou  [ Update function ]
```

1. Clique no botão
2. Aguarde a mensagem de sucesso (10-30 segundos)

Você pode ver algo como:

```
✅ Function deployed successfully
✅ Deploy completed in 12.3s
```

---

## 📍 Passo 6: Teste

1. Volte para a aplicação Smartcon no seu navegador
2. Faça uma ação (ex: criar uma reserva)
3. Verifique se funcionou

Se aparecer erro:
- Vá em **Logs** na Edge Function
- Veja mensagens de erro em vermelho

---

## ⚠️ Problemas Comuns

### ❌ Erro: "Permission denied" ou 403

**Solução:** Você não tem permissão de "owner" no projeto. Peça para o administrador do projeto dar permissões ou use o Supabase CLI.

### ❌ Erro: "Syntax error" no deploy

**Solução:** O código foi colado incorretamente. Verifique:
- Você copiou TODO o arquivo?
- Não ficou nenhum código antigo misturado?
- O arquivo termina com `Deno.serve(app.fetch);`?

### ❌ Deploy bem-sucedido mas não funciona

**Solução:**
1. Vá em Edge Functions → make-server-fafb1703 → **Logs**
2. Procure por erros em vermelho
3. Veja o que está dando erro
4. Talvez você precise limpar o cache do navegador

### ❌ Botão "Deploy" está desabilitado/cinza

**Solução:** Você pode não ter permissões ou o editor está vazio. Certifique-se de:
- Ter colado o código
- Estar logado como owner/admin do projeto

---

## ✅ Como Saber se Deu Certo

Depois do deploy:

1. **Dashboard do Síndico:**
   - Deve mostrar estatísticas atualizadas
   - Reservas pendentes aparecem

2. **Criar Reserva (Morador):**
   - Status deve ser "Aguardando Aprovação"
   - Aparece no dashboard do síndico em ~10 segundos

3. **Aprovar Reserva (Síndico):**
   - Botões "Aprovar" e "Rejeitar" aparecem
   - Ao clicar, status muda instantaneamente

4. **Vincular Unidade:**
   - Morador consegue selecionar uma unidade
   - Ao vincular, a mudança é salva permanentemente

---

## 📄 Onde Está o Código Completo

O código completo para copiar está no arquivo:

```
/supabase/functions/server/index.tsx
```

**Total de linhas:** ~950 linhas

**Estrutura:**
- Linhas 1-64: Imports e configurações
- Linhas 65-227: Rotas de autenticação (signup, login)
- Linhas 228-299: Rotas de condomínio
- Linhas 300-382: Rotas de ocorrências
- Linhas 383-488: Rotas de espaços
- Linhas 489-634: Rotas de reservas (COM A NOVA ROTA DE APROVAÇÃO)
- Linhas 635-747: Rotas de comunicados
- Linhas 748-817: Rotas de transações
- Linhas 818-961: Rotas de unidades (COM A NOVA ROTA DE VINCULAR)
- Linhas 962-1005: Rotas de boletos

---

## 🆘 Precisa de Ajuda?

1. **Verifique os logs:**
   - Edge Functions → make-server-fafb1703 → Logs

2. **Teste a função:**
   - Edge Functions → make-server-fafb1703 → Invocations

3. **Documentação oficial:**
   - https://supabase.com/docs/guides/functions

4. **Alternativa:**
   - Use o Supabase CLI (Opção 1 da documentação principal)

---

## 🎉 Sucesso!

Se você conseguiu fazer o deploy, parabéns! 

Agora o Smartcon está completo com:
- ✅ Sistema de aprovação de reservas
- ✅ Sincronização em tempo real (10s)
- ✅ Vincular unidade ao morador funcionando
- ✅ Todas as funcionalidades integradas

Aproveite o sistema! 🏢
