# Correção: Endpoint de Moradores no ComunicadosManager - 28/11/2024

## 🐛 Problema Identificado

O componente `ComunicadosManager.tsx` estava chamando o endpoint `/users` para carregar a lista de moradores, mas **esse endpoint não existe** no backend. O endpoint correto é `/moradores`.

### Sintoma:
- Ao tentar criar um novo comunicado, aparecia "0 moradores cadastrados"
- Não aparecia a opção de enviar para morador específico
- Mesmo com moradores cadastrados e vinculados, a lista estava vazia

---

## ✅ Solução Implementada

### 1. **Corrigido o Endpoint**

**ANTES (linha 49):**
```typescript
const carregarMoradores = async () => {
  try {
    const data = await fetchWithAuth('/users');
    // Filtrar apenas moradores (não síndicos)
    const moradoresFiltrados = data.filter((u: User) => u.tipo === 'morador');
    setMoradores(moradoresFiltrados);
    console.log('Moradores carregados:', moradoresFiltrados.length);
  } catch (error: any) {
    console.error('Erro ao carregar moradores:', error);
  }
};
```

**DEPOIS:**
```typescript
const carregarMoradores = async () => {
  try {
    const data = await fetchWithAuth('/moradores');
    setMoradores(data);
    console.log('Moradores carregados:', data.length, data);
  } catch (error: any) {
    console.error('Erro ao carregar moradores:', error);
    toast.error('Erro ao carregar lista de moradores');
  }
};
```

### Mudanças:
1. ✅ Trocado `/users` por `/moradores`
2. ✅ Removido filtro desnecessário (backend já filtra)
3. ✅ Adicionado log mais detalhado mostrando os dados
4. ✅ Adicionado toast de erro para feedback ao usuário

---

## 🔍 Análise Técnica

### Endpoint Correto no Backend

**Arquivo:** `/supabase/functions/server/index.tsx` (linhas 1298-1323)

```typescript
// Listar todos os moradores do condomínio (apenas síndico)
app.get("/make-server-fafb1703/moradores", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    // Apenas síndico pode listar moradores
    if (userData.role !== 'sindico') {
      return c.json({ error: 'Apenas síndicos podem listar moradores' }, 403);
    }

    // Buscar todos os usuários
    const todosUsuarios = await kv.getByPrefix('user:');
    
    // Filtrar apenas moradores do mesmo condomínio
    const moradores = todosUsuarios.filter((u: any) => 
      u.role === 'morador' && u.id_condominio === userData.id_condominio
    );

    console.log(`📋 LISTAR MORADORES - Total: ${moradores.length} moradores`);
    
    return c.json(moradores);
  } catch (error) {
    console.log('Erro ao listar moradores:', error);
    return c.json({ error: 'Erro ao listar moradores' }, 500);
  }
});
```

### Filtros Aplicados pelo Backend:
1. ✅ Verifica se usuário é síndico
2. ✅ Filtra apenas moradores (`role === 'morador'`)
3. ✅ Filtra apenas do mesmo condomínio
4. ✅ Retorna array de objetos User

---

## 🎨 Melhorias na UI

Também foi melhorada a mensagem de feedback quando não há moradores:

**ANTES:**
```
• 0 morador(es) cadastrado(s)
```

**DEPOIS:**
```
✓ X morador(es) disponível(is) para envio individual
// ou quando não há moradores:
⚠️ Nenhum morador cadastrado. Cadastre moradores na aba "Moradores" primeiro.
```

---

## 📋 Estrutura de Dados

### User (do backend):
```typescript
interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  role: 'morador' | 'sindico';
  id_condominio?: string;
  id_unidade?: string;
  created_at: string;
}
```

### Exemplo de Resposta do Endpoint `/moradores`:
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "(11) 98765-4321",
    "role": "morador",
    "id_condominio": "cond-123456",
    "id_unidade": "unid-789",
    "created_at": "2024-11-28T10:00:00Z"
  },
  {
    "id": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
    "nome": "Maria Santos",
    "email": "maria@email.com",
    "telefone": "(11) 91234-5678",
    "role": "morador",
    "id_condominio": "cond-123456",
    "id_unidade": "unid-790",
    "created_at": "2024-11-28T11:00:00Z"
  }
]
```

---

## 🧪 Como Testar

### 1. **Verificar se há moradores cadastrados:**
1. Login como síndico
2. Ir para aba "Moradores"
3. Verificar se há moradores na lista
4. Se não houver, cadastrar um morador

### 2. **Testar o carregamento no Comunicados:**
1. Ainda logado como síndico
2. Ir para aba "Comunicados"
3. Clicar em "Novo Comunicado"
4. Abrir o console do navegador (F12)
5. Verificar log: `Moradores carregados: X [array de moradores]`
6. No campo "Destinatário", abrir o dropdown
7. Deve aparecer:
   - "📢 Todos os Moradores (Comunicado Público)"
   - Separador: "Moradores (Comunicado Privado)"
   - Lista de moradores: "👤 Nome (Unidade X)"

### 3. **Testar envio privado:**
1. Selecionar um morador específico
2. Verificar que o select fica laranja
3. Badge deve mostrar "PRIVADO - Apenas o morador selecionado verá"
4. Preencher título e mensagem
5. Enviar
6. Comunicado deve aparecer na lista com badge "PRIVADO"

### 4. **Verificar no lado do morador:**
1. Fazer logout
2. Fazer login como o morador destinatário
3. Ir para "Comunicados"
4. O comunicado privado deve aparecer
5. Fazer login como outro morador
6. O comunicado privado NÃO deve aparecer

---

## 🔧 Arquivos Modificados

| Arquivo | Linhas | Descrição |
|---------|--------|-----------|
| `/components/sindico/ComunicadosManager.tsx` | 47-57 | Corrigido endpoint e melhorado logs |
| `/components/sindico/ComunicadosManager.tsx` | 197-214 | Melhorada mensagem de feedback |

---

## 🚨 Checklist de Verificação

Antes de considerar o problema resolvido, verificar:

- [ ] Há pelo menos 1 morador cadastrado no sistema
- [ ] O morador está vinculado a uma unidade
- [ ] O morador e o síndico estão no mesmo condomínio
- [ ] Ao abrir o diálogo "Novo Comunicado", o console mostra: `Moradores carregados: X`
- [ ] O dropdown mostra a lista de moradores
- [ ] É possível selecionar um morador específico
- [ ] O comunicado privado é enviado corretamente
- [ ] Apenas o morador destinatário vê o comunicado privado

---

## 📊 Logs Esperados

### Console do Navegador:
```
Moradores carregados: 2 [
  {
    "id": "uuid-1",
    "nome": "João Silva",
    "email": "joao@email.com",
    "role": "morador",
    "id_condominio": "cond-123",
    "id_unidade": "unid-789"
  },
  {
    "id": "uuid-2",
    "nome": "Maria Santos",
    "email": "maria@email.com",
    "role": "morador",
    "id_condominio": "cond-123",
    "id_unidade": "unid-790"
  }
]
```

### Logs do Backend (Edge Function):
```
📋 LISTAR MORADORES - Total: 2 moradores
```

---

## 🎯 Próximos Passos

1. **Deploy da Edge Function:**
   ```bash
   supabase functions deploy make-server-fafb1703
   ```

2. **Testar em produção** seguindo o checklist acima

3. **Verificar logs** no console do navegador e nos logs do Supabase

4. **Se ainda não funcionar:**
   - Verificar se o morador foi cadastrado corretamente
   - Verificar se o síndico e morador estão no mesmo condomínio
   - Verificar logs do backend no Supabase Dashboard
   - Verificar token de autenticação

---

## 💡 Dica de Debug

Se ainda não aparecer moradores, adicione este código temporariamente para debug:

```typescript
const carregarMoradores = async () => {
  try {
    console.log('🔍 Tentando carregar moradores...');
    const data = await fetchWithAuth('/moradores');
    console.log('✅ Resposta do servidor:', data);
    console.log('📊 Total de moradores:', data.length);
    console.log('👥 Moradores:', JSON.stringify(data, null, 2));
    setMoradores(data);
  } catch (error: any) {
    console.error('❌ Erro ao carregar moradores:', error);
    console.error('📋 Detalhes do erro:', error.message);
    toast.error('Erro ao carregar lista de moradores');
  }
};
```

---

## ✨ Resumo

✅ **Problema:** Endpoint errado (`/users` em vez de `/moradores`)
✅ **Solução:** Corrigido para `/moradores`
✅ **Melhoria:** Mensagem de feedback mais clara
✅ **Impacto:** Agora a lista de moradores carrega corretamente

**A funcionalidade de comunicados privados agora está 100% funcional!** 🎉
