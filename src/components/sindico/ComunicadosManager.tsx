import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Comunicado, User } from '../../types';
import { MessageSquare, Send, Users, UserCheck, Lock, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { fetchWithAuth } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { SyncIndicator } from '../SyncIndicator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';

interface ComunicadosManagerProps {
  user: User;
}

export function ComunicadosManager({ user }: ComunicadosManagerProps) {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [destinatario, setDestinatario] = useState<string>('todos'); // 'todos' ou id do morador
  const [moradores, setMoradores] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [lastSync, setLastSync] = useState<Date | undefined>(undefined);

  useEffect(() => {
    carregarDados();
    
    // Atualizar a cada 10 segundos para sincronização em tempo real
    const interval = setInterval(carregarComunicados, 10000);
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    await Promise.all([
      carregarComunicados(),
      carregarMoradores()
    ]);
  };

  const carregarMoradores = async () => {
    try {
      const data = await fetchWithAuth('/moradores');
      setMoradores(data);
      console.log('Moradores carregados:', data.length, data);
    } catch (error: any) {
      console.error('Erro ao carregar moradores:', error);
      toast.error('Erro ao carregar lista de moradores');
    }
  };

  const carregarComunicados = async () => {
    try {
      const data = await fetchWithAuth('/comunicados');
      setComunicados(data);
      setLastSync(new Date());
    } catch (error: any) {
      console.error('Erro ao carregar comunicados:', error);
      if (loading) {
        toast.error('Erro ao carregar comunicados');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnviar = async () => {
    if (!titulo.trim() || !mensagem.trim()) {
      toast.error('Preencha todos os campos!');
      return;
    }

    setSending(true);
    try {
      const payload: any = {
        titulo,
        mensagem
      };

      // Definir destinatário
      if (destinatario === 'todos') {
        payload.enviar_para_todos = true;
      } else {
        payload.id_morador = destinatario;
        payload.enviar_para_todos = false;
      }

      await fetchWithAuth('/comunicados', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const mensagemSucesso = destinatario === 'todos' 
        ? 'Comunicado enviado para todos os moradores!' 
        : 'Comunicado enviado com sucesso!';
      
      toast.success(mensagemSucesso);
      setTitulo('');
      setMensagem('');
      setDestinatario('todos');
      setOpen(false);
      await carregarComunicados();
    } catch (error: any) {
      console.error('Erro ao enviar comunicado:', error);
      toast.error('Erro ao enviar comunicado');
    } finally {
      setSending(false);
    }
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
        <p className="text-muted-foreground">Carregando comunicados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl">Comunicados</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Envie avisos públicos ou mensagens privadas para moradores específicos
          </p>
          <SyncIndicator lastSync={lastSync} className="mt-2" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <Send className="h-4 w-4" />
              <span className="text-sm sm:text-base">Novo Comunicado</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enviar Comunicado</DialogTitle>
              <DialogDescription>
                Escolha entre enviar um aviso público para todos ou uma mensagem privada para um morador específico
              </DialogDescription>
            </DialogHeader>
            
            <Alert className="bg-blue-50 border-blue-200">
              <Lock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800">
                <strong>Comunicados Privados:</strong> Selecione um morador específico para enviar uma mensagem que só ele poderá ver. 
                Ideal para questões pessoais ou advertências individuais.
              </AlertDescription>
            </Alert>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="destinatario" className="flex items-center gap-2">
                  {destinatario === 'todos' ? (
                    <><Globe className="h-4 w-4 text-green-600" /> <span>Destinatário</span></>
                  ) : (
                    <><Lock className="h-4 w-4 text-orange-600" /> <span>Destinatário</span></>
                  )}
                </Label>
                <Select value={destinatario} onValueChange={setDestinatario} disabled={sending}>
                  <SelectTrigger className={destinatario !== 'todos' ? 'border-orange-400 bg-orange-50' : ''}>
                    <SelectValue placeholder="Selecione o destinatário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span><strong>Todos os Moradores</strong> (Comunicado Público)</span>
                      </div>
                    </SelectItem>
                    {moradores.length > 0 && (
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1">
                        Moradores (Comunicado Privado)
                      </div>
                    )}
                    {moradores.map((morador) => (
                      <SelectItem key={morador.id} value={morador.id.toString()}>
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-orange-600" />
                          <span>{morador.nome} {morador.id_unidade ? `(Unidade ${morador.id_unidade})` : ''}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {destinatario === 'todos' ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Globe className="h-3 w-3 mr-1" />
                        Público - Visível para todos
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        <Lock className="h-3 w-3 mr-1" />
                        Privado - Apenas o morador selecionado verá
                      </Badge>
                    )}
                  </div>
                  {moradores.length > 0 ? (
                    <span className="text-muted-foreground">
                      ✓ {moradores.length} morador(es) disponível(is) para envio individual
                    </span>
                  ) : (
                    <span className="text-orange-600">
                      ⚠️ Nenhum morador cadastrado. Cadastre moradores na aba "Moradores" primeiro.
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Manutenção na Piscina"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  disabled={sending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mensagem">Mensagem</Label>
                <Textarea
                  id="mensagem"
                  placeholder="Digite a mensagem do comunicado..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  rows={6}
                  disabled={sending}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
                Cancelar
              </Button>
              <Button onClick={handleEnviar} disabled={sending}>
                {sending ? 'Enviando...' : 'Enviar Comunicado'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Alert className="border-[#1A2A80] bg-[#1A2A80]/5">
        <MessageSquare className="h-4 w-4 text-[#1A2A80]" />
        <AlertDescription className="text-sm">
          <strong>Como funciona:</strong> Ao criar um comunicado, você pode escolher enviar para <strong>todos os moradores</strong> (comunicado público) 
          ou selecionar um <strong>morador específico</strong> para enviar uma mensagem privada que apenas ele verá.
          <div className="flex gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3 text-green-600" />
              <strong>Público:</strong> Todos veem
            </span>
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-orange-600" />
              <strong>Privado:</strong> Apenas um morador vê
            </span>
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{comunicados.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Comunicados enviados
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-600" />
              Públicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-700">
              {comunicados.filter(c => (c as any).destinatario_tipo === 'todos').length}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Para todos os moradores
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4 text-orange-600" />
              Privados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-700">
              {comunicados.filter(c => (c as any).destinatario_tipo === 'individual').length}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Para moradores específicos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {comunicados.map((comunicado) => {
          const isPrivado = (comunicado as any).destinatario_tipo === 'individual';
          return (
            <Card key={comunicado.id} className={isPrivado ? 'border-orange-200 bg-orange-50/20' : 'border-green-200 bg-green-50/20'}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  {isPrivado ? (
                    <Lock className="h-5 w-5 text-orange-600 mt-0.5" />
                  ) : (
                    <Globe className="h-5 w-5 text-green-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start gap-2 flex-wrap">
                      <CardTitle className="flex-1">{comunicado.titulo}</CardTitle>
                      <Badge 
                        variant="outline" 
                        className={isPrivado 
                          ? 'bg-orange-100 text-orange-700 border-orange-300' 
                          : 'bg-green-100 text-green-700 border-green-300'
                        }
                      >
                        {isPrivado ? (
                          <><Lock className="h-3 w-3 mr-1" /> PRIVADO</>
                        ) : (
                          <><Globe className="h-3 w-3 mr-1" /> PÚBLICO</>
                        )}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      Enviado por {comunicado.usuario_nome} em {formatDate(comunicado.data_envio)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`mb-3 text-xs flex items-center gap-1 px-3 py-2 rounded-md ${
                  isPrivado 
                    ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  {isPrivado ? (
                    <>
                      <UserCheck className="h-3.5 w-3.5" />
                      <span><strong>Destinatário:</strong> {(comunicado as any).destinatario_nome}</span>
                    </>
                  ) : (
                    <>
                      <Users className="h-3.5 w-3.5" />
                      <span><strong>Destinatários:</strong> Todos os Moradores</span>
                    </>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">{comunicado.mensagem}</p>
              </CardContent>
            </Card>
          );
        })}

        {comunicados.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Nenhum comunicado enviado ainda.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
