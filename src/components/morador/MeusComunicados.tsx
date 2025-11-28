import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Comunicado } from '../../types';
import { MessageSquare } from 'lucide-react';
import { fetchWithAuth } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export function MeusComunicados() {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarComunicados();
    
    // Atualizar a cada 10 segundos para sincronização em tempo real
    const interval = setInterval(carregarComunicados, 10000);
    return () => clearInterval(interval);
  }, []);

  const carregarComunicados = async () => {
    try {
      const data = await fetchWithAuth('/comunicados');
      setComunicados(data);
    } catch (error: any) {
      console.error('Erro ao carregar comunicados:', error);
      if (loading) {
        toast.error('Erro ao carregar comunicados');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Resetar horas para comparar apenas as datas
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = nowOnly.getTime() - dateOnly.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `Há ${diffDays} dias`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">Carregando comunicados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl">Comunicados</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Avisos e informações importantes do condomínio
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Total de Comunicados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl">{comunicados.length}</div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Últimos avisos da administração
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3 sm:space-y-4">
        {comunicados.map((comunicado) => (
          <Card key={comunicado.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3 w-full">
                <MessageSquare className="h-5 w-5 text-[#1A2A80] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg break-words">{comunicado.titulo}</CardTitle>
                  <CardDescription className="mt-1 text-xs sm:text-sm break-words">
                    Enviado por {comunicado.usuario_nome} • {formatDate(comunicado.data_envio)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">{comunicado.mensagem}</p>
            </CardContent>
          </Card>
        ))}

        {comunicados.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Nenhum comunicado disponível no momento.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
