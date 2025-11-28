# 📖 Instruções para Deploy Manual da Edge Function

## 🎯 Passo a Passo Completo

### 1️⃣ Acesse o Dashboard do Supabase

1. Abra: https://supabase.com/dashboard/project/lqes4n3icGVe3F00EOtd5a
2. Faça login na sua conta Supabase

### 2️⃣ Navegue até Edge Functions

1. No menu lateral **esquerdo**, procure por **"Edge Functions"** (ícone de raio ⚡)
2. Clique em **"Edge Functions"**
3. Você verá uma lista de todas as Edge Functions do projeto
4. Procure pela função chamada **`make-server-fafb1703`**
5. Clique no nome da função para abri-la

### 3️⃣ Abra o Editor de Código

Existem duas formas de fazer o deploy:

**Opção A - Pelo botão "Deploy":**
1. Clique no botão **"Deploy"** no canto superior direito
2. Selecione **"Deploy new version"** ou **"New deployment"**

**Opção B - Pela aba "Code":**
1. Clique na aba **"Code"** ou **"Editor"**
2. Você verá um editor de código com o conteúdo atual da função

### 4️⃣ Substitua o Código

1. **SELECIONE TODO O CÓDIGO** que está no editor (Ctrl+A ou Cmd+A)
2. **DELETE** todo o conteúdo selecionado
3. **COPIE** todo o código do arquivo `/supabase/functions/server/index.tsx` (veja abaixo)
4. **COLE** no editor vazio

### 5️⃣ Salve e Deploy

1. Procure pelo botão **"Deploy"**, **"Save"** ou **"Update function"**
2. Clique para fazer o deploy
3. Aguarde a confirmação de sucesso (pode levar 10-30 segundos)
4. Verifique se não há erros na tela

### 6️⃣ Teste a Função

Após o deploy:
1. Volte para a aplicação Smartcon
2. Faça login ou cadastre um novo usuário
3. Teste criar uma reserva como morador
4. Entre como síndico e aprove/rejeite a reserva

---

## 📝 Código Completo para Copiar

**IMPORTANTE:** O código completo está em dois arquivos:

### Arquivo 1: `index.tsx` (Principal)

Copie o conteúdo do arquivo `/supabase/functions/server/index.tsx` do seu projeto.

Este arquivo contém ~950 linhas de código com todas as rotas da API.

### Arquivo 2: `kv_store.tsx` (Helper)

O arquivo `kv_store.tsx` NÃO precisa ser alterado. Ele já está correto no Supabase.

---

## ⚠️ Troubleshooting

### Se aparecer erro 403:
- Você pode não ter permissões de "owner" no projeto
- Peça para o administrador do projeto te dar permissões
- Ou use a opção 1 (Supabase CLI) da documentação principal

### Se aparecer erro de syntax:
- Certifique-se de copiar TODO o código, do início ao fim
- Verifique se não ficou texto cortado
- O arquivo deve terminar com `Deno.serve(app.fetch);`

### Se a função não funcionar após o deploy:
1. Verifique os logs da função no Supabase Dashboard
2. Vá em Edge Functions → make-server-fafb1703 → Logs
3. Procure por erros em vermelho

---

## ✅ Checklist

- [ ] Acessei https://supabase.com/dashboard/project/lqes4n3icGVe3F00EOtd5a
- [ ] Naveguei até Edge Functions no menu lateral
- [ ] Encontrei a função `make-server-fafb1703`
- [ ] Abri o editor de código
- [ ] Apaguei todo o código antigo
- [ ] Colei o código novo completo
- [ ] Cliquei em Deploy/Save
- [ ] Vi mensagem de sucesso
- [ ] Testei a aplicação e está funcionando

---

## 🎉 Próximos Passos

Depois do deploy bem-sucedido:

1. **Teste o sistema de aprovação de reservas:**
   - Entre como morador
   - Crie uma nova reserva
   - Veja o status "Aguardando Aprovação"
   - Entre como síndico
   - Aprove ou rejeite a reserva
   - Volte como morador e veja a atualização

2. **Teste vincular unidade:**
   - Entre como morador
   - Se aparecer a tela de vincular unidade, selecione uma
   - Agora a vinculação será salva no banco de dados real

3. **Verifique a sincronização:**
   - Abra duas abas do navegador
   - Uma como síndico, outra como morador
   - Crie uma ocorrência como morador
   - Veja aparecer para o síndico em ~10 segundos

---

**Dúvidas?** Releia este guia ou consulte a documentação do Supabase: https://supabase.com/docs/guides/functions
