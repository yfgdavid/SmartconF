# Correções - Boletos e Comunicados
**Data:** 28 de Novembro de 2024

## Problemas Identificados

### 1. Comunicados - Destinatário não aparecia
**Problema:** Na tela de comunicados do síndico, todos os comunicados mostravam apenas "Todos os Moradores" no destinatário, mesmo quando eram enviados para moradores específicos.

**Causa:** O backend não estava enriquecendo os comunicados com informações sobre os destinatários quando retornava para o síndico.

**Solução:** 
- Modificado o endpoint `GET /comunicados` no backend (linha 721-790)
- Adicionada lógica para buscar os destinatários de cada comunicado
- Enriquecimento dos comunicados com `destinatario_tipo` e `destinatario_nome`
- Atualizado o componente `ComunicadosManager.tsx` para exibir o destinatário na interface

### 2. Boletos - Filtros não funcionavam
**Problema:** Os boletos apareciam apenas na aba "Todos", não sendo exibidos nas abas "Pendentes", "Pagos" e "Vencidos".

**Causa:** 
1. Boletos estavam sendo criados sem um status inicial definido
2. A lógica de verificação de vencimento não estava sendo aplicada em todas as rotas

**Solução:**
1. **Criação de Boletos (linha 1104-1111):**
   - Adicionado `status: 'pendente'` como valor padrão na criação de novos boletos
   
2. **Listagem para Síndico (linha 1138-1170):**
   - Adicionada verificação de vencimento baseada na data
   - Atualização automática do status para 'vencido' quando data de vencimento já passou e boleto não está pago
   
3. **Listagem para Morador na rota principal (linha 1188-1207):**
   - Adicionada mesma lógica de verificação de vencimento
   
4. **Listagem na rota /boletos/meus (linha 1187-1205):**
   - Já possuía a lógica, mantida consistente

## Arquivos Modificados

### Backend
- `/supabase/functions/server/index.tsx`
  - Linhas 721-790: Enriquecimento de comunicados com destinatários
  - Linha 1108: Adição de status inicial 'pendente' nos boletos
  - Linhas 1156-1169: Verificação de vencimento para síndico
  - Linhas 1193-1207: Verificação de vencimento para morador

### Frontend
- `/components/sindico/ComunicadosManager.tsx`
  - Linhas 236-239: Exibição do destinatário do comunicado

## Lógica de Status dos Boletos

### Status Possíveis:
1. **pendente**: Boleto criado e aguardando pagamento (dentro do prazo)
2. **pago**: Boleto pago pelo morador
3. **vencido**: Boleto não pago e com data de vencimento já passou

### Verificação Automática:
```typescript
const hoje = new Date();
const vencimento = new Date(boleto.data_vencimento);
const isVencido = boleto.status !== 'pago' && vencimento < hoje;
status: isVencido ? 'vencido' : boleto.status
```

Esta lógica é aplicada em tempo real sempre que os boletos são listados, garantindo que o status esteja sempre atualizado.

## Lógica de Destinatários dos Comunicados

### Tipos de Destinatário:
1. **todos**: Comunicado enviado para todos os moradores
2. **individual**: Comunicado enviado para um morador específico

### Identificação:
```typescript
// Se foi enviado para todos ou tem múltiplos destinatários
if (com.enviar_para_todos || destinatariosComunicado.length > 1) {
  destinatario_tipo: 'todos',
  destinatario_nome: 'Todos os Moradores'
}

// Se foi enviado para um morador específico
if (destinatariosComunicado.length === 1) {
  destinatario_tipo: 'individual',
  destinatario_nome: moradorUser?.nome
}
```

## Próximos Passos

1. ✅ Deploy do Edge Function via `supabase functions deploy make-server-fafb1703`
2. ✅ Testar a funcionalidade de comunicados com destinatário específico
3. ✅ Testar os filtros de boletos (Pendentes, Pagos, Vencidos)
4. ✅ Verificar se boletos vencidos aparecem corretamente na categoria "Vencidos"

## Observações

- As correções são retroativas: boletos antigos sem status receberão 'pendente' como padrão
- A verificação de vencimento é feita em tempo real no backend, não requer atualização manual
- Os comunicados já enviados também serão enriquecidos com a informação de destinatário
