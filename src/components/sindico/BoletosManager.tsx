import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Boleto, Unidade } from '../../types';
import { Plus, FileText, Download, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { fetchWithAuth } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import jsPDF from 'jspdf';

export function BoletosManager() {
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [idUnidade, setIdUnidade] = useState('');
  const [mesReferencia, setMesReferencia] = useState('');
  const [anoReferencia, setAnoReferencia] = useState(new Date().getFullYear().toString());
  const [valor, setValor] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [descricao, setDescricao] = useState('');
  const [sending, setSending] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [boletosData, unidadesData] = await Promise.all([
        fetchWithAuth('/boletos'),
        fetchWithAuth('/unidades')
      ]);
      setBoletos(boletosData || []);
      setUnidades(unidadesData || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setBoletos([]);
      setUnidades([]);
      if (loading) {
        toast.error(error.message || 'Erro ao carregar boletos');
      }
    } finally {
      setLoading(false);
    }
  };

  const gerarCodigoBarras = () => {
    // Gera um código de barras simulado (em produção, usar API bancária real)
    const random = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    return `34191.79001 01043.510047 91020.150008 ${Math.floor(Math.random() * 9)} ${random}`;
  };

  const handleCriar = async () => {
    if (!idUnidade || !mesReferencia || !anoReferencia || !valor || !dataVencimento) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    setSending(true);
    try {
      const linhaDigitavel = gerarCodigoBarras();
      const codigoBarras = linhaDigitavel.replace(/[.\s]/g, '');

      await fetchWithAuth('/boletos', {
        method: 'POST',
        body: JSON.stringify({
          id_unidade: idUnidade, // Manter como string
          mes_referencia: mesReferencia,
          ano_referencia: parseInt(anoReferencia),
          valor: parseFloat(valor),
          data_vencimento: dataVencimento,
          codigo_barras: codigoBarras,
          linha_digitavel: linhaDigitavel,
          descricao,
          status: 'pendente'
        })
      });

      toast.success('Boleto criado com sucesso!');
      setIdUnidade('');
      setMesReferencia('');
      setAnoReferencia(new Date().getFullYear().toString());
      setValor('');
      setDataVencimento('');
      setDescricao('');
      setOpen(false);
      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao criar boleto:', error);
      toast.error('Erro ao criar boleto');
    } finally {
      setSending(false);
    }
  };

  const handleMarcarPago = async (id: string | number) => {
    try {
      await fetchWithAuth(`/boletos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'pago',
          data_pagamento: new Date().toISOString()
        })
      });

      toast.success('Boleto marcado como pago!');
      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao atualizar boleto:', error);
      toast.error('Erro ao atualizar boleto');
    }
  };

  const gerarPDF = (boleto: Boleto) => {
    const doc = new jsPDF();
    
    // Configuração de cores da paleta Smartcon
    const primaryColor = [26, 42, 128];
    const secondaryColor = [122, 133, 193];
    
    // Cabeçalho
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('SMARTCON', 15, 20);
    doc.setFontSize(12);
    doc.text('Sistema de Gestão Condominial', 15, 30);
    
    // Linha separadora
    doc.setDrawColor(...secondaryColor);
    doc.setLineWidth(0.5);
    doc.line(15, 45, 195, 45);
    
    // Título do documento
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text('BOLETO DE CONDOMÍNIO', 15, 55);
    
    // Informações do boleto
    doc.setFontSize(11);
    let y = 70;
    
    doc.text(`Unidade: Bloco ${boleto.unidade_bloco || '-'} - ${boleto.unidade_numero || '-'}`, 15, y);
    y += 8;
    doc.text(`Morador: ${boleto.usuario_nome || '-'}`, 15, y);
    y += 8;
    doc.text(`Referência: ${boleto.mes_referencia}/${boleto.ano_referencia}`, 15, y);
    y += 8;
    doc.text(`Vencimento: ${new Date(boleto.data_vencimento).toLocaleDateString('pt-BR')}`, 15, y);
    y += 8;
    
    // Valor em destaque
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, 180, 15, 'F');
    doc.setFontSize(14);
    doc.text(`Valor: ${formatCurrency(boleto.valor)}`, 20, y + 10);
    
    y += 25;
    
    // Descrição
    if (boleto.descricao) {
      doc.setFontSize(11);
      doc.text('Descrição:', 15, y);
      y += 7;
      const splitDesc = doc.splitTextToSize(boleto.descricao, 180);
      doc.text(splitDesc, 15, y);
      y += splitDesc.length * 7 + 10;
    }
    
    // Linha digitável
    doc.setDrawColor(...secondaryColor);
    doc.line(15, y, 195, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.text('LINHA DIGITÁVEL:', 15, y);
    y += 7;
    doc.setFontSize(12);
    doc.text(boleto.linha_digitavel, 15, y);
    y += 15;
    
    // Código de barras (representação textual)
    doc.setFontSize(8);
    doc.text('CÓDIGO DE BARRAS:', 15, y);
    y += 5;
    doc.setFontSize(10);
    doc.text(boleto.codigo_barras, 15, y);
    
    // Rodapé
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text('Este boleto foi gerado automaticamente pelo sistema Smartcon.', 15, 280);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 15, 285);
    
    // Salvar PDF
    doc.save(`boleto_${boleto.mes_referencia}_${boleto.ano_referencia}_unidade_${boleto.unidade_numero}.pdf`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Pago</Badge>;
      case 'vencido':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Vencido</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
    }
  };

  const calcularEstatisticas = () => {
    const total = boletos.length;
    const pagos = boletos.filter(b => b.status === 'pago').length;
    const pendentes = boletos.filter(b => b.status === 'pendente').length;
    const vencidos = boletos.filter(b => b.status === 'vencido').length;
    const valorTotal = boletos.reduce((sum, b) => sum + b.valor, 0);
    const valorRecebido = boletos.filter(b => b.status === 'pago').reduce((sum, b) => sum + b.valor, 0);
    const valorPendente = boletos.filter(b => b.status !== 'pago').reduce((sum, b) => sum + b.valor, 0);

    return { total, pagos, pendentes, vencidos, valorTotal, valorRecebido, valorPendente };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">Carregando boletos...</p>
      </div>
    );
  }

  const stats = calcularEstatisticas();
  
  // Filtrar boletos com lógica específica para cada status
  const boletosFiltrados = filtroStatus === 'todos' 
    ? boletos 
    : filtroStatus === 'vencido'
    ? boletos.filter(b => {
        const hoje = new Date();
        const vencimento = new Date(b.data_vencimento);
        return (b.status !== 'pago' && vencimento < hoje) || b.status === 'vencido';
      })
    : filtroStatus === 'pendente'
    ? boletos.filter(b => {
        const hoje = new Date();
        const vencimento = new Date(b.data_vencimento);
        return (b.status === 'pendente' || (b.status !== 'pago' && b.status !== 'vencido' && vencimento >= hoje));
      })
    : boletos.filter(b => b.status === filtroStatus);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl">Gestão de Boletos</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gere e gerencie boletos do condomínio
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="text-sm sm:text-base">Gerar Boleto</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gerar Novo Boleto</DialogTitle>
              <DialogDescription>
                Crie um boleto para uma unidade específica
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Select value={idUnidade} onValueChange={setIdUnidade} disabled={sending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map((unidade) => (
                      <SelectItem key={unidade.id} value={unidade.id.toString()}>
                        Bloco {unidade.bloco} - {unidade.numero}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mes">Mês de Referência</Label>
                  <Select value={mesReferencia} onValueChange={setMesReferencia} disabled={sending}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Janeiro">Janeiro</SelectItem>
                      <SelectItem value="Fevereiro">Fevereiro</SelectItem>
                      <SelectItem value="Março">Março</SelectItem>
                      <SelectItem value="Abril">Abril</SelectItem>
                      <SelectItem value="Maio">Maio</SelectItem>
                      <SelectItem value="Junho">Junho</SelectItem>
                      <SelectItem value="Julho">Julho</SelectItem>
                      <SelectItem value="Agosto">Agosto</SelectItem>
                      <SelectItem value="Setembro">Setembro</SelectItem>
                      <SelectItem value="Outubro">Outubro</SelectItem>
                      <SelectItem value="Novembro">Novembro</SelectItem>
                      <SelectItem value="Dezembro">Dezembro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ano">Ano</Label>
                  <Input
                    id="ano"
                    type="number"
                    placeholder="2024"
                    value={anoReferencia}
                    onChange={(e) => setAnoReferencia(e.target.value)}
                    disabled={sending}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  disabled={sending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vencimento">Data de Vencimento</Label>
                <Input
                  id="vencimento"
                  type="date"
                  value={dataVencimento}
                  onChange={(e) => setDataVencimento(e.target.value)}
                  disabled={sending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição (opcional)</Label>
                <Textarea
                  id="descricao"
                  placeholder="Ex: Taxa de condomínio + taxa extra..."
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
                {sending ? 'Gerando...' : 'Gerar Boleto'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Total de Boletos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm text-green-600">Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl text-green-600">{stats.pagos}</div>
            <p className="text-xs text-muted-foreground mt-1">{formatCurrency(stats.valorRecebido)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm text-yellow-600">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl text-yellow-600">{stats.pendentes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm text-red-600">Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl text-red-600">{stats.vencidos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filtroStatus === 'todos' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroStatus('todos')}
        >
          Todos
        </Button>
        <Button
          variant={filtroStatus === 'pendente' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroStatus('pendente')}
        >
          Pendentes
        </Button>
        <Button
          variant={filtroStatus === 'pago' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroStatus('pago')}
        >
          Pagos
        </Button>
        <Button
          variant={filtroStatus === 'vencido' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroStatus('vencido')}
        >
          Vencidos
        </Button>
      </div>

      {/* Lista de boletos */}
      <div className="space-y-3 sm:space-y-4">
        {boletosFiltrados.map((boleto) => (
          <Card key={boleto.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base break-words">
                      Bloco {boleto.unidade_bloco} - {boleto.unidade_numero}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {boleto.usuario_nome} • {boleto.mes_referencia}/{boleto.ano_referencia}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(boleto.status)}
                  <div className="text-lg">{formatCurrency(boleto.valor)}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vencimento:</span>
                  <span>{formatDate(boleto.data_vencimento)}</span>
                </div>
                {boleto.data_pagamento && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pagamento:</span>
                    <span className="text-green-600">{formatDate(boleto.data_pagamento)}</span>
                  </div>
                )}
                {boleto.descricao && (
                  <p className="text-sm text-muted-foreground mt-2">{boleto.descricao}</p>
                )}
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => gerarPDF(boleto)}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Baixar PDF
                  </Button>
                  {boleto.status !== 'pago' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarcarPago(boleto.id)}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Marcar como Pago
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {boletosFiltrados.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                {filtroStatus === 'todos' 
                  ? 'Nenhum boleto gerado ainda.'
                  : `Nenhum boleto ${filtroStatus}.`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}