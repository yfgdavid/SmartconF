import { useState, useEffect } from 'react';
import { User } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Building2, 
  AlertCircle, 
  CalendarDays, 
  MessageSquare, 
  DollarSign,
  FileText,
  Users,
  LogOut,
  Home,
  Moon,
  Sun
} from 'lucide-react';
import { Badge } from './ui/badge';
import { OcorrenciasManager } from './sindico/OcorrenciasManager';
import { EspacosManager } from './sindico/EspacosManager';
import { ComunicadosManager } from './sindico/ComunicadosManager';
import { FinanceiroManager } from './sindico/FinanceiroManager';
import { BoletosManager } from './sindico/BoletosManager';
import { UnidadesManager } from './sindico/UnidadesManager';
import { MoradoresManager } from './sindico/MoradoresManager';
import { CondominioInfo } from './sindico/CondominioInfo';
import { ResponsiveLogo } from './ResponsiveLogo';
import { fetchWithAuth } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { useTheme } from '../utils/ThemeContext';

interface DashboardSindicoProps {
  user: User;
  onLogout: () => void;
}

interface DashboardStats {
  ocorrenciasAbertas: number;
  ocorrenciasPendentes: number;
  reservasMes: number;
  reservasPendentes: number;
  totalUnidades: number;
  unidadesOcupadas: number;
  ultimasOcorrencias: any[];
  proximasReservas: any[];
}

export function DashboardSindico({ user, onLogout }: DashboardSindicoProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    ocorrenciasAbertas: 0,
    ocorrenciasPendentes: 0,
    reservasMes: 0,
    reservasPendentes: 0,
    totalUnidades: 0,
    unidadesOcupadas: 0,
    ultimasOcorrencias: [],
    proximasReservas: []
  });
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    carregarStats();
    
    // Atualizar stats a cada 10 segundos
    const interval = setInterval(carregarStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const carregarStats = async () => {
    try {
      const [ocorrenciasData, reservasData, unidadesData] = await Promise.all([
        fetchWithAuth('/ocorrencias'),
        fetchWithAuth('/reservas'),
        fetchWithAuth('/unidades')
      ]);

      // Ocorrências
      const ocorrenciasAbertas = ocorrenciasData.filter(
        (o: any) => o.status !== 'resolvida'
      ).length;
      const ocorrenciasPendentes = ocorrenciasData.filter(
        (o: any) => o.status === 'pendente'
      ).length;

      // Reservas do mês atual
      const mesAtual = new Date().getMonth();
      const anoAtual = new Date().getFullYear();
      const reservasMes = reservasData.filter((r: any) => {
        const dataReserva = new Date(r.data_inicio);
        return dataReserva.getMonth() === mesAtual && dataReserva.getFullYear() === anoAtual;
      }).length;
      const reservasPendentes = reservasData.filter(
        (r: any) => r.status === 'pendente'
      ).length;

      // Unidades
      const totalUnidades = unidadesData.length;
      const unidadesOcupadas = totalUnidades;

      // Últimas 3 ocorrências
      const ultimasOcorrencias = ocorrenciasData
        .sort((a: any, b: any) => new Date(b.data_registro || b.created_at).getTime() - new Date(a.data_registro || a.created_at).getTime())
        .slice(0, 3);

      // Próximas 3 reservas confirmadas
      const proximasReservas = reservasData
        .filter((r: any) => r.status === 'confirmada' && new Date(r.data_inicio) > new Date())
        .sort((a: any, b: any) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime())
        .slice(0, 3);

      setStats({
        ocorrenciasAbertas,
        ocorrenciasPendentes,
        reservasMes,
        reservasPendentes,
        totalUnidades,
        unidadesOcupadas,
        ultimasOcorrencias,
        proximasReservas
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 sm:h-22 md:h-24">
            <div className="flex items-center gap-2 sm:gap-3">
              <ResponsiveLogo className="h-14 sm:h-16 md:h-20" />
              <div className="hidden md:block">
                <span className="text-sm text-muted-foreground">Painel do Síndico</span>
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-6 sm:mb-8 h-auto gap-1">
            <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3">
              <Home className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm">Início</span>
            </TabsTrigger>
            <TabsTrigger value="condominio" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm">Cond.</span>
            </TabsTrigger>
            <TabsTrigger value="moradores" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm">Morad.</span>
            </TabsTrigger>
            <TabsTrigger value="ocorrencias" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm">Ocorr.</span>
            </TabsTrigger>
            <TabsTrigger value="espacos" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3">
              <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm lg:hidden">Espaços</span>
              <span className="hidden lg:inline">Espaços</span>
            </TabsTrigger>
            <TabsTrigger value="comunicados" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 col-span-1">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm">Comun.</span>
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm">Finanças</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <div className="space-y-4 sm:space-y-6">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl break-words">Dashboard Geral</h2>
                <p className="text-sm text-muted-foreground mt-1 break-words">Visão geral das atividades do condomínio</p>
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
                  <Card className="bg-gradient-to-br from-[#1A2A80] to-[#3B38A0] text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm">Ocorrências Abertas</CardTitle>
                      <AlertCircle className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl">{stats.ocorrenciasAbertas}</div>
                      <p className="text-xs text-white/80 mt-1">
                        {stats.ocorrenciasPendentes > 0 
                          ? `${stats.ocorrenciasPendentes} pendente${stats.ocorrenciasPendentes > 1 ? 's' : ''}`
                          : 'Nenhuma pendente'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-[#3B38A0] to-[#7A85C1] text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm">Reservas do Mês</CardTitle>
                      <CalendarDays className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl">{stats.reservasMes}</div>
                      <p className="text-xs text-white/80 mt-1">
                        {stats.reservasPendentes > 0 
                          ? `${stats.reservasPendentes} aguardando`
                          : 'Todas confirmadas'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-[#7A85C1] to-[#B2B0E8] text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm">Total de Unidades</CardTitle>
                      <Users className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl">{stats.totalUnidades}</div>
                      <p className="text-xs text-white/80 mt-1">
                        {stats.totalUnidades > 0 
                          ? `${stats.unidadesOcupadas} unidade${stats.unidadesOcupadas > 1 ? 's' : ''} cadastrada${stats.unidadesOcupadas > 1 ? 's' : ''}`
                          : 'Cadastre as unidades'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {!loading && stats.reservasPendentes > 0 && (
                <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg text-yellow-900 flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      Reservas Aguardando Aprovação
                    </CardTitle>
                    <CardDescription className="text-yellow-800">
                      {stats.reservasPendentes} reserva{stats.reservasPendentes > 1 ? 's' : ''} aguardando sua aprovação ou rejeição
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => setActiveTab('espacos')}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Revisar Reservas
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg break-words">Últimas Ocorrências</CardTitle>
                    <CardDescription className="text-xs sm:text-sm break-words">Problemas reportados recentemente</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.ultimasOcorrencias.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                          Nenhuma ocorrência ainda
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stats.ultimasOcorrencias.map((ocorrencia: any) => (
                          <div key={ocorrencia.id} className="pb-3 border-b last:border-0 last:pb-0">
                            <h4 className="text-sm break-words line-clamp-1">{ocorrencia.titulo}</h4>
                            <p className="text-xs text-muted-foreground mt-1 break-words line-clamp-2">
                              {ocorrencia.descricao}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={
                                ocorrencia.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                                ocorrencia.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {ocorrencia.status === 'pendente' ? 'Pendente' :
                                 ocorrencia.status === 'em_andamento' ? 'Em Andamento' :
                                 'Resolvida'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(ocorrencia.data_registro || ocorrencia.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setActiveTab('ocorrencias')} 
                          className="w-full mt-2"
                        >
                          Ver Todas
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg break-words">Próximas Reservas</CardTitle>
                    <CardDescription className="text-xs sm:text-sm break-words">Agendamentos confirmados</CardDescription>
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
                              Por {reserva.usuario_nome}
                            </p>
                            <p className="text-xs text-muted-foreground">
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
                          onClick={() => setActiveTab('espacos')} 
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

          <TabsContent value="condominio">
            <div className="space-y-6">
              <CondominioInfo user={user} />
              <UnidadesManager />
            </div>
          </TabsContent>

          <TabsContent value="moradores">
            <MoradoresManager />
          </TabsContent>

          <TabsContent value="ocorrencias">
            <OcorrenciasManager />
          </TabsContent>

          <TabsContent value="espacos">
            <EspacosManager />
          </TabsContent>

          <TabsContent value="comunicados">
            <ComunicadosManager user={user} />
          </TabsContent>

          <TabsContent value="financeiro">
            <div className="space-y-8">
              <FinanceiroManager />
              <div className="border-t border-border"></div>
              <BoletosManager />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
