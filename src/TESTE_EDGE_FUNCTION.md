# 🧪 Teste do Edge Function - Verificar se está Funcionando

## 🎯 Objetivo
Verificar se o Edge Function do Supabase está realmente ativo e funcionando, independente do erro 403.

---

## ✅ Teste Rápido (2 minutos)

### Passo 1: Abrir a Aplicação
1. Abra a aplicação no navegador
2. Aguarde carregar completamente

### Passo 2: Abrir Console do Navegador
1. Pressione `F12` para abrir DevTools
2. Vá na aba **Console**
3. Limpe o console (ícone 🚫 ou Ctrl+L)

### Passo 3: Tentar Criar Conta
1. Clique em "Criar conta" na aplicação
2. Preencha os dados:
   - Nome: Teste
   - Email: teste@teste.com
   - Senha: 123456
   - Telefone: 11999999999
   - Tipo: Síndico

3. Clique em "Cadastrar"

### Passo 4: Analisar o Resultado

#### ✅ Se o Edge Function está Funcionando:
Você verá no console:
```
POST https://[seu-projeto].supabase.co/functions/v1/make-server-fafb1703/signup
Status: 200 (ou 400 se email já existe)
```

**Resultado:** Aparecerá mensagem de sucesso ou erro específico (ex: "Email já cadastrado")

#### ❌ Se o Edge Function NÃO está Funcionando:
Você verá no console:
```
POST https://[seu-projeto].supabase.co/functions/v1/make-server-fafb1703/signup
Status: 404 (Not Found) ou 500 (Server Error)
```

**Resultado:** Mensagem genérica de erro de conexão

---

## 🔍 Teste Detalhado do Health Check

### Método 1: Via Navegador

1. Abra o console do navegador (F12)
2. Cole este código e pressione Enter:

```javascript
fetch('https://lqes4n3icgve3f00eotd5a.supabase.co/functions/v1/make-server-fafb1703/health')
  .then(r => r.json())
  .then(data => console.log('✅ Edge Function está ATIVO:', data))
  .catch(err => console.error('❌ Edge Function está INATIVO:', err));
```

#### Resultado Esperado:
```javascript
✅ Edge Function está ATIVO: { status: "ok" }
```

Se viu isso = **Edge Function funcionando perfeitamente!** 🎉

---

## 🧪 Teste Completo de Funcionalidades

### Teste 1: Health Check (/health)
**O que testa:** Se o servidor está online

```javascript
// Cole no console do navegador:
fetch('https://lqes4n3icgve3f00eotd5a.supabase.co/functions/v1/make-server-fafb1703/health')
  .then(r => r.json())
  .then(data => console.log('Health Check:', data));
```

**Esperado:** `{ status: "ok" }`

---

### Teste 2: Signup (/signup)
**O que testa:** Se consegue criar usuários

```javascript
// Cole no console do navegador:
fetch('https://lqes4n3icgve3f00eotd5a.supabase.co/functions/v1/make-server-fafb1703/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'teste' + Date.now() + '@teste.com',
    password: '123456',
    nome: 'Teste',
    telefone: '11999999999',
    tipo_usuario: 'sindico'
  })
})
  .then(r => r.json())
  .then(data => console.log('Signup:', data))
  .catch(err => console.error('Erro:', err));
```

**Esperado:** Objeto com `session` e `user`

---

## 📊 Interpretando os Resultados

### Cenário 1: Tudo Funciona ✅
```
✅ Health Check retorna: { status: "ok" }
✅ Signup retorna: { session: {...}, user: {...} }
```

**Conclusão:** Edge Function está 100% operacional!  
**Ação:** Ignore o erro 403 e use o sistema normalmente

---

### Cenário 2: Erro 404 ❌
```
❌ Erro: 404 Not Found
```

**Significado:** Edge Function não foi deployado ou URL incorreta  
**Ação:** Precisa fazer deploy do Edge Function

---

### Cenário 3: Erro 500 ❌
```
❌ Erro: 500 Internal Server Error
```

**Significado:** Edge Function deployado mas com erro no código  
**Ação:** Verificar logs do Supabase

---

### Cenário 4: Erro de CORS ❌
```
❌ Erro: CORS policy
```

**Significado:** Problema de configuração de CORS  
**Ação:** Verificar configuração no código

---

## 🎯 Resultado Final

Depois de executar os testes acima, você saberá com certeza:

| Teste | Resultado | Status do Sistema |
|-------|-----------|-------------------|
| Health Check = OK | ✅ | Sistema funcionando |
| Signup funciona | ✅ | Pode criar usuários |
| Login funciona | ✅ | Pode autenticar |
| Dashboard carrega | ✅ | Dados sincronizando |

---

## 💡 Dicas Importantes

### 1. O Erro 403 não Significa que o Sistema está Quebrado
- Erro 403 = problema ao tentar FAZER DEPLOY
- Se o Edge Function já foi deployado antes = continua funcionando
- Você só não consegue fazer um NOVO deploy

### 2. Cache pode Esconder Problemas
- Sempre teste em janela anônima para ter certeza
- Limpe cache e cookies antes de testar
- Use Ctrl + Shift + R para hard refresh

### 3. Console é seu Amigo
- Sempre mantenha o console aberto (F12)
- Erros aparecerão em vermelho
- Sucesso aparecerá em preto/cinza

---

## 🚀 Próximos Passos

### Se os Testes Passaram ✅
1. Abra `/VERIFICACAO_RAPIDA.md`
2. Teste as funcionalidades principais
3. Veja a sincronização em tempo real funcionando
4. **Ignore o erro 403!**

### Se os Testes Falharam ❌
1. Abra `/SOLUCAO_ERRO_403.md`
2. Siga as soluções passo a passo
3. Tente novamente

---

## ✨ Resumo

**O mais importante:** Execute o teste de Health Check. Se retornar `{ status: "ok" }`, seu sistema está funcionando perfeitamente e você pode ignorar o erro 403! 🎉

**Como testar agora:**
1. Abra o console do navegador (F12)
2. Cole o código do Health Check
3. Veja o resultado
4. Se for `{ status: "ok" }` = SISTEMA FUNCIONANDO! 🎊
