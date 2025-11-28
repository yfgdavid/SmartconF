import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Boleto } from '../../types';
import { FileText, Download, CheckCircle, Clock, AlertCircle, Copy } from 'lucide-react';
import { Badge } from '../ui/badge';
import { fetchWithAuth } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import jsPDF from 'jspdf';

export function MeusBoletos() {
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  useEffect(() => {
    carregarBoletos();
  }, []);

  const carregarBoletos = async () => {
    try {
      console.log('[MeusBoletos] Iniciando carregamento...');
      const data = await fetchWithAuth('/boletos/meus');
      console.log('[MeusBoletos] Dados recebidos:', data);
      
      // Garantir que data é um array
      if (Array.isArray(data)) {
        setBoletos(data);
      } else {
        console.warn('[MeusBoletos] Resposta não é array:', data);
        setBoletos([]);
      }
    } catch (error: any) {
      console.error('[MeusBoletos] Erro completo:', error);
      setBoletos([]);
      
      // Só mostrar toast se ainda estiver carregando (primeira vez)
      if (loading) {
        toast.error('Erro ao carregar boletos. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copiarLinhaDigitavel = (linha: string) => {
    navigator.clipboard.writeText(linha);
    toast.success('Linha digitável copiada!');
  };

  const gerarPDF = (boleto: Boleto) => {
    console.log('[MeusBoletos] Gerando PDF com dados:', boleto);
    
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
    
    const bloco = boleto.unidade_bloco || '-';
    const numero = boleto.unidade_numero || '-';
    const morador = boleto.usuario_nome || '-';
    
    console.log('[MeusBoletos] Dados para PDF - Bloco:', bloco, 'Número:', numero, 'Morador:', morador);
    
    doc.text(`Unidade: Bloco ${bloco} - ${numero}`, 15, y);
    y += 8;
    doc.text(`Morador: ${morador}`, 15, y);
    y += 8;
    doc.text(`Referência: ${boleto.mes_referencia}/${boleto.ano_referencia}`, 15, y);
    y += 8;
    doc.text(`Vencimento: ${new Date(boleto.data_vencimento).toLocaleDateString('pt-BR')}`, 15, y);
    y += 8;
    
    // Status
    doc.text(`Status: ${boleto.status === 'pago' ? 'PAGO' : boleto.status === 'vencido' ? 'VENCIDO' : 'PENDENTE'}`, 15, y);
    y += 8;
    
    if (boleto.data_pagamento) {
      doc.text(`Data de Pagamento: ${new Date(boleto.data_pagamento).toLocaleDateString('pt-BR')}`, 15, y);
      y += 8;
    }
    
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
    
    // Instruções de pagamento
    y += 20;
    doc.setFontSize(10);
    doc.text('INSTRUÇÕES DE PAGAMENTO:', 15, y);
    y += 7;
    doc.setFontSize(9);
    const instrucoes = [
      '• Pague este boleto em qualquer banco, casa lotérica ou aplicativo bancário até a data de vencimento.',
      '• Após o vencimento, o pagamento poderá sofrer acréscimos de multa e juros.',
      '• Em caso de dúvidas, entre em contato com a administração do condomínio.',
    ];
    instrucoes.forEach((inst) => {
      doc.text(inst, 15, y);
      y += 6;
    });
    
    // Rodapé
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text('Este boleto foi gerado automaticamente pelo sistema Smartcon.', 15, 280);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 15, 285);
    
    // Salvar PDF
    doc.save(`boleto_${boleto.mes_referencia}_${boleto.ano_referencia}.pdf`);
    toast.success('PDF gerado com sucesso!');
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

  const getStatusBadge = (status: string, dataVencimento: string) => {
    // Verificar se está vencido
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const isVencido = status !== 'pago' && vencimento < hoje;
    
    if (isVencido) {
      return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Vencido</Badge>;
    }
    
    switch (status) {
      case 'pago':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Pago</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">Carregando boletos...</p>
      </div>
    );
  }

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

  // Calcular totais
  const valorTotal = boletos.reduce((sum, b) => sum + b.valor, 0);
  const valorPendente = boletos.filter(b => b.status !== 'pago').reduce((sum, b) => sum + b.valor, 0);
  const valorPago = boletos.filter(b => b.status === 'pago').reduce((sum, b) => sum + b.valor, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl">Meus Boletos</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Visualize e baixe seus boletos de condomínio
        </p>
      </div>

      {/* Resumo */}
      <div className="grid gap-3 sm:gap-4 grid-cols-3">
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg">{formatCurrency(valorTotal)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm text-yellow-600">A Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg text-yellow-600">{formatCurrency(valorPendente)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm text-green-600">Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg text-green-600">{formatCurrency(valorPago)}</div>
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
                  <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base break-words">
                      {boleto.mes_referencia}/{boleto.ano_referencia}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Bloco {boleto.unidade_bloco} - {boleto.unidade_numero}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(boleto.status, boleto.data_vencimento)}
                  <div className="text-lg whitespace-nowrap">{formatCurrency(boleto.valor)}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vencimento:</span>
                  <span className={
                    boleto.status !== 'pago' && new Date(boleto.data_vencimento) < new Date()
                      ? 'text-red-600'
                      : ''
                  }>
                    {formatDate(boleto.data_vencimento)}
                  </span>
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
              </div>

              {/* Linha digitável */}
              {boleto.status !== 'pago' && (
                <div className="space-y-2 p-3 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground">Linha digitável:</p>
                  <div className="flex gap-2 items-start">
                    <code className="text-xs break-all flex-1">{boleto.linha_digitavel}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copiarLinhaDigitavel(boleto.linha_digitavel)}
                      className="flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2 flex-wrap">
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
                    onClick={() => copiarLinhaDigitavel(boleto.linha_digitavel)}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar Linha Digitável
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {boletosFiltrados.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                {filtroStatus === 'todos' 
                  ? 'Você ainda não possui boletos.'
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