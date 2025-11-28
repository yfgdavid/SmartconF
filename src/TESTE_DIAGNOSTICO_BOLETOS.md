# 🔍 TESTE DIAGNÓSTICO - SISTEMA DE BOLETOS

## Como usar este teste

Este documento contém um código de teste que você pode adicionar temporariamente ao sistema para diagnosticar o problema dos boletos.

---

## 📋 TESTE 1: Verificar Tipos de IDs

### Passo 1: Adicionar código de diagnóstico temporário

Abra o arquivo `/components/morador/MeusBoletos.tsx` e adicione este código logo após receber os dados:

```typescript
const carregarBoletos = async () => {
  try {
    const data = await fetchWithAuth('/boletos/meus');
    console.log('[MeusBoletos] Dados recebidos:', data);
    
    // ===== CÓDIGO DE DIAGNÓSTICO - INÍCIO =====
    console.log('🔍 DIAGNÓSTICO DE TIPOS:');
    console.log('Quantidade de boletos recebidos:', data?.length || 0);
    
    if (data && data.length > 0) {
      const primeir oBoleto = data[0];
      console.log('📄 Primeiro boleto:', {
        id: primeiroBoleto.id,
        id_tipo: typeof primeiroBoleto.id,
        id_unidade: primeiroBoleto.id_unidade,
        id_unidade_tipo: typeof primeiroBoleto.id_unidade,
        id_usuario: primeiroBoleto.id_usuario,
        id_usuario_tipo: typeof primeiroBoleto.id_usuario,
        unidade_bloco: primeiroBoleto.unidade_bloco,
        unidade_numero: primeiroBoleto.unidade_numero,
        usuario_nome: primeiroBoleto.usuario_nome
      });
    } else {
      console.warn('⚠️ Nenhum boleto foi retornado!');
      console.log('Verifique:');
      console.log('1. Se o morador está vinculado a uma unidade');
      console.log('2. Se existem boletos criados para essa unidade');
      console.log('3. Se os IDs das unidades coincidem');
    }
    // ===== CÓDIGO DE DIAGNÓSTICO - FIM =====
    
    setBoletos(data || []);
  } catch (error: any) {
    // ... resto do código
```

### Passo 2: Verificar dados do usuário

Adicione este código no componente `DashboardMorador.tsx` ou crie um botão de diagnóstico:

```typescript
const testarDiagnostico = async () => {
  try {
    const response = await fetchWithAuth('/me');
    console.log('👤 DADOS DO USUÁRIO:', {
      id: response.id,
      id_tipo: typeof response.id,
      nome: response.nome,
      role: response.role,
      id_unidade: response.id_unidade,
      id_unidade_tipo: typeof response.id_unidade,
      id_condominio: response.id_condominio,
      id_condominio_tipo: typeof response.id_condominio
    });
    
    // Buscar boletos para comparação
    const boletos = await fetchWithAuth('/boletos/meus');
    console.log('📊 COMPARAÇÃO DE IDS:');
    console.log('Unidade do usuário:', response.id_unidade, typeof response.id_unidade);
    
    if (boletos && boletos.length > 0) {
      boletos.forEach((b: any, index: number) => {
        const match = String(b.id_unidade) === String(response.id_unidade);
        console.log(`Boleto ${index + 1}:`, {
          id_unidade: b.id_unidade,
          tipo: typeof b.id_unidade,
          match: match ? '✅' : '❌'
        });
      });
    }
  } catch (error) {
    console.error('Erro no diagnóstico:', error);
  }
};
```

---

## 📋 TESTE 2: Verificar Endpoint Diretamente

### Usando cURL (Terminal)

```bash
# 1. Primeiro, faça login e pegue o access_token
# Você pode pegar no console do navegador após fazer login

# 2. Testar o endpoint /boletos/meus
curl -X GET \
  https://<SEU_PROJECT_ID>.supabase.co/functions/v1/make-server-fafb1703/boletos/meus \
  -H "Authorization: Bearer <SEU_ACCESS_TOKEN>" \
  -H "Content-Type: application/json"

# 3. Testar o endpoint /me
curl -X GET \
  https://<SEU_PROJECT_ID>.supabase.co/functions/v1/make-server-fafb1703/me \
  -H "Authorization: Bearer <SEU_ACCESS_TOKEN>" \
  -H "Content-Type: application/json"
```

### Resultado Esperado

**Endpoint /me:**
```json
{
  "id": "uuid-do-usuario",
  "nome": "Nome do Morador",
  "email": "morador@email.com",
  "role": "morador",
  "id_unidade": "1234567890-abc",
  "id_condominio": "9876543210-xyz"
}
```

**Endpoint /boletos/meus:**
```json
[
  {
    "id": "boleto-id-1",
    "id_unidade": "1234567890-abc",
    "id_usuario": "uuid-do-usuario",
    "mes_referencia": "11",
    "ano_referencia": 2024,
    "valor": 500,
    "status": "pendente",
    "unidade_bloco": "A",
    "unidade_numero": "101",
    "usuario_nome": "Nome do Morador",
    "linha_digitavel": "...",
    "codigo_barras": "..."
  }
]
```

---

## 📋 TESTE 3: Checklist de Verificação

Marque cada item conforme for verificando:

### Backend (Edge Function)
- [ ] Edge Function está deployada (versão mais recente)
- [ ] Logs mostram que o endpoint está sendo chamado
- [ ] Logs mostram `[Boletos Meus]` com dados corretos
- [ ] Logs mostram comparações de ID com match = true
- [ ] Não há erros 401, 403 ou 500

### Dados do Sistema
- [ ] Morador está cadastrado
- [ ] Morador está vinculado a uma unidade (tem `id_unidade`)
- [ ] Unidade existe no sistema
- [ ] Pelo menos um boleto foi criado para essa unidade
- [ ] Boleto tem o mesmo `id_unidade` que o morador

### Frontend
- [ ] Token de autenticação está sendo enviado
- [ ] Requisição chega ao endpoint correto
- [ ] Resposta do servidor é 200 OK
- [ ] Array de boletos é recebido (mesmo que vazio)
- [ ] Dados enriquecidos estão presentes nos boletos

---

## 🔧 CENÁRIOS E SOLUÇÕES

### Cenário 1: Boletos retornam vazio []
**Causas possíveis:**
- Morador não tem `id_unidade` definido
- Não há boletos para essa unidade
- IDs não correspondem (tipo string vs number)

**Solução:**
1. Verificar se o morador está vinculado: `id_unidade` deve ter valor
2. Como síndico, criar um boleto de teste para a unidade
3. Aplicar a correção de normalização de IDs do backend

### Cenário 2: Erro 403 Forbidden
**Causas possíveis:**
- Edge Function não foi atualizada
- Token de autenticação inválido
- Permissões incorretas

**Solução:**
1. Fazer novo deploy do Edge Function
2. Fazer logout e login novamente
3. Limpar cache do navegador

### Cenário 3: Dados aparecem como "-"
**Causas possíveis:**
- Unidade não encontrada no KV Store
- Backend não está enriquecendo os dados
- Erro na busca da unidade

**Solução:**
1. Verificar logs: `[Boletos Meus] Unidade encontrada para boleto`
2. Confirmar que a unidade existe: como síndico, listar unidades
3. Recriar a unidade se necessário

### Cenário 4: Erro de autenticação
**Causas possíveis:**
- Sessão expirada
- Token inválido
- Middleware de autenticação bloqueando

**Solução:**
1. Fazer logout e login novamente
2. Verificar se o token está sendo enviado corretamente
3. Testar com cURL para isolar o problema

---

## 📊 EXEMPLO DE LOG CORRETO

Quando tudo está funcionando, você deve ver algo assim no console:

```
[MeusBoletos] Dados recebidos: Array(3)
🔍 DIAGNÓSTICO DE TIPOS:
Quantidade de boletos recebidos: 3
📄 Primeiro boleto: {
  id: "1732611234567-abc123def",
  id_tipo: "string",
  id_unidade: "1732600000000-xyz789",
  id_unidade_tipo: "string",
  id_usuario: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  id_usuario_tipo: "string",
  unidade_bloco: "A",
  unidade_numero: "101",
  usuario_nome: "João Silva"
}

[Boletos Meus] userId: a1b2c3d4-e5f6-7890-abcd-ef1234567890
[Boletos Meus] userData: {id: "...", nome: "João Silva", id_unidade: "1732600000000-xyz789"}
[Boletos Meus] Total de boletos no sistema: 10
[Boletos Meus] Comparando: {
  boletoUnidadeId: "1732600000000-xyz789",
  userUnidadeId: "1732600000000-xyz789",
  match: true
}
[Boletos Meus] Boletos do morador: 3
[Boletos Meus] Boletos enriquecidos: Array(3)
```

---

## 🎯 PRÓXIMOS PASSOS

Depois de rodar os testes:

1. **Se os tipos não correspondem:**
   - ✅ Deploy da correção já está pronto
   - Execute: `supabase functions deploy make-server-fafb1703`

2. **Se o morador não tem id_unidade:**
   - Como síndico: vá em Moradores → Vincular à Unidade
   - Ou como morador: use a tela Vincular Unidade

3. **Se não há boletos:**
   - Como síndico: vá em Boletos → Emitir Boleto
   - Selecione a unidade do morador

4. **Se tudo estiver correto mas não funciona:**
   - Limpe o cache: Ctrl+Shift+Del
   - Faça logout e login novamente
   - Verifique se o Edge Function foi deployado

---

**Data de criação:** 26/11/2024  
**Versão:** 1.0
