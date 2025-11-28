# 🧪 Guia de Testes - Smartcon

## Como testar o sistema com múltiplas sessões em tempo real

### 1️⃣ Preparação Inicial

Para testar o sincronização em tempo real entre síndico e morador, você precisará abrir **duas janelas/abas** diferentes do navegador:

- **Janela 1**: Sessão do Síndico
- **Janela 2**: Sessão do Morador

**Dica**: Use uma janela normal e uma janela anônima/privada, ou dois navegadores diferentes (Chrome e Firefox, por exemplo).

---

### 2️⃣ Passo a Passo para Criar Contas de Teste

#### **Criar conta do Síndico**

1. Na **Janela 1**, abra o Smartcon
2. Vá para a aba **Cadastro**
3. Preencha:
   - Nome: `João Silva`
   - Email: `joao@sindico.com`
   - Telefone: `(11) 98765-4321`
   - Senha: `123456`
   - ID do Condomínio: *deixe em branco*
   - Tipo de Usuário: **Síndico**
4. Clique em **Realizar Cadastro**
5. Faça login e vá para a aba **"Cond."** (Condomínio)
6. Você verá uma **caixa azul destacada** com o título "🆔 ID do Condomínio"
7. Clique no botão **"Copiar"** para copiar o ID automaticamente

#### **Criar conta do Morador**

1. Na **Janela 2**, abra o Smartcon
2. Vá para a aba **Cadastro**
3. Preencha:
   - Nome: `Maria Santos`
   - Email: `maria@morador.com`
   - Telefone: `(11) 91234-5678`
   - Senha: `123456`
   - ID do Condomínio: **cole o ID do condomínio do síndico aqui**
   - Tipo de Usuário: **Morador**
4. Clique em **Realizar Cadastro**

#### **Fazer Login nas Duas Contas**

1. **Janela 1**: Faça login com `joao@sindico.com` / `123456`
2. **Janela 2**: Faça login com `maria@morador.com` / `123456`

---

### 3️⃣ Testes de Sincronização em Tempo Real

Agora você pode testar a sincronização! Todas as alterações aparecerão automaticamente em **até 10 segundos** na outra janela.

#### **Teste 1: Comunicados**

**Síndico cria → Morador visualiza**

1. **Janela 1 (Síndico)**: 
   - Vá para aba "Comun."
   - Clique em "Novo Comunicado"
   - Título: `Manutenção da Piscina`
   - Mensagem: `Amanhã haverá manutenção na piscina das 8h às 12h`
   - Clique em "Enviar Comunicado"

2. **Janela 2 (Morador)**:
   - Vá para aba "Comun."
   - Aguarde até 10 segundos
   - ✅ O comunicado deve aparecer automaticamente!

#### **Teste 2: Ocorrências**

**Morador registra → Síndico visualiza**

1. **Janela 2 (Morador)**:
   - Vá para aba "Ocorr."
   - Clique em "Registrar"
   - Título: `Vazamento no corredor`
   - Descrição: `Há um vazamento no corredor do 3º andar`
   - Clique em "Registrar"

2. **Janela 1 (Síndico)**:
   - Vá para aba "Ocorr."
   - Aguarde até 10 segundos
   - ✅ A ocorrência deve aparecer automaticamente!

**Síndico atualiza status → Morador visualiza mudança**

3. **Janela 1 (Síndico)**:
   - Clique em "Iniciar Atendimento" na ocorrência
   - Aguarde confirmação

4. **Janela 2 (Morador)**:
   - Aguarde até 10 segundos
   - ✅ O status deve mudar para "Em Andamento"!

5. **Janela 1 (Síndico)**:
   - Clique em "Marcar como Resolvida"

6. **Janela 2 (Morador)**:
   - Aguarde até 10 segundos
   - ✅ O status deve mudar para "Resolvida"!

#### **Teste 3: Reservas de Espaços**

**Síndico cria espaço → Morador pode reservar**

1. **Janela 1 (Síndico)**:
   - Vá para aba "Espaços"
   - Clique em "Novo Espaço"
   - Nome: `Churrasqueira 1`
   - Capacidade: `15`
   - Clique em "Criar Espaço"

2. **Janela 2 (Morador)**:
   - Vá para aba "Reservas"
   - Clique em "Nova Reserva"
   - Aguarde até 10 segundos para o espaço aparecer
   - Selecione "Churrasqueira 1"
   - Escolha uma data e horário
   - Clique em "Confirmar Reserva"

3. **Janela 1 (Síndico)**:
   - Aguarde até 10 segundos
   - ✅ A reserva do morador deve aparecer!

#### **Teste 4: Boletos**

**Síndico emite → Morador visualiza**

1. **Janela 1 (Síndico)**:
   - Primeiro, crie uma unidade na aba "Cond.":
     - Bloco: `A`
     - Número: `101`
     - Área: `50`
   - Depois vá para aba "Boletos"
   - Clique em "Emitir Boleto"
   - Selecione a unidade criada
   - Valor: `500.00`
   - Data de Vencimento: escolha uma data futura
   - Clique em "Emitir para Unidade"

2. **Janela 2 (Morador)**:
   - Vá para aba "Boletos"
   - Aguarde até 10 segundos
   - ✅ O boleto deve aparecer!

---

### 4️⃣ Tempo de Sincronização

⏱️ **Importante**: O sistema atualiza automaticamente a cada **10 segundos**. Então:

- Se você criar algo e não aparecer imediatamente na outra janela, aguarde até 10 segundos
- Você pode forçar uma atualização recarregando a aba específica (Ocorr., Comun., etc)

---

### 5️⃣ Dicas para Testes

✅ **O que funciona em tempo real:**
- ✓ Comunicados (Síndico → Morador)
- ✓ Ocorrências (Morador → Síndico, Síndico → Morador)
- ✓ Reservas (Morador → Síndico)
- ✓ Espaços (Síndico → Morador)
- ✓ Boletos (Síndico → Morador)

📱 **Teste Responsivo:**
- Abra uma janela em modo mobile (apertar F12 e ativar modo responsivo)
- Abra outra em desktop
- Teste a sincronização entre diferentes tamanhos de tela!

🔄 **Se algo não sincronizar:**
1. Verifique se você está logado nas duas contas
2. Aguarde pelo menos 10 segundos
3. Verifique o console do navegador (F12) para erros
4. Certifique-se de que ambos os usuários estão no mesmo condomínio

---

### 6️⃣ Cenários de Teste Avançados

#### **Múltiplos Moradores**

Você pode criar várias contas de moradores no mesmo condomínio e testar:
- Morador 1 cria ocorrência → Morador 2 não vê (somente suas próprias)
- Síndico vê ocorrências de todos os moradores
- Comunicados aparecem para todos os moradores

#### **Teste de Carga**

- Crie várias ocorrências rapidamente
- Crie vários comunicados
- Verifique se tudo sincroniza corretamente

---

### 🎯 Checklist de Testes Completo

- [ ] Cadastro de Síndico
- [ ] Cadastro de Morador no condomínio do síndico
- [ ] Login de ambos
- [ ] Síndico cria comunicado → Morador recebe
- [ ] Morador cria ocorrência → Síndico recebe
- [ ] Síndico atualiza status da ocorrência → Morador vê mudança
- [ ] Síndico cria espaço → Morador pode reservar
- [ ] Morador cria reserva → Síndico visualiza
- [ ] Síndico emite boleto → Morador visualiza
- [ ] Testar sincronização automática (aguardar 10s)
- [ ] Testar em diferentes tamanhos de tela

---

## 🚀 Está tudo funcionando?

Se todos os testes passarem, o sistema está sincronizando perfeitamente em tempo real! 

**Observações:**
- O polling está configurado para 10 segundos para balancear performance e tempo real
- Em produção, você pode implementar WebSockets para sincronização instantânea via Supabase Realtime
- Para testes mais rápidos, você pode reduzir o intervalo de 10000ms para 3000ms nos componentes
