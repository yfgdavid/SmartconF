import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TransacaoFinanceira } from '../../types';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { fetchWithAuth } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export function FinanceiroManager() {
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    carregarTransacoes();
  }, []);

  const carregarTransacoes = async () => {
    try {
      const data = await fetchWithAuth('/transacoes');
      setTransacoes(data);
    } catch (error: any) {
      console.error('Erro ao carregar transações:', error);
      if (loading) {
        toast.error('Erro ao carregar transações');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCriar = async () => {
    if (!categoria.trim() || !valor || !descricao.trim() || !data) {
      toast.error('Preencha todos os campos!');
      return;
    }

    setSending(true);
    try {
      await fetchWithAuth('/transacoes', {
        method: 'POST',
        body: JSON.stringify({
          tipo,
          categoria,
          valor: parseFloat(valor),
          descricao,
          data_transacao: data
        })
      });

      toast.success('Transação registrada com sucesso!');
      setCategoria('');
      setValor('');
      setDescricao('');
      setData('');
      setOpen(false);
      await carregarTransacoes();
    } catch (error: any) {
      console.error('Erro ao registrar transação:', error);
      toast.error('Erro ao registrar transação');
    } finally {
      setSending(false);
    }
  };

  const calcularSaldo = () => {
    const receitas = transacoes
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const despesas = transacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0);
    
    return { receitas, despesas, saldo: receitas - despesas };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">Carregando transações...</p>
      </div>
    );
  }

  const { receitas, despesas, saldo } = calcularSaldo();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl">Gestão Financeira</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Controle receitas e despesas do condomínio
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="text-sm sm:text-base">Nova Transação</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Transação</DialogTitle>
              <DialogDescription>
                Adicione uma nova receita ou despesa
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as 'receita' | 'despesa')} disabled={sending}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  placeholder="Ex: Taxa condominial"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  disabled={sending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="text"
                  placeholder="0,00"
                  value={valor}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Permitir apenas números, vírgula e ponto
                    const filtered = value.replace(/[^0-9.,]/g, '');
                    setValor(filtered);
                  }}
                  onKeyDown={(e) => {
                    // Bloquear teclas que não sejam números, vírgula, ponto, backspace, delete, tab, setas
                    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                    if (!allowedKeys.includes(e.key) && !/[0-9.,]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  disabled={sending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  disabled={sending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descrição da transação..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={3}
                  disabled={sending}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
                Cancelar
              </Button>
              <Button onClick={handleCriar} disabled={sending}>
                {sending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-3">
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm text-green-600">Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl text-green-600">{formatCurrency(receitas)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm text-red-600">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl text-red-600">{formatCurrency(despesas)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg sm:text-xl ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldo)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {transacoes.map((transacao) => (
          <Card key={transacao.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                {transacao.tipo === 'receita' ? (
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <CardTitle className="text-base">{transacao.categoria}</CardTitle>
                  <CardDescription className="mt-1">
                    {formatDate(transacao.data_transacao)}
                  </CardDescription>
                </div>
                <div className={`text-lg ${transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                  {transacao.tipo === 'receita' ? '+' : '-'} {formatCurrency(transacao.valor)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">{transacao.descricao}</p>
            </CardContent>
          </Card>
        ))}

        {transacoes.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Nenhuma transação registrada.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
