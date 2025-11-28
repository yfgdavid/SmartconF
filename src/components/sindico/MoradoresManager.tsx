import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Users, 
  UserPlus, 
  Building2, 
  Mail, 
  Phone, 
  Link as LinkIcon,
  Unlink
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { fetchWithAuth } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface Morador {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  id_unidade: string | null;
  unidade_info?: string;
}

interface Unidade {
  id: string;
  bloco: string;
  numero: string;
  area_m2: number;
}

export function MoradoresManager() {
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [openVincular, setOpenVincular] = useState(false);
  const [openDesvincular, setOpenDesvincular] = useState(false);
  const [moradorSelecionado, setMoradorSelecionado] = useState<string>('');
  const [moradorParaDesvincular, setMoradorParaDesvincular] = useState<Morador | null>(null);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<string>('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    carregarDados();
    
    // Atualizar a cada 10 segundos
    const interval = setInterval(carregarDados, 10000);
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      // Buscar moradores do backend
      const moradoresData = await fetchWithAuth('/moradores');
      const unidadesData = await fetchWithAuth('/unidades');
      
      // Adicionar info da unidade a cada morador
      const moradoresComUnidade = moradoresData.map((m: any) => {
        if (m.id_unidade) {
          const unidade = unidadesData.find((u: any) => u.id === m.id_unidade);
          if (unidade) {
            return {
              ...m,
              unidade_info: `Bloco ${unidade.bloco} - Apto ${unidade.numero}`
            };
          }
        }
        return m;
      });

      setMoradores(moradoresComUnidade);
      setUnidades(unidadesData);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      if (loading) {
        toast.error('Erro ao carregar dados');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVincular = async () => {
    if (!moradorSelecionado || !unidadeSelecionada) {
      toast.error('Selecione um morador e uma unidade');
      return;
    }

    setSending(true);
    try {
      await fetchWithAuth('/moradores/vincular-unidade', {
        method: 'POST',
        body: JSON.stringify({
          id_morador: moradorSelecionado,
          id_unidade: unidadeSelecionada
        })
      });

      toast.success('Morador vinculado à unidade com sucesso!');
      setMoradorSelecionado('');
      setUnidadeSelecionada('');
      setOpenVincular(false);
      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao vincular morador:', error);
      toast.error(error.message || 'Erro ao vincular morador');
    } finally {
      setSending(false);
    }
  };

  const handleDesvincular = async (idMorador: string) => {
    if (!confirm('Tem certeza que deseja desvincular este morador da unidade?')) {
      return;
    }

    try {
      await fetchWithAuth('/moradores/desvincular-unidade', {
        method: 'POST',
        body: JSON.stringify({ id_morador: idMorador })
      });

      toast.success('Morador desvinculado da unidade!');
      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao desvincular morador:', error);
      toast.error('Erro ao desvincular morador');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">Carregando moradores...</p>
      </div>
    );
  }

  const moradoresSemUnidade = moradores.filter(m => !m.id_unidade);
  const moradoresComUnidade = moradores.filter(m => m.id_unidade);
  const unidadesDisponiveis = unidades.filter(u => 
    !moradores.some(m => m.id_unidade === u.id)
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl">Gerenciar Moradores</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Vincule moradores às suas unidades
          </p>
        </div>
        <Dialog open={openVincular} onOpenChange={setOpenVincular}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <LinkIcon className="h-4 w-4" />
              <span className="text-sm sm:text-base">Vincular Morador</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vincular Morador à Unidade</DialogTitle>
              <DialogDescription>
                Associe um morador cadastrado a uma unidade do condomínio
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="morador">Morador</Label>
                <Select value={moradorSelecionado} onValueChange={setMoradorSelecionado} disabled={sending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um morador" />
                  </SelectTrigger>
                  <SelectContent>
                    {moradoresSemUnidade.map((morador) => (
                      <SelectItem key={morador.id} value={morador.id}>
                        {morador.nome} ({morador.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {moradoresSemUnidade.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Todos os moradores já estão vinculados a unidades
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade</Label>
                <Select value={unidadeSelecionada} onValueChange={setUnidadeSelecionada} disabled={sending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesDisponiveis.map((unidade) => (
                      <SelectItem key={unidade.id} value={unidade.id}>
                        Bloco {unidade.bloco} - Apto {unidade.numero} ({unidade.area_m2}m²)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {unidadesDisponiveis.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Todas as unidades já têm moradores vinculados
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenVincular(false)} disabled={sending}>
                Cancelar
              </Button>
              <Button onClick={handleVincular} disabled={sending || !moradorSelecionado || !unidadeSelecionada}>
                {sending ? 'Vinculando...' : 'Vincular'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Total de Moradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl">{moradores.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Com Unidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl text-green-600">
              {moradoresComUnidade.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Sem Unidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl text-yellow-600">
              {moradoresSemUnidade.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Unidades Livres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl text-blue-600">
              {unidadesDisponiveis.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {moradoresSemUnidade.length > 0 && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg text-yellow-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Moradores Sem Unidade Vinculada
            </CardTitle>
            <CardDescription className="text-yellow-800">
              {moradoresSemUnidade.length} morador{moradoresSemUnidade.length > 1 ? 'es' : ''} aguardando vinculação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setOpenVincular(true)}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Vincular Moradores
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-lg sm:text-xl">Todos os Moradores</h3>
        {moradores.map((morador) => (
          <Card key={morador.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 w-full">
                  <Users className="h-5 w-5 text-[#1A2A80] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg break-words pr-2">{morador.nome}</CardTitle>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="break-all">{morador.email}</span>
                      </div>
                      {morador.telefone && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{morador.telefone}</span>
                        </div>
                      )}
                      {morador.id_unidade ? (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4 flex-shrink-0" />
                          <span>{morador.unidade_info}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Sem unidade vinculada
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {morador.id_unidade ? (
                      <Badge className="bg-green-100 text-green-800">
                        Vinculado
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">
                        Não vinculado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            {morador.id_unidade && (
              <CardContent className="pt-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDesvincular(morador.id)}
                  className="w-full sm:w-auto text-red-600 hover:text-red-700"
                >
                  <Unlink className="h-4 w-4 mr-2" />
                  Desvincular
                </Button>
              </CardContent>
            )}
          </Card>
        ))}

        {moradores.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Nenhum morador cadastrado ainda.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}