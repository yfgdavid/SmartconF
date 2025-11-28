import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Ocorrencia, User } from '../../types';
import { AlertCircle, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { fetchWithAuth } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface MinhasOcorrenciasProps {
  user: User;
}

export function MinhasOcorrencias({ user }: MinhasOcorrenciasProps) {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

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

  const handleRegistrar = async () => {
    if (!titulo.trim() || !descricao.trim()) {
      toast.error('Preencha todos os campos!');
      return;
    }

    setSending(true);
    try {
      await fetchWithAuth('/ocorrencias', {
        method: 'POST',
        body: JSON.stringify({
          titulo,
          descricao
        })
      });

      toast.success('Ocorrência registrada com sucesso!');
      setTitulo('');
      setDescricao('');
      setOpen(false);
      await carregarOcorrencias();
    } catch (error: any) {
      console.error('Erro ao registrar ocorrência:', error);
      toast.error('Erro ao registrar ocorrência');
    } finally {
      setSending(false);
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
          <h2 className="text-xl sm:text-2xl">Minhas Ocorrências</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Registre e acompanhe os problemas da sua unidade
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="text-sm sm:text-base">Registrar</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nova Ocorrência</DialogTitle>
              <DialogDescription>
                Descreva o problema que deseja reportar
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Vazamento no banheiro"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  disabled={sending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o problema em detalhes..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={6}
                  disabled={sending}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
                Cancelar
              </Button>
              <Button onClick={handleRegistrar} disabled={sending}>
                {sending ? 'Registrando...' : 'Registrar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-3">
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl">{ocorrencias.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Em Aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl text-yellow-600">
              {ocorrencias.filter(o => o.status === 'pendente' || o.status === 'em_andamento').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Resolvidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl text-green-600">
              {ocorrencias.filter(o => o.status === 'resolvida').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {ocorrencias.map((ocorrencia) => (
          <Card key={ocorrencia.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 w-full">
                  <AlertCircle className="h-5 w-5 text-[#1A2A80] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg break-words pr-2">{ocorrencia.titulo}</CardTitle>
                    <CardDescription className="mt-1 text-xs sm:text-sm break-words">
                      Registrado em {formatDate(ocorrencia.data_registro)}
                    </CardDescription>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(ocorrencia.status)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <p className="text-xs sm:text-sm break-words leading-relaxed">{ocorrencia.descricao}</p>
              
              {ocorrencia.data_resolucao && (
                <p className="text-xs sm:text-sm text-green-600 break-words">
                  ✓ Resolvida em {formatDate(ocorrencia.data_resolucao)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {ocorrencias.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Você ainda não registrou nenhuma ocorrência.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
