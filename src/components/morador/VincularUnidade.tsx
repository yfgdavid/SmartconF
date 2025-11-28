import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Building2, Link } from 'lucide-react';
import { Unidade, User } from '../../types';
import { fetchWithAuth } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface VincularUnidadeProps {
  user: User;
  onVinculado: () => void;
}

export function VincularUnidade({ user, onVinculado }: VincularUnidadeProps) {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [idUnidade, setIdUnidade] = useState('');
  const [loading, setLoading] = useState(true);
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
      toast.error('Erro ao carregar unidades');
    } finally {
      setLoading(false);
    }
  };

  const handleVincular = async () => {
    if (!idUnidade) {
      toast.error('Selecione uma unidade');
      return;
    }

    setSending(true);
    try {
      const response = await fetchWithAuth('/me/vincular-unidade', {
        method: 'POST',
        body: JSON.stringify({ id_unidade: idUnidade })
      });

      toast.success('Unidade vinculada com sucesso!');
      
      // Atualizar o usuário no estado local
      setTimeout(() => {
        onVinculado();
      }, 500);
    } catch (error: any) {
      console.error('Erro ao vincular unidade:', error);
      toast.error(error.message || 'Erro ao vincular unidade');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-[#3B38A0]/30">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Building2 className="h-6 w-6 text-[#1A2A80] mt-1" />
          <div>
            <CardTitle>Vincular à Unidade</CardTitle>
            <CardDescription className="mt-1">
              Vincule sua conta a uma unidade para ter acesso completo ao sistema
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Para receber boletos e utilizar todas as funcionalidades, você precisa vincular sua conta a uma unidade do condomínio.
          </p>
        </div>

        {unidades.length === 0 ? (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Nenhuma unidade disponível. Aguarde o síndico cadastrar as unidades do condomínio.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="unidade">Selecione sua Unidade</Label>
              <Select value={idUnidade} onValueChange={setIdUnidade} disabled={sending}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha sua unidade" />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map((unidade) => (
                    <SelectItem key={unidade.id} value={unidade.id.toString()}>
                      Bloco {unidade.bloco} - Apto {unidade.numero} ({unidade.area_m2}m²)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleVincular}
              disabled={sending || !idUnidade}
              className="w-full"
            >
              {sending ? (
                'Vinculando...'
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  Vincular à Unidade
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
