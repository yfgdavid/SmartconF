import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Espaco, Reserva, User } from '../../types';
import { CalendarDays, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { fetchWithAuth } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface MinhasReservasProps {
  user: User;
}

export function MinhasReservas({ user }: MinhasReservasProps) {
  const [espacos, setEspacos] = useState<Espaco[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [espacoId, setEspacoId] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [turno, setTurno] = useState<'manha' | 'tarde' | 'noite' | ''>('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    carregarDados();
    
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

  const handleReservar = async () => {
    if (!espacoId || !dataInicio || !turno) {
      toast.error('Preencha todos os campos!');
      return;
    }

    const turnos = {
      manha: { inicio: '06:00', fim: '12:00' },
      tarde: { inicio: '12:00', fim: '18:00' },
      noite: { inicio: '18:00', fim: '23:59' }
    };

    const horarios = turnos[turno as keyof typeof turnos];

    setSending(true);
    try {
      await fetchWithAuth('/reservas', {
        method: 'POST',
        body: JSON.stringify({
          id_espaco: espacoId,
          data_inicio: `${dataInicio}T${horarios.inicio}:00`,
          data_fim: `${dataInicio}T${horarios.fim}:00`,
          turno: turno
        })
      });

      toast.success('Reserva criada! Aguarde a aprovação do síndico.');
      setEspacoId('');
      setDataInicio('');
      setTurno('');
      setOpen(false);
      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao criar reserva:', error);
      toast.error(error.message || 'Erro ao criar reserva');
    } finally {
      setSending(false);
    }
  };

  const handleCancelar = async (id: string) => {
    try {
      await fetchWithAuth(`/reservas/${id}`, {
        method: 'DELETE'
      });

      toast.success('Reserva cancelada com sucesso!');
      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao cancelar reserva:', error);
      toast.error('Erro ao cancelar reserva');
    }
  };

  const getStatusBadge = (status: Reserva['status']) => {
    const variants = {
      pendente: 'bg-yellow-100 text-yellow-800',
      confirmada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800'
    };

    const labels = {
      pendente: 'Aguardando Aprovação',
      confirmada: 'Confirmada',
      cancelada: 'Cancelada'
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getTurnoLabel = (dataInicio: string, dataFim: string) => {
    const horaInicio = new Date(dataInicio).getHours();
    const horaFim = new Date(dataFim).getHours();
    
    if (horaInicio >= 6 && horaFim <= 12) {
      return '☀️ Manhã';
    } else if (horaInicio >= 12 && horaFim <= 18) {
      return '🌤️ Tarde';
    } else {
      return '🌙 Noite';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">Carregando reservas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl">Minhas Reservas</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gerencie suas reservas de espaços comuns
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="text-sm sm:text-base">Nova Reserva</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Reserva</DialogTitle>
              <DialogDescription>
                Reserve um espaço comum do condomínio
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="espaco">Espaço</Label>
                <Select value={espacoId} onValueChange={setEspacoId} disabled={sending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um espaço" />
                  </SelectTrigger>
                  <SelectContent>
                    {espacos.map((espaco) => (
                      <SelectItem key={espaco.id} value={espaco.id.toString()}>
                        {espaco.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  disabled={sending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="turno">Turno</Label>
                <Select value={turno} onValueChange={(value: any) => setTurno(value)} disabled={sending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manha">☀️ Manhã (06:00 - 12:00)</SelectItem>
                    <SelectItem value="tarde">🌤️ Tarde (12:00 - 18:00)</SelectItem>
                    <SelectItem value="noite">🌙 Noite (18:00 - 23:59)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
                Cancelar
              </Button>
              <Button onClick={handleReservar} disabled={sending}>
                {sending ? 'Reservando...' : 'Confirmar Reserva'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl">{reservas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Confirmadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl text-green-600">
              {reservas.filter(r => r.status === 'confirmada').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl text-yellow-600">
              {reservas.filter(r => r.status === 'pendente').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Canceladas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl text-red-600">
              {reservas.filter(r => r.status === 'cancelada').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {reservas.map((reserva) => (
          <Card key={reserva.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 w-full">
                  <CalendarDays className="h-5 w-5 text-[#1A2A80] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg break-words pr-2">{reserva.espaco_nome}</CardTitle>
                    <CardDescription className="mt-1 text-xs sm:text-sm break-words">
                      📅 {formatDate(reserva.data_inicio)} - {getTurnoLabel(reserva.data_inicio, reserva.data_fim)}
                    </CardDescription>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(reserva.status)}
                  </div>
                </div>
              </div>
            </CardHeader>
            {reserva.status !== 'cancelada' && (
              <CardContent className="pt-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancelar(reserva.id.toString())}
                  className="w-full sm:w-auto text-red-600 hover:text-red-700"
                >
                  Cancelar Reserva
                </Button>
              </CardContent>
            )}
          </Card>
        ))}

        {reservas.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Você ainda não tem reservas.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
