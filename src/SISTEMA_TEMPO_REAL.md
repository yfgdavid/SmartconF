# 🔄 Sistema de Sincronização em Tempo Real - Smartcon

## Visão Geral

O Smartcon agora possui **sincronização automática em tempo real** entre todos os usuários. As mudanças feitas por um síndico aparecem automaticamente para os moradores, e vice-versa.

## ✅ Funcionalidades com Sincronização

### 1. **Comunicados**
- ✓ Síndico cria → Morador recebe automaticamente
- ✓ Atualização a cada 10 segundos
- ✓ Indicador de última sincronização

### 2. **Ocorrências**
- ✓ Morador registra → Síndico visualiza automaticamente
- ✓ Síndico atualiza status → Morador vê mudança
- ✓ Estados: Pendente → Em Andamento → Resolvida

### 3. **Reservas de Espaços**
- ✓ Morador reserva → Síndico visualiza
- ✓ Síndico cria espaço → Morador pode reservar
- ✓ Cancelamentos sincronizados

### 4. **Boletos**
- ✓ Síndico emite → Morador recebe
- ✓ Status de pagamento atualizado

## 🛠️ Como Funciona

### Polling Inteligente

Todos os componentes principais usam **polling** (atualização periódica) a cada **10 segundos**:

```typescript
useEffect(() => {
  carregarDados();
  
  // Atualizar a cada 10 segundos
  const interval = setInterval(carregarDados, 10000);
  return () => clearInterval(interval);
}, []);
```

### Componentes com Sincronização

✅ **Síndico:**
- `ComunicadosManager.tsx` - Gerencia comunicados
- `OcorrenciasManager.tsx` - Gerencia ocorrências
- `EspacosManager.tsx` - Gerencia espaços e reservas
- `BoletosManager.tsx` - Gerencia boletos

✅ **Morador:**
- `MeusComunicados.tsx` - Visualiza comunicados
- `MinhasOcorrencias.tsx` - Registra e acompanha ocorrências
- `MinhasReservas.tsx` - Cria e gerencia reservas
- `MeusBoletos.tsx` - Visualiza boletos

## 🎨 Indicador Visual de Sincronização

O componente `SyncIndicator` mostra quando foi a última atualização:

```tsx
<SyncIndicator lastSync={lastSync} className="mt-2" />
```

Exibe:
- "Agora" - se sincronizou há menos de 5 segundos
- "Xs atrás" - se sincronizou há X segundos
- "Xmin atrás" - se sincronizou há X minutos
- Hora específica - se passou mais de 1 hora

## 📝 Exemplo de Implementação

```typescript
export function MeuComponente() {
  const [dados, setDados] = useState([]);
  const [lastSync, setLastSync] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
    
    // Polling a cada 10 segundos
    const interval = setInterval(carregarDados, 10000);
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      const data = await fetchWithAuth('/endpoint');
      setDados(data);
      setLastSync(new Date()); // Marca o horário da sincronização
    } catch (error: any) {
      console.error('Erro:', error);
      if (loading) {
        toast.error('Erro ao carregar dados');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Meu Componente</h2>
      <SyncIndicator lastSync={lastSync} />
      {/* Resto do componente */}
    </div>
  );
}
```

## 🧪 Como Testar

Veja o arquivo `/guidelines/GUIA_DE_TESTES.md` para instruções detalhadas sobre como testar a sincronização com múltiplas sessões.

### Quick Start

1. **Abra 2 janelas do navegador** (uma normal e uma anônima)
2. **Janela 1**: Cadastre e faça login como **Síndico**
3. **Janela 2**: Cadastre e faça login como **Morador** (usando o ID do condomínio do síndico)
4. **Teste**: 
   - Síndico cria comunicado → veja aparecer para o morador em até 10s
   - Morador cria ocorrência → veja aparecer para o síndico em até 10s

## ⚙️ Configurações

### Intervalo de Polling

O intervalo padrão é **10 segundos** (10000ms). Para ajustar:

```typescript
// Altere o valor em cada componente
const interval = setInterval(carregarDados, 10000); // 10s
// Para 3 segundos:
const interval = setInterval(carregarDados, 3000); // 3s
```

**⚠️ Atenção**: Intervalos muito curtos (< 3s) podem sobrecarregar o servidor e consumir mais dados.

### Alternativa: Supabase Realtime

Para sincronização **instantânea** (sem esperar), você pode implementar **Supabase Realtime**:

```typescript
// Exemplo de implementação futura com Realtime
const supabase = createClient();

useEffect(() => {
  const channel = supabase
    .channel('comunicados')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'comunicados' },
      (payload) => {
        // Atualiza instantaneamente quando há novo comunicado
        setComunicados(prev => [payload.new, ...prev]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

## 🔧 Troubleshooting

### Dados não sincronizam

1. ✓ Verifique se ambos os usuários estão no **mesmo condomínio**
2. ✓ Aguarde pelo menos **10 segundos**
3. ✓ Verifique o console do navegador (F12) para erros
4. ✓ Certifique-se de que está logado corretamente

### Sincronização muito lenta

1. ✓ Reduza o intervalo de polling de 10000ms para 5000ms
2. ✓ Considere implementar Supabase Realtime para sync instantânea

### Muitas requisições ao servidor

1. ✓ Aumente o intervalo de polling de 10000ms para 15000ms ou 30000ms
2. ✓ Implemente debouncing/throttling

## 📊 Performance

### Impacto do Polling

- **Consumo de dados**: ~1-5 KB por requisição
- **Requisições por hora**: 360 (a cada 10s)
- **Impacto no servidor**: Baixo a moderado

### Otimizações Implementadas

✅ Cleanup de intervals no `useEffect`
✅ Evita toast de erro no primeiro carregamento
✅ Estados de loading separados
✅ Requests paralelos com `Promise.all`

## 🚀 Próximos Passos

1. **Implementar WebSockets/Realtime** para sincronização instantânea
2. **Adicionar notificações push** para eventos importantes
3. **Cache inteligente** com Service Workers
4. **Offline-first** com sincronização ao reconectar

---

**Desenvolvido para o Smartcon** - Sistema de Gestão Condominial
