# ⚡ Teste Rápido - Sincronização em Tempo Real

## 🎯 Objetivo
Testar se as mudanças feitas pelo síndico aparecem para o morador e vice-versa.

## ⚠️ Nota Importante
A funcionalidade de **vincular morador à unidade específica** ainda está em desenvolvimento. Por enquanto, você pode testar todas as outras funcionalidades normalmente (comunicados, ocorrências, reservas). A emissão de boletos para unidades específicas será implementada após a vinculação estar funcionando.

---

## 📋 Passo a Passo (5 minutos)

### 1️⃣ Abrir Duas Janelas

**Opção A:** Use uma janela normal e uma anônima
- Chrome: `Ctrl+Shift+N` (Windows) ou `Cmd+Shift+N` (Mac)
- Firefox: `Ctrl+Shift+P` (Windows) ou `Cmd+Shift+P` (Mac)

**Opção B:** Use dois navegadores diferentes (Chrome + Firefox)

---

### 2️⃣ Criar Conta do Síndico

**Janela 1:**

1. Abra o Smartcon
2. Clique em **Cadastro**
3. Preencha:
   ```
   Nome: João Silva
   Email: joao@teste.com
   Telefone: 11999999999
   Senha: 123456
   ID do Condomínio: [deixe vazio]
   Tipo: Síndico
   ```
4. Clique em **Realizar Cadastro**
5. Faça **Login** com `joao@teste.com` / `123456`
6. Vá na aba **"Cond."** (Condomínio)
7. **Você verá uma caixa AZUL destacada no topo** com o título "🆔 ID do Condomínio"
8. Clique no botão **"Copiar"** para copiar o ID automaticamente

---

### 3️⃣ Criar Conta do Morador

**Janela 2:**

1. Abra o Smartcon
2. Clique em **Cadastro**
3. Preencha:
   ```
   Nome: Maria Santos
   Email: maria@teste.com
   Telefone: 11988888888
   Senha: 123456
   ID do Condomínio: [COLE O ID DO SÍNDICO AQUI]
   Tipo: Morador
   ```
4. Clique em **Realizar Cadastro**
5. Faça **Login** com `maria@teste.com` / `123456`

---

### 4️⃣ Testar Comunicados (Síndico → Morador)

**Janela 1 (Síndico):**
1. Vá para aba **"Comun."**
2. Clique em **"Novo Comunicado"**
3. Digite:
   ```
   Título: Teste de Comunicado
   Mensagem: Este é um teste de sincronização em tempo real!
   ```
4. Clique em **"Enviar Comunicado"**

**Janela 2 (Morador):**
1. Vá para aba **"Comun."**
2. **Aguarde até 10 segundos**
3. ✅ **O comunicado deve aparecer!**

---

### 5️⃣ Testar Ocorrências (Morador → Síndico)

**Janela 2 (Morador):**
1. Vá para aba **"Ocorr."**
2. Clique em **"Registrar"**
3. Digite:
   ```
   Título: Teste de Ocorrência
   Descrição: Testando sincronização de ocorrências
   ```
4. Clique em **"Registrar"**

**Janela 1 (Síndico):**
1. Vá para aba **"Ocorr."**
2. **Aguarde até 10 segundos**
3. ✅ **A ocorrência deve aparecer!**
4. Clique em **"Iniciar Atendimento"**

**Janela 2 (Morador):**
1. **Aguarde até 10 segundos**
2. ✅ **O status deve mudar para "Em Andamento"!**

---

## ✅ Resultado Esperado

Se você conseguiu ver:
- ✓ Comunicado aparecendo para o morador
- ✓ Ocorrência aparecendo para o síndico
- ✓ Mudança de status sincronizando

**🎉 Parabéns! O sistema está funcionando perfeitamente em tempo real!**

---

## ⏱️ Tempo de Sincronização

- **Atualização automática**: a cada **10 segundos**
- Se algo não apareceu imediatamente, **aguarde até 10 segundos**
- Você pode recarregar a aba para forçar atualização

---

## 🔍 Verificar se Está Funcionando

Procure por um texto pequeno abaixo do título da página que diz:

```
🔄 Última atualização: Agora
```

ou

```
🔄 Última atualização: 5s atrás
```

Isso indica que o sistema está sincronizando!

---

## 🆘 Problemas?

### Comunicado não aparece para o morador
- ✓ Certifique-se que usou o **mesmo ID de condomínio** nas duas contas
- ✓ Aguarde pelo menos 10 segundos
- ✓ Verifique se está na aba correta ("Comun.")

### Ocorrência não aparece para o síndico
- ✓ Verifique se fez login com as contas certas
- ✓ Aguarde até 10 segundos
- ✓ Tente recarregar a aba "Ocorr."

### Como saber meu ID do Condomínio?
- Faça login como **síndico**
- Vá para aba **"Cond."** (Condomínio)
- Procure pela **caixa azul destacada** com o título "🆔 ID do Condomínio"
- O ID aparece em destaque com uma fonte mono-espaçada
- Clique em **"Copiar"** para copiar automaticamente

---

## 🚀 Próximos Testes

Depois que funcionar, teste também:

1. **Reservas**:
   - Síndico cria espaço na aba "Espaços"
   - Morador reserva na aba "Reservas"

2. **Boletos** (🚧 Em desenvolvimento):
   - A funcionalidade de boletos está vinculada à unidade do morador
   - Aguarde a implementação da vinculação de unidades para testar completamente

---

**💡 Dica**: Deixe as duas janelas lado a lado na tela para ver a sincronização acontecendo!
