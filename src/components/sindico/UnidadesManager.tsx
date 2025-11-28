import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Unidade } from '../../types';
import { Home, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { fetchWithAuth } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export function UnidadesManager() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [bloco, setBloco] = useState('');
  const [numero, setNumero] = useState('');
  const [andar, setAndar] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    carregarUnidades();
  }, []);

  const carregarUnidades = async () => {
    try {
      const data = await fetchWithAuth('/unidades');
      setUnidades(data);
    } catch (error: any) {
      console.error('Erro ao carregar unidades:', error);
      if (loading) {
        toast.error('Erro ao carregar unidades');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCriar = async () => {
    if (!bloco.trim() || !numero.trim() || !andar) {
      toast.error('Preencha todos os campos!');
      return;
    }

    setSending(true);
    try {
      await fetchWithAuth('/unidades', {
        method: 'POST',
        body: JSON.stringify({
          bloco,
          numero,
          andar: parseInt(andar)
        })
      });

      toast.success('Unidade cadastrada com sucesso!');
      setBloco('');
      setNumero('');
      setAndar('');
      setOpen(false);
      await carregarUnidades();
    } catch (error: any) {
      console.error('Erro ao cadastrar unidade:', error);
      toast.error('Erro ao cadastrar unidade');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">Carregando unidades...</p>
      </div>
    );
  }

  // Agrupar unidades por bloco
  const unidadesPorBloco = unidades.reduce((acc, unidade) => {
    if (!acc[unidade.bloco]) {
      acc[unidade.bloco] = [];
    }
    acc[unidade.bloco].push(unidade);
    return acc;
  }, {} as Record<string, Unidade[]>);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl">Unidades Habitacionais</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gerencie as unidades do condomínio
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="text-sm sm:text-base">Nova Unidade</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Unidade</DialogTitle>
              <DialogDescription>
                Adicione uma nova unidade habitacional
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bloco">Bloco</Label>
                <Input
                  id="bloco"
                  placeholder="Ex: A"
                  value={bloco}
                  onChange={(e) => setBloco(e.target.value)}
                  disabled={sending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  placeholder="Ex: 101"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  disabled={sending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="andar">Andar</Label>
                <Input
                  id="andar"
                  type="number"
                  placeholder="Ex: 1"
                  value={andar}
                  onChange={(e) => setAndar(e.target.value)}
                  disabled={sending}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
                Cancelar
              </Button>
              <Button onClick={handleCriar} disabled={sending}>
                {sending ? 'Salvando...' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total de Unidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{unidades.length}</div>
          <p className="text-sm text-muted-foreground mt-1">
            Distribuídas em {Object.keys(unidadesPorBloco).length} bloco(s)
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {Object.entries(unidadesPorBloco).map(([blocoNome, unidadesDoBloco]) => (
          <div key={blocoNome}>
            <h3 className="text-lg mb-3">Bloco {blocoNome}</h3>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {unidadesDoBloco.map((unidade) => (
                <Card key={unidade.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-[#1A2A80]" />
                      <CardTitle className="text-sm">Apto {unidade.numero}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {unidade.andar}º Andar
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {unidades.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Nenhuma unidade cadastrada ainda.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
