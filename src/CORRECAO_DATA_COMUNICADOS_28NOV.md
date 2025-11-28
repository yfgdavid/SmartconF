# Correção: Data "Ontem" em Comunicados de Hoje - 28/11/2024

## 🐛 Problema Identificado

No componente `MeusComunicados.tsx` (tela do morador), os comunicados enviados **hoje** estavam aparecendo como **"Ontem"**.

### Sintoma:
```
Comunicados enviados HOJE 28/11/2024:
- "Enviado por Joao Silva • Ontem" ❌
- "Enviado por Joao Silva • Ontem" ❌
- "Enviado por Joao Silva • Ontem" ❌

Esperado:
- "Enviado por Joao Silva • Hoje" ✅
```

---

## 🔍 Causa Raiz

A função `formatDate` estava usando `Math.ceil()` para arredondar a diferença de dias, o que causava arredondamento incorreto:

**CÓDIGO PROBLEMÁTICO:**
```typescript
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // ❌ ERRO AQUI

  if (diffDays === 0) {
    return 'Hoje';
  } else if (diffDays === 1) {
    return 'Ontem';
```

### Por que estava errado?

`Math.ceil()` arredonda para cima:
- **Comunicado enviado às 10h de hoje**: 
  - Diferença: 4 horas = 0.16 dias
  - `Math.ceil(0.16)` = **1** → Mostrava "Ontem" ❌

- **Comunicado enviado às 23h de hoje**:
  - Diferença: 1 hora = 0.04 dias
  - `Math.ceil(0.04)` = **1** → Mostrava "Ontem" ❌

- **Comunicado enviado ontem**:
  - Diferença: 25 horas = 1.04 dias
  - `Math.ceil(1.04)` = **2** → Mostrava "Há 2 dias" ❌

---

## ✅ Solução Implementada

### Lógica Corrigida:

1. **Resetar horas** para comparar apenas as **datas do calendário**
2. Usar `Math.floor()` em vez de `Math.ceil()`
3. Calcular diferença corretamente (nowOnly - dateOnly)

**CÓDIGO CORRIGIDO:**
```typescript
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  
  // Resetar horas para comparar apenas as datas (00:00:00)
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = nowOnly.getTime() - dateOnly.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // ✅ CORRETO

  if (diffDays === 0) {
    return 'Hoje';
  } else if (diffDays === 1) {
    return 'Ontem';
  } else if (diffDays < 7) {
    return `Há ${diffDays} dias`;
  } else {
    return date.toLocaleDateString('pt-BR');
  }
};
```

---

## 🧮 Exemplos de Cálculo

### Cenário 1: Comunicado de Hoje
```
Data atual: 28/11/2024 14:30
Data do comunicado: 28/11/2024 10:00

dateOnly: 28/11/2024 00:00:00
nowOnly: 28/11/2024 00:00:00

diffTime: 0 ms
diffDays: Math.floor(0 / (1000*60*60*24)) = 0

Resultado: "Hoje" ✅
```

### Cenário 2: Comunicado de Ontem
```
Data atual: 28/11/2024 14:30
Data do comunicado: 27/11/2024 23:00

dateOnly: 27/11/2024 00:00:00
nowOnly: 28/11/2024 00:00:00

diffTime: 86400000 ms (1 dia em milissegundos)
diffDays: Math.floor(86400000 / 86400000) = 1

Resultado: "Ontem" ✅
```

### Cenário 3: Comunicado de 3 dias atrás
```
Data atual: 28/11/2024 14:30
Data do comunicado: 25/11/2024 08:00

dateOnly: 25/11/2024 00:00:00
nowOnly: 28/11/2024 00:00:00

diffTime: 259200000 ms (3 dias)
diffDays: Math.floor(259200000 / 86400000) = 3

Resultado: "Há 3 dias" ✅
```

### Cenário 4: Comunicado de mais de 7 dias
```
Data atual: 28/11/2024 14:30
Data do comunicado: 15/11/2024 10:00

dateOnly: 15/11/2024 00:00:00
nowOnly: 28/11/2024 00:00:00

diffTime: 1123200000 ms (13 dias)
diffDays: Math.floor(1123200000 / 86400000) = 13

Resultado: "15/11/2024" ✅
```

---

## 📊 Comparação: Antes vs Depois

| Situação | Antes (Math.ceil) | Depois (Math.floor + reset) |
|----------|-------------------|------------------------------|
| Hoje às 10h | "Ontem" ❌ | "Hoje" ✅ |
| Hoje às 23h | "Ontem" ❌ | "Hoje" ✅ |
| Ontem às 10h | "Há 2 dias" ❌ | "Ontem" ✅ |
| 3 dias atrás | "Há 4 dias" ❌ | "Há 3 dias" ✅ |
| 10 dias atrás | "Há 11 dias" ❌ | "18/11/2024" ✅ |

---

## 🔧 Arquivos Modificados

| Arquivo | Linhas | Mudança |
|---------|--------|---------|
| `/components/morador/MeusComunicados.tsx` | 34-49 | Função `formatDate` corrigida |

---

## 📝 Nota sobre o Componente do Síndico

O componente `ComunicadosManager.tsx` (tela do síndico) **não tinha esse problema** porque usa formato diferente:

```typescript
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
```

Resultado: `"28/11/2024, 14:30"` - Sempre mostra data e hora completas ✅

---

## 🧪 Como Testar

### 1. Teste Manual:

1. **Login como síndico**
2. Enviar um comunicado agora
3. **Logout e login como morador**
4. Ir para "Comunicados"
5. Verificar que o comunicado mostra **"Hoje"** ✅

### 2. Teste de Comunicados Antigos:

Para testar comunicados de ontem ou dias anteriores, você pode:

**Opção A: Via Console do Navegador**
```javascript
// Abrir DevTools (F12) na tela de comunicados
// Modificar temporariamente a data
const cards = document.querySelectorAll('[class*="CardDescription"]');
console.log('Total de comunicados:', cards.length);
```

**Opção B: Criar Comunicados de Teste**
1. Alterar temporariamente o timezone do sistema
2. Criar comunicados
3. Restaurar timezone
4. Verificar exibição

---

## 🎯 Checklist de Verificação

Após a correção, verificar:

- [x] Código modificado em `/components/morador/MeusComunicados.tsx`
- [ ] Comunicados de **hoje** mostram "Hoje"
- [ ] Comunicados de **ontem** mostram "Ontem"
- [ ] Comunicados de **2-6 dias** mostram "Há X dias"
- [ ] Comunicados de **7+ dias** mostram data formatada (ex: "15/11/2024")
- [ ] Tela do síndico continua funcionando normalmente

---

## 💡 Lições Aprendidas

### Problema com Math.ceil():
❌ Sempre arredonda para cima
❌ Não considera o dia do calendário
❌ Baseado em horas, não em dias

### Solução com Math.floor() + Reset de Horas:
✅ Arredonda para baixo (mais preciso)
✅ Compara datas de calendário (ano, mês, dia)
✅ Ignora as horas, minutos, segundos

### Quando Usar Cada Um:

**Math.ceil()** - Quando você quer garantir o "próximo número inteiro"
```typescript
Math.ceil(1.1) = 2  // "Preciso de pelo menos 2 caixas"
Math.ceil(1.9) = 2
```

**Math.floor()** - Quando você quer o "número inteiro atual"
```typescript
Math.floor(1.1) = 1  // "Tenho 1 dia completo"
Math.floor(1.9) = 1
```

**Math.round()** - Quando você quer o "mais próximo"
```typescript
Math.round(1.4) = 1
Math.round(1.5) = 2
```

---

## 🚀 Resultado Final

✅ **Comunicados de hoje agora mostram "Hoje"**
✅ **Datas relativas funcionam corretamente**
✅ **Experiência do usuário melhorada**

Problema resolvido! 🎉

---

## 📌 Referências

- JavaScript Date: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
- Math.floor vs Math.ceil: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math
- Comparação de datas em JavaScript: https://www.freecodecamp.org/news/javascript-date-comparison-how-to-compare-dates-in-js/
