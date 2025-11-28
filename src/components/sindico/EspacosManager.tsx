import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Espaco, Reserva } from '../../types';
import { CalendarDays, Users, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { fetchWithAuth } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export function EspacosManager() {
  const [espacos, setEspacos] = useState<Espaco[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    carregarDados();
    
    // Atualizar a cada 10 segundos
    const interval = setInterval(carregarDados, 10000);
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      const [espacosData, reservasData] = await Promise.all([
        fetchWithAuth('/espacos'),
        fetchWithAuth('/reservas')
      ]);
      setEspacos(espacosData);
      setReservas(reservasData);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      if (loading) {
        toast.error('Erro ao carregar dados');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCriarEspaco = async () => {
    if (!nome.trim() || !capacidade) {
      toast.error('Preencha todos os campos!');
      return;
    }

    setSending(true);
    try {
      await fetchWithAuth('/espacos', {
        method: 'POST',
        body: JSON.stringify({
          nome,
          capacidade: parseInt(capacidade)
        })
      });

      toast.success('Espaço criado com sucesso!');
      setNome('');
      setCapacidade('');
      setOpen(false);
      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao criar espaço:', error);
      toast.error('Erro ao criar espaço');
    } finally {
      setSending(false);
    }
  };

  const handleAprovarReserva = async (id: string) => {
    try {
      await fetchWithAuth(`/reservas/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'confirmada' })
      });

      toast.success('Reserva aprovada com sucesso!');
      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao aprovar reserva:', error);
      toast.error('Erro ao aprovar reserva');
    }
  };

  const handleRejeitarReserva = async (id: string) => {
    try {
      await fetchWithAuth(`/reservas/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelada' })
      });

      toast.success('Reserva rejeitada com sucesso!');
      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao rejeitar reserva:', error);
      toast.error('Erro ao rejeitar reserva');
    }
  };

  const getStatusBadge = (status: Reserva['status']) => {
    const variants = {
      pendente: 'bg-yellow-100 text-yellow-800',
      confirmada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800'
    };

    const labels = {
      pendente: 'Pendente Aprovação',
      confirmada: 'Confirmada',
      cancelada: 'Cancelada'
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
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
        <p className="text-muted-foreground">Carregando espaços...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl">Gerenciar Espaços e Reservas</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Controle as áreas comuns e suas reservas
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="text-sm sm:text-base">Novo Espaço</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Espaço</DialogTitle>
              <DialogDescription>
                Adicione um novo espaço comum ao condomínio
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Espaço</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Churrasqueira 1"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  disabled={sending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacidade">Capacidade (pessoas)</Label>
                <Input
                  id="capacidade"
                  type="number"
                  placeholder="Ex: 20"
                  value={capacidade}
                  onChange={(e) => setCapacidade(e.target.value)}
                  disabled={sending}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
                Cancelar
              </Button>
              <Button onClick={handleCriarEspaco} disabled={sending}>
                {sending ? 'Criando...' : 'Criar Espaço'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl">Espaços Comuns</h3>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {espacos.map((espaco) => (
            <Card key={espaco.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base break-words">{espaco.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span className="break-words">Cap.: {espaco.capacidade}</span>
                </div>
                {espaco.ativo ? (
                  <Badge className="mt-2 bg-green-100 text-green-800">Ativo</Badge>
                ) : (
                  <Badge className="mt-2 bg-gray-100 text-gray-800">Inativo</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {reservas.filter(r => r.status === 'pendente').length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-5 w-5 text-yellow-700" />
            <h3 className="text-lg text-yellow-900">
              Reservas Aguardando Aprovação ({reservas.filter(r => r.status === 'pendente').length})
            </h3>
          </div>
          <p className="text-sm text-yellow-800 mb-4">
            Estas reservas foram solicitadas pelos moradores e aguardam sua aprovação ou rejeição.
          </p>
        </div>
      )}

      <div>
        <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl">Todas as Reservas</h3>
        <div className="space-y-3 sm:space-y-4">
          {reservas.map((reserva) => (
            <Card key={reserva.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3 w-full">
                    <CalendarDays className="h-5 w-5 text-[#3B38A0] mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm sm:text-base break-words pr-2">{reserva.espaco_nome}</CardTitle>
                      <CardDescription className="mt-1 text-xs sm:text-sm break-words">
                        Reservado por {reserva.usuario_nome}
                      </CardDescription>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(reserva.status)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 pt-0">
                <div className="text-xs sm:text-sm space-y-1 break-words">
                  <p>📅 Início: {formatDateTime(reserva.data_inicio)}</p>
                  <p>📅 Término: {formatDateTime(reserva.data_fim)}</p>
                </div>
                {reserva.status === 'pendente' && (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => handleAprovarReserva(reserva.id.toString())}
                      className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejeitarReserva(reserva.id.toString())}
                      className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rejeitar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {reservas.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  Nenhuma reserva encontrada.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
