# ⚡ SCRIPT DE VERIFICAÇÃO RÁPIDA - BOLETOS

## 🎯 Use este script para diagnosticar rapidamente o problema

Copie e cole este código no **Console do Navegador** (F12) quando estiver logado como morador:

---

## 📋 SCRIPT COMPLETO

```javascript
// ========================================
// 🔍 DIAGNÓSTICO RÁPIDO - SISTEMA DE BOLETOS
// ========================================

console.clear();
console.log('╔════════════════════════════════════════════════╗');
console.log('║  🔍 DIAGNÓSTICO DO SISTEMA DE BOLETOS         ║');
console.log('╚════════════════════════════════════════════════╝\n');

async function diagnosticarBoletos() {
  const projectId = window.location.hostname.split('.')[0];
  const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-fafb1703`;
  
  // Pegar token de autenticação
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  if (!token) {
    console.error('❌ ERRO: Não foi possível obter o token de autenticação');
    console.log('💡 Faça login novamente');
    return;
  }
  
  console.log('✅ Token obtido com sucesso\n');
  
  // ========== TESTE 1: Dados do Usuário ==========
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 TESTE 1: DADOS DO USUÁRIO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const responseMe = await fetch(`${SERVER_URL}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!responseMe.ok) {
      console.error('❌ Erro ao buscar dados do usuário:', responseMe.status);
      return;
    }
    
    const userData = await responseMe.json();
    
    console.log('👤 Dados do Usuário:');
    console.table({
      'ID': userData.id,
      'Nome': userData.nome,
      'Email': userData.email,
      'Role': userData.role,
      'ID Unidade': userData.id_unidade || '⚠️ NÃO VINCULADO',
      'Tipo ID Unidade': typeof userData.id_unidade,
      'ID Condomínio': userData.id_condominio,
      'Tipo ID Condomínio': typeof userData.id_condominio
    });
    
    if (!userData.id_unidade) {
      console.warn('\n⚠️ PROBLEMA ENCONTRADO:');
      console.warn('   O morador NÃO está vinculado a uma unidade!');
      console.warn('\n💡 SOLUÇÃO:');
      console.warn('   1. Como síndico: vá em Moradores → Vincular Morador');
      console.warn('   2. Como morador: vá em Vincular Unidade');
      console.warn('   3. Informe o ID da unidade correta\n');
      return;
    }
    
    console.log('\n✅ Usuário está vinculado à unidade:', userData.id_unidade);
    
    // ========== TESTE 2: Boletos do Morador ==========
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 TESTE 2: BOLETOS DO MORADOR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const responseBoletos = await fetch(`${SERVER_URL}/boletos/meus`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!responseBoletos.ok) {
      console.error('❌ Erro ao buscar boletos:', responseBoletos.status);
      const errorData = await responseBoletos.json().catch(() => ({}));
      console.error('   Detalhes:', errorData);
      
      if (responseBoletos.status === 403) {
        console.warn('\n💡 Erro 403 - Edge Function não atualizada');
        console.warn('   Execute: supabase functions deploy make-server-fafb1703');
      }
      return;
    }
    
    const boletos = await responseBoletos.json();
    
    console.log(`📊 Total de boletos encontrados: ${boletos.length}\n`);
    
    if (boletos.length === 0) {
      console.warn('⚠️ NENHUM BOLETO ENCONTRADO!\n');
      console.warn('Possíveis causas:');
      console.warn('   1. Nenhum boleto foi emitido para sua unidade');
      console.warn('   2. IDs das unidades não correspondem (bug não corrigido)');
      console.warn('   3. Filtro no backend está incorreto\n');
      console.warn('💡 SOLUÇÃO:');
      console.warn('   1. Peça ao síndico para emitir um boleto de teste');
      console.warn('   2. Verifique se o deploy da correção foi feito');
      console.warn('   3. Limpe o cache e tente novamente\n');
      return;
    }
    
    // ========== TESTE 3: Análise dos Boletos ==========
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 TESTE 3: ANÁLISE DOS BOLETOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    let problemasEncontrados = 0;
    
    boletos.forEach((boleto, index) => {
      console.log(`\n📄 BOLETO ${index + 1}:`);
      console.table({
        'ID': boleto.id,
        'Referência': `${boleto.mes_referencia}/${boleto.ano_referencia}`,
        'Valor': `R$ ${boleto.valor.toFixed(2)}`,
        'Status': boleto.status,
        'Vencimento': new Date(boleto.data_vencimento).toLocaleDateString('pt-BR'),
        'ID Unidade': boleto.id_unidade,
        'Tipo ID Unidade': typeof boleto.id_unidade,
        'Bloco': boleto.unidade_bloco || '❌ AUSENTE',
        'Número': boleto.unidade_numero || '❌ AUSENTE',
        'Nome Morador': boleto.usuario_nome || '❌ AUSENTE'
      });
      
      // Verificar dados enriquecidos
      const dadosCompletos = 
        boleto.unidade_bloco && 
        boleto.unidade_numero && 
        boleto.usuario_nome &&
        boleto.unidade_bloco !== '-' &&
        boleto.unidade_numero !== '-' &&
        boleto.usuario_nome !== '-';
      
      if (!dadosCompletos) {
        problemasEncontrados++;
        console.warn(`   ⚠️ Dados incompletos neste boleto!`);
      } else {
        console.log(`   ✅ Dados completos`);
      }
      
      // Verificar compatibilidade de IDs
      const userIdNormalizado = String(userData.id_unidade);
      const boletoIdNormalizado = String(boleto.id_unidade);
      const idsCorrespondem = userIdNormalizado === boletoIdNormalizado;
      
      console.log(`\n   🔍 Comparação de IDs:`);
      console.log(`      Usuário:  ${userIdNormalizado} (${typeof userData.id_unidade})`);
      console.log(`      Boleto:   ${boletoIdNormalizado} (${typeof boleto.id_unidade})`);
      console.log(`      Match:    ${idsCorrespondem ? '✅ SIM' : '❌ NÃO'}`);
      
      if (!idsCorrespondem) {
        problemasEncontrados++;
        console.warn(`      ⚠️ IDs NÃO CORRESPONDEM - Este boleto não deveria aparecer!`);
      }
    });
    
    // ========== RESUMO FINAL ==========
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 RESUMO DO DIAGNÓSTICO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (problemasEncontrados === 0) {
      console.log('🎉 SISTEMA FUNCIONANDO PERFEITAMENTE!');
      console.log('\n✅ Todos os testes passaram:');
      console.log('   • Usuário vinculado à unidade');
      console.log('   • Boletos encontrados');
      console.log('   • Dados enriquecidos completos');
      console.log('   • IDs correspondem corretamente');
      console.log('\n💚 O sistema está 100% operacional!\n');
    } else {
      console.warn(`⚠️ ${problemasEncontrados} PROBLEMA(S) ENCONTRADO(S)!\n`);
      console.warn('Ações necessárias:');
      
      if (boletos.some(b => !b.unidade_bloco || b.unidade_bloco === '-')) {
        console.warn('   1. ⚠️ Dados incompletos nos boletos');
        console.warn('      → Verifique se a correção foi deployada');
        console.warn('      → Execute: supabase functions deploy make-server-fafb1703\n');
      }
      
      if (boletos.some(b => String(b.id_unidade) !== String(userData.id_unidade))) {
        console.warn('   2. ⚠️ IDs não correspondem');
        console.warn('      → Corrija os IDs no banco de dados');
        console.warn('      → Revinc ule o morador à unidade\n');
      }
    }
    
    // ========== PRÓXIMOS PASSOS ==========
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 PRÓXIMOS PASSOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (problemasEncontrados > 0) {
      console.log('1️⃣ Deploy da correção:');
      console.log('   supabase functions deploy make-server-fafb1703\n');
      console.log('2️⃣ Limpar cache:');
      console.log('   Ctrl+Shift+Del → Limpar cache\n');
      console.log('3️⃣ Testar novamente:');
      console.log('   Execute este script novamente\n');
      console.log('4️⃣ Verificar logs do Edge Function:');
      console.log('   supabase functions logs make-server-fafb1703\n');
    } else {
      console.log('✅ Sistema funcionando! Você pode:');
      console.log('   • Visualizar seus boletos');
      console.log('   • Gerar PDFs completos');
      console.log('   • Copiar linhas digitáveis');
      console.log('   • Acompanhar status de pagamento\n');
    }
    
    console.log('\n📚 Documentação completa:');
    console.log('   • /RESUMO_CORRECAO_BOLETOS.md');
    console.log('   • /CORRECAO_BOLETOS_DEPLOY.md');
    console.log('   • /VISUALIZACAO_PROBLEMA_BOLETOS.md');
    console.log('   • /TESTE_DIAGNOSTICO_BOLETOS.md\n');
    
  } catch (error) {
    console.error('\n❌ ERRO durante o diagnóstico:', error);
    console.error('   Stack:', error.stack);
    console.log('\n💡 Tente:');
    console.log('   1. Fazer logout e login novamente');
    console.log('   2. Limpar o cache do navegador');
    console.log('   3. Verificar se o Edge Function está ativo');
  }
}

// Executar diagnóstico
diagnosticarBoletos();
```

---

## 🚀 COMO USAR

### 1. Fazer Login
- Acesse o sistema
- Faça login como **morador**

### 2. Abrir Console
- Pressione **F12** (ou Ctrl+Shift+I)
- Vá na aba **Console**

### 3. Colar Script
- Copie TODO o código acima
- Cole no console
- Pressione **Enter**

### 4. Analisar Resultados
O script irá:
- ✅ Verificar seus dados de usuário
- ✅ Verificar se está vinculado a uma unidade
- ✅ Buscar seus boletos
- ✅ Analisar cada boleto
- ✅ Mostrar um resumo completo
- ✅ Sugerir próximos passos

---

## 📊 EXEMPLO DE SAÍDA

### ✅ Quando está funcionando:

```
╔════════════════════════════════════════════════╗
║  🔍 DIAGNÓSTICO DO SISTEMA DE BOLETOS         ║
╚════════════════════════════════════════════════╝

✅ Token obtido com sucesso

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 TESTE 1: DADOS DO USUÁRIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Dados do Usuário:
┌────────────────────┬────────────────────────┐
│ ID                 │ a1b2c3...              │
│ Nome               │ João Silva             │
│ Email              │ joao@email.com         │
│ Role               │ morador                │
│ ID Unidade         │ 1732600000000-xyz789   │
│ Tipo ID Unidade    │ string                 │
│ ID Condomínio      │ cond-123               │
│ Tipo ID Condomínio │ string                 │
└────────────────────┴────────────────────────┘

✅ Usuário está vinculado à unidade: 1732600000000-xyz789

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 TESTE 2: BOLETOS DO MORADOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Total de boletos encontrados: 3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 TESTE 3: ANÁLISE DOS BOLETOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 BOLETO 1:
┌─────────────────┬──────────────────────┐
│ ID              │ boleto-001           │
│ Referência      │ 11/2024              │
│ Valor           │ R$ 500.00            │
│ Status          │ pendente             │
│ Vencimento      │ 05/12/2024           │
│ ID Unidade      │ 1732600000000-xyz789 │
│ Tipo ID Unidade │ string               │
│ Bloco           │ A                    │
│ Número          │ 101                  │
│ Nome Morador    │ João Silva           │
└─────────────────┴──────────────────────┘

   ✅ Dados completos

   🔍 Comparação de IDs:
      Usuário:  1732600000000-xyz789 (string)
      Boleto:   1732600000000-xyz789 (string)
      Match:    ✅ SIM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 RESUMO DO DIAGNÓSTICO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 SISTEMA FUNCIONANDO PERFEITAMENTE!

✅ Todos os testes passaram:
   • Usuário vinculado à unidade
   • Boletos encontrados
   • Dados enriquecidos completos
   • IDs correspondem corretamente

💚 O sistema está 100% operacional!
```

### ❌ Quando há problemas:

```
⚠️ 2 PROBLEMA(S) ENCONTRADO(S)!

Ações necessárias:
   1. ⚠️ Dados incompletos nos boletos
      → Verifique se a correção foi deployada
      → Execute: supabase functions deploy make-server-fafb1703

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PRÓXIMOS PASSOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Deploy da correção:
   supabase functions deploy make-server-fafb1703

2️⃣ Limpar cache:
   Ctrl+Shift+Del → Limpar cache

3️⃣ Testar novamente:
   Execute este script novamente
```

---

## 💡 DICAS

1. **Execute este script ANTES do deploy** para confirmar o problema
2. **Execute DEPOIS do deploy** para verificar se foi corrigido
3. **Salve os resultados** para comparar antes/depois
4. **Compartilhe os logs** se precisar de suporte

---

## 🎯 CHECKLIST RÁPIDO

Use este script quando:
- [ ] Boletos não aparecem para o morador
- [ ] Dados aparecem como "-" no PDF
- [ ] Erro "desconhecido" ao acessar boletos
- [ ] Depois de fazer deploy da correção
- [ ] Para confirmar que tudo está funcionando

---

**Data:** 26/11/2024  
**Versão:** 1.0  
**Compatível com:** Smartcon v1.0
