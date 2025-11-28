import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Ocorrencia } from '../../types';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { fetchWithAuth } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export function OcorrenciasManager() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [filtro, setFiltro] = useState<string>('todas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarOcorrencias();
    
    // Atualizar a cada 10 segundos para sincronização em tempo real
    const interval = setInterval(carregarOcorrencias, 10000);
    return () => clearInterval(interval);
  }, []);

  const carregarOcorrencias = async () => {
    try {
      const data = await fetchWithAuth('/ocorrencias');
      setOcorrencias(data);
    } catch (error: any) {
      console.error('Erro ao carregar ocorrências:', error);
      if (loading) {
        toast.error('Erro ao carregar ocorrências');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, novoStatus: Ocorrencia['status']) => {
    try {
      await fetchWithAuth(`/ocorrencias/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: novoStatus })
      });
      
      toast.success('Status atualizado com sucesso!');
      await carregarOcorrencias();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status da ocorrência');
    }
  };

  const ocorrenciasFiltradas = ocorrencias.filter(oc => {
    if (filtro === 'todas') return true;
    return oc.status === filtro;
  });

  const getStatusIcon = (status: Ocorrencia['status']) => {
    switch (status) {
      case 'pendente':
        return <AlertCircle className="h-4 w-4" />;
      case 'em_andamento':
        return <Clock className="h-4 w-4" />;
      case 'resolvida':
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: Ocorrencia['status']) => {
    const variants = {
      pendente: 'bg-yellow-100 text-yellow-800',
      em_andamento: 'bg-blue-100 text-blue-800',
      resolvida: 'bg-green-100 text-green-800'
    };

    const labels = {
      pendente: 'Pendente',
      em_andamento: 'Em Andamento',
      resolvida: 'Resolvida'
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">Carregando ocorrências...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl">Gerenciar Ocorrências</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Acompanhe e resolva os problemas reportados pelos moradores
          </p>
        </div>
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="resolvida">Resolvidas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-3">
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl">{ocorrencias.filter(o => o.status === 'pendente').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl">{ocorrencias.filter(o => o.status === 'em_andamento').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Resolvidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl">{ocorrencias.filter(o => o.status === 'resolvida').length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {ocorrenciasFiltradas.map((ocorrencia) => (
          <Card key={ocorrencia.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 w-full">
                  {getStatusIcon(ocorrencia.status)}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg break-words pr-2">{ocorrencia.titulo}</CardTitle>
                    <CardDescription className="mt-1 text-xs sm:text-sm break-words">
                      Reportado por {ocorrencia.usuario_nome} em {formatDate(ocorrencia.data_registro)}
                    </CardDescription>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(ocorrencia.status)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 pt-0">
              <p className="text-xs sm:text-sm break-words leading-relaxed">{ocorrencia.descricao}</p>
              
              {ocorrencia.data_resolucao && (
                <p className="text-xs sm:text-sm text-green-600 break-words">
                  ✓ Resolvida em {formatDate(ocorrencia.data_resolucao)}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                {ocorrencia.status === 'pendente' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(ocorrencia.id.toString(), 'em_andamento')}
                    className="w-full sm:w-auto"
                  >
                    Iniciar Atendimento
                  </Button>
                )}
                {ocorrencia.status === 'em_andamento' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(ocorrencia.id.toString(), 'resolvida')}
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  >
                    Marcar como Resolvida
                  </Button>
                )}
                {ocorrencia.status === 'resolvida' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(ocorrencia.id.toString(), 'em_andamento')}
                    className="w-full sm:w-auto"
                  >
                    Reabrir Ocorrência
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {ocorrenciasFiltradas.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Nenhuma ocorrência encontrada com este filtro.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
