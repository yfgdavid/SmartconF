import { useState, useEffect } from 'react';
import { User } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  AlertCircle, 
  CalendarDays, 
  MessageSquare,
  FileText,
  LogOut,
  Home,
  UserCircle,
  Moon,
  Sun
} from 'lucide-react';
import { MinhasOcorrencias } from './morador/MinhasOcorrencias';
import { MinhasReservas } from './morador/MinhasReservas';
import { MeusComunicados } from './morador/MeusComunicados';
import { MeusBoletos } from './morador/MeusBoletos';
import { VincularUnidade } from './morador/VincularUnidade';
import { MeuPerfil } from './morador/MeuPerfil';
import { ResponsiveLogo } from './ResponsiveLogo';
import { fetchWithAuth } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { useTheme } from '../utils/ThemeContext';

interface DashboardMoradorProps {
  user: User;
  onLogout: () => void;
  onUserUpdate?: (user: User) => void;
}

interface DashboardStats {
  ocorrencias: number;
  ocorrenciasPendentes: number;
  reservas: number;
  reservasPendentes: number;
  proximaReserva: string | null;
  comunicados: number;
  comunicadosNaoLidos: number;
  ultimosComunicados: any[];
  proximasReservas: any[];
}

export function DashboardMorador({ user, onLogout, onUserUpdate }: DashboardMoradorProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    ocorrencias: 0,
    ocorrenciasPendentes: 0,
    reservas: 0,
    reservasPendentes: 0,
    proximaReserva: null,
    comunicados: 0,
    comunicadosNaoLidos: 0,
    ultimosComunicados: [],
    proximasReservas: []
  });
  const [loading, setLoading] = useState(true);
  const [needsUnidade, setNeedsUnidade] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Verificar se o usuário tem unidade vinculada
    // Por enquanto, permitir continuar sem unidade vinculada
    const hasUnidade = user.id_unidade || localStorage.getItem('temp_id_unidade');
    setNeedsUnidade(false); // Temporariamente desabilitar a exigência de unidade
    
    carregarStats();
    
    // Atualizar stats a cada 10 segundos
    const interval = setInterval(carregarStats, 10000);
    return () => clearInterval(interval);
  }, [user.id_unidade]);

  const carregarStats = async () => {
    try {
      const [ocorrenciasData, reservasData, comunicadosData] = await Promise.all([
        fetchWithAuth('/ocorrencias'),
        fetchWithAuth('/reservas'),
        fetchWithAuth('/comunicados')
      ]);

      // Calcular estatísticas
      const ocorrenciasPendentes = ocorrenciasData.filter(
        (o: any) => o.status === 'pendente' || o.status === 'em_andamento'
      ).length;

      const reservasAtivas = reservasData.filter(
        (r: any) => r.status !== 'cancelada'
      );

      const reservasPendentes = reservasData.filter(
        (r: any) => r.status === 'pendente'
      ).length;

      // Encontrar próxima reserva
      const proximasReservas = reservasAtivas
        .filter((r: any) => new Date(r.data_inicio) > new Date())
        .sort((a: any, b: any) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime());
      
      const proximaReserva = proximasReservas.length > 0 
        ? new Date(proximasReservas[0].data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        : null;

      // Últimos 3 comunicados
      const ultimosComunicados = comunicadosData
        .sort((a: any, b: any) => new Date(b.data_envio).getTime() - new Date(a.data_envio).getTime())
        .slice(0, 3);

      // Próximas 3 reservas confirmadas
      const proximasReservasLista = reservasAtivas
        .filter((r: any) => r.status === 'confirmada' && new Date(r.data_inicio) > new Date())
        .sort((a: any, b: any) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime())
        .slice(0, 3);

      setStats({
        ocorrencias: ocorrenciasData.length,
        ocorrenciasPendentes,
        reservas: reservasAtivas.length,
        reservasPendentes,
        proximaReserva,
        comunicados: comunicadosData.length,
        comunicadosNaoLidos: 0, // Pode implementar lógica de "lidos" posteriormente
        ultimosComunicados,
        proximasReservas: proximasReservasLista
      });
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error);
      if (loading) {
        toast.error('Erro ao carregar dados');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVinculado = () => {
    // Recarregar a página para atualizar o user com a unidade vinculada
    window.location.reload();
  };

  const handleUserUpdate = (updatedUser: User) => {
    // Propagar a atualização para o componente pai, se houver callback
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 sm:h-22 md:h-24">
            <div className="flex items-center gap-2 sm:gap-3">
              <ResponsiveLogo className="h-14 sm:h-16 md:h-20" />
              <div className="hidden md:block">
                <span className="text-sm text-muted-foreground">Painel do Morador</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right hidden lg:block">
                <p className="text-sm">{user.nome}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme} 
                className="h-8 w-8 sm:h-10 sm:w-10"
                title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={onLogout} className="h-8 w-8 sm:h-10 sm:w-10">
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {needsUnidade ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl">Bem-vindo, {user.nome.split(' ')[0]}!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Para começar a usar o sistema, vincule sua conta a uma unidade
              </p>
            </div>
            <VincularUnidade user={user} onVinculado={handleVinculado} />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 mb-6 sm:mb-8 h-auto gap-1">
              <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3">
                <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">Início</span>
              </TabsTrigger>
              <TabsTrigger value="ocorrencias" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">Ocorr.</span>
              </TabsTrigger>
              <TabsTrigger value="reservas" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">Reservas</span>
              </TabsTrigger>
              <TabsTrigger value="comunicados" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">Comun.</span>
              </TabsTrigger>
              <TabsTrigger value="boletos" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">Boletos</span>
              </TabsTrigger>
              <TabsTrigger value="perfil" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3">
                <UserCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">Perfil</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <div className="space-y-4 sm:space-y-6">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl break-words">Bem-vindo, {user.nome.split(' ')[0]}!</h2>
                  <p className="text-sm text-muted-foreground mt-1 break-words">
                    Aqui você pode gerenciar sua unidade, reservar espaços e acompanhar comunicados.
                  </p>
                </div>



                {loading ? (
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-8 bg-muted rounded w-1/2"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="bg-gradient-to-br from-[#1A2A80] to-[#3B38A0] text-white cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setActiveTab('ocorrencias')}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm">Minhas Ocorrências</CardTitle>
                        <AlertCircle className="h-4 w-4" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl">{stats.ocorrencias}</div>
                        <p className="text-xs text-white/80 mt-1">
                          {stats.ocorrenciasPendentes > 0 
                            ? `${stats.ocorrenciasPendentes} pendente${stats.ocorrenciasPendentes > 1 ? 's' : ''}`
                            : 'Todas resolvidas'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-[#3B38A0] to-[#7A85C1] text-white cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setActiveTab('reservas')}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm">Minhas Reservas</CardTitle>
                        <CalendarDays className="h-4 w-4" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl">{stats.reservas}</div>
                        <p className="text-xs text-white/80 mt-1">
                          {stats.reservasPendentes > 0 
                            ? `${stats.reservasPendentes} aguardando aprovação`
                            : stats.proximaReserva 
                              ? `Próxima: ${stats.proximaReserva}` 
                              : 'Nenhuma agendada'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-[#7A85C1] to-[#B2B0E8] text-white cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setActiveTab('comunicados')}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm">Comunicados</CardTitle>
                        <MessageSquare className="h-4 w-4" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl">{stats.comunicados}</div>
                        <p className="text-xs text-white/80 mt-1">
                          {stats.comunicados > 0 ? 'Avisos importantes' : 'Nenhum comunicado'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
                  <Card className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg break-words">Últimos Comunicados</CardTitle>
                      <CardDescription className="text-xs sm:text-sm break-words">Avisos importantes do condomínio</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats.ultimosComunicados.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">
                            Nenhum comunicado ainda
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {stats.ultimosComunicados.map((comunicado: any) => (
                            <div key={comunicado.id} className="pb-3 border-b last:border-0 last:pb-0">
                              <h4 className="text-sm break-words line-clamp-1">{comunicado.titulo}</h4>
                              <p className="text-xs text-muted-foreground mt-1 break-words line-clamp-2">
                                {comunicado.mensagem}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(comunicado.data_envio).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          ))}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setActiveTab('comunicados')} 
                            className="w-full mt-2"
                          >
                            Ver Todos
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg break-words">Próximas Reservas</CardTitle>
                      <CardDescription className="text-xs sm:text-sm break-words">Seus agendamentos confirmados</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats.proximasReservas.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">
                            Nenhuma reserva confirmada
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {stats.proximasReservas.map((reserva: any) => (
                            <div key={reserva.id} className="pb-3 border-b last:border-0 last:pb-0">
                              <h4 className="text-sm break-words">{reserva.espaco_nome}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                📅 {new Date(reserva.data_inicio).toLocaleString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              <Badge className="mt-1 bg-green-100 text-green-800 text-xs">Confirmada</Badge>
                            </div>
                          ))}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setActiveTab('reservas')} 
                            className="w-full mt-2"
                          >
                            Ver Todas
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ocorrencias">
              <MinhasOcorrencias user={user} />
            </TabsContent>

            <TabsContent value="reservas">
              <MinhasReservas user={user} />
            </TabsContent>

            <TabsContent value="comunicados">
              <MeusComunicados />
            </TabsContent>

            <TabsContent value="boletos">
              <MeusBoletos />
            </TabsContent>

            <TabsContent value="perfil">
              <MeuPerfil user={user} onUpdate={handleUserUpdate} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}