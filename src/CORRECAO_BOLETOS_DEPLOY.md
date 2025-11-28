# 🔧 CORREÇÃO SISTEMA DE BOLETOS - GUIA DE DEPLOY

## 📋 Resumo das Correções Implementadas

### Problema Identificado
O sistema de boletos apresentava três problemas principais:
1. **Erro "desconhecido"** ao acessar a aba de boletos (morador)
2. **Dados incompletos no PDF** - Bloco, número da unidade e nome do morador apareciam como "-"
3. **Boletos não apareciam para o morador** mesmo sendo o destinatário correto

### Causa Raiz
**Incompatibilidade de tipos entre IDs**: Os IDs no sistema podem ser strings ou numbers, e a comparação estrita (`===`) falhava quando os tipos não correspondiam.

---

## ✅ Correções Aplicadas

### 1. Backend (`/supabase/functions/server/index.tsx`)

#### Endpoint `/boletos/meus` (linha 1132-1187)
**Mudança principal:** Normalização de IDs para comparação
```typescript
// ANTES (comparação que falhava com tipos diferentes)
const boletosDoMorador = boletos.filter((b: any) => 
  b.id_unidade === userData.id_unidade
);

// DEPOIS (conversão para string antes da comparação)
const userUnidadeId = String(userData.id_unidade);
const boletosDoMorador = boletos.filter((b: any) => {
  const boletoUnidadeId = String(b.id_unidade);
  const match = boletoUnidadeId === userUnidadeId;
  console.log('[Boletos Meus] Comparando:', { boletoUnidadeId, userUnidadeId, match });
  return match;
});
```

#### Endpoint `/boletos` (linha 1071-1129)
**Mudança:** Aplicada a mesma normalização para síndicos e moradores
```typescript
// Para síndico
const userCondominioId = String(userData.id_condominio);
const boletosDoCondominio = boletos.filter((b: any) => 
  String(b.id_condominio) === userCondominioId
);

// Para morador
const userUnidadeId = String(userData.id_unidade);
const boletosDoMorador = boletos.filter((b: any) => 
  String(b.id_unidade) === userUnidadeId
);
```

### 2. Frontend (`/components/morador/MeusBoletos.tsx`)

#### Tratamento de Erros Melhorado (linha 20-50)
```typescript
// ANTES - erro genérico
toast.error(error.message || 'Erro ao carregar boletos');

// DEPOIS - mensagens específicas por tipo de erro
if (error.message.includes('Usuário não encontrado')) {
  toast.error('Sua sessão expirou. Faça login novamente.');
} else if (error.message.includes('401')) {
  toast.error('Não autorizado. Faça login novamente.');
} else if (error.message.includes('403')) {
  toast.error('Você não tem permissão para acessar os boletos.');
} else if (error.message.includes('500')) {
  toast.error('Erro no servidor. Tente novamente mais tarde.');
} else if (error.message && error.message !== 'Erro desconhecido') {
  toast.error(error.message);
} else {
  toast.error('Erro ao carregar boletos. Verifique sua conexão.');
}
```

---

## 🚀 PASSOS PARA DEPLOY

### Método 1: Deploy via Supabase CLI (Recomendado)

#### 1. Instalar Supabase CLI (se ainda não tiver)
```bash
# macOS
brew install supabase/tap/supabase

# Windows (PowerShell)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

#### 2. Login no Supabase
```bash
supabase login
```

#### 3. Linkar ao seu projeto
```bash
supabase link --project-ref <SEU_PROJECT_ID>
```
📝 **Nota:** Encontre seu Project ID em: Supabase Dashboard → Settings → General → Reference ID

#### 4. Fazer Deploy do Edge Function
```bash
supabase functions deploy make-server-fafb1703
```

#### 5. Verificar se funcionou
```bash
supabase functions list
```

---

### Método 2: Deploy Manual via Dashboard

#### 1. Acessar o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Selecione seu projeto

#### 2. Navegar até Edge Functions
- Menu lateral → **Edge Functions**
- Clique no Edge Function **make-server-fafb1703**

#### 3. Atualizar o código
- Copie todo o conteúdo do arquivo `/supabase/functions/server/index.tsx`
- Cole no editor do dashboard
- Clique em **Save** ou **Deploy**

#### 4. Configurar Secrets (se necessário)
- Vá em **Settings** da Edge Function
- Verifique se as variáveis de ambiente estão configuradas:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_ANON_KEY`

---

## 🧪 TESTE APÓS DEPLOY

### 1. Verificar Health Check
```bash
curl https://<SEU_PROJECT_ID>.supabase.co/functions/v1/make-server-fafb1703/health
```
**Resposta esperada:**
```json
{"status":"ok"}
```

### 2. Testar no Aplicativo

#### Como Síndico:
1. Faça login como síndico
2. Vá em **Boletos** e crie um novo boleto para uma unidade com morador vinculado
3. Verifique se o boleto aparece na lista com os dados corretos:
   - ✅ Bloco e número da unidade
   - ✅ Nome do morador
   - ✅ Todos os valores

#### Como Morador:
1. Faça login como morador (com unidade vinculada)
2. Vá em **Meus Boletos**
3. Verifique se:
   - ✅ Os boletos da sua unidade aparecem
   - ✅ Dados do bloco e unidade estão corretos
   - ✅ Seu nome aparece corretamente
   - ✅ Pode gerar o PDF com todas as informações
   - ✅ Pode copiar a linha digitável

---

## ❗ TROUBLESHOOTING

### Erro 403 persiste após deploy
**Causa:** Edge Function não foi atualizada ou há cache
**Solução:**
1. Limpar cache do navegador
2. Fazer novo deploy:
```bash
supabase functions delete make-server-fafb1703
supabase functions deploy make-server-fafb1703
```

### Boletos ainda não aparecem
**Verificar:**
1. O morador tem `id_unidade` definido?
   - Console do navegador: Verificar logs `[Boletos Meus]`
2. Os boletos têm `id_unidade` correto?
   - Como síndico, verificar se os boletos foram criados corretamente
3. Os IDs correspondem?
   - Verificar logs de comparação no console

### Dados aparecem como "-" no PDF
**Causa:** Backend não está enriquecendo os dados corretamente
**Solução:**
1. Verificar logs do Edge Function:
```bash
supabase functions logs make-server-fafb1703
```
2. Procurar por erros em `[Boletos Meus] Unidade encontrada para boleto`

---

## 📊 LOGS ÚTEIS

### No Navegador (Console do Morador)
```javascript
[MeusBoletos] Dados recebidos: [...] // Deve conter array de boletos
[Boletos Meus] userId: <id> // ID do usuário
[Boletos Meus] userData: {...} // Deve ter id_unidade
[Boletos Meus] Total de boletos no sistema: X
[Boletos Meus] Comparando: { boletoUnidadeId, userUnidadeId, match }
[Boletos Meus] Boletos do morador: X
[Boletos Meus] Boletos enriquecidos: [...]
```

### No Edge Function (Supabase Logs)
```bash
supabase functions logs make-server-fafb1703 --tail
```

---

## ✨ MELHORIAS FUTURAS SUGERIDAS

1. **Migração completa para Supabase Database**
   - Usar PostgreSQL em vez de KV Store
   - Melhor performance e queries mais eficientes
   - Relacionamentos nativos entre tabelas

2. **Validação de tipos no backend**
   - Adicionar schema validation (Zod)
   - Garantir consistência de tipos em todo o sistema

3. **Cache inteligente**
   - Implementar cache para reduzir chamadas ao KV Store
   - Melhorar performance de listagem de boletos

4. **Notificações**
   - Email/SMS quando novo boleto é emitido
   - Lembrete de vencimento próximo
   - Confirmação de pagamento

---

## 📞 SUPORTE

Se os problemas persistirem após seguir este guia:

1. Verifique os logs completos no Supabase Dashboard
2. Confirme que todas as variáveis de ambiente estão configuradas
3. Teste os endpoints diretamente via cURL ou Postman
4. Verifique se há algum erro de CORS ou autenticação

---

**Data de criação:** 26/11/2024  
**Versão:** 1.0  
**Status:** ✅ Correções implementadas - Aguardando deploy
