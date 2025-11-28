import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Building2, Edit, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { User } from '../../types';
import { fetchWithAuth } from '../../utils/supabase/client';
import { copyToClipboard } from '../../utils/clipboard';
import { toast } from 'sonner@2.0.3';

interface CondominioInfoProps {
  user: User;
}

export function CondominioInfo({ user }: CondominioInfoProps) {
  const [condominio, setCondominio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    carregarCondominio();
  }, [user.id_condominio]);

  const carregarCondominio = async () => {
    if (!user.id_condominio) {
      setLoading(false);
      return;
    }

    try {
      const data = await fetchWithAuth(`/condominios/${user.id_condominio}`);
      setCondominio(data);
      setNome(data.nome || '');
      setCnpj(data.cnpj || '');
      setEndereco(data.endereco || '');
      setCidade(data.cidade || '');
      setEstado(data.estado || '');
      setCep(data.cep || '');
    } catch (error: any) {
      console.error('Erro ao carregar condomínio:', error);
      toast.error('Erro ao carregar informações do condomínio');
    } finally {
      setLoading(false);
    }
  };

  const handleAtualizar = async () => {
    if (!nome.trim()) {
      toast.error('O nome do condomínio é obrigatório');
      return;
    }

    setSending(true);
    try {
      await fetchWithAuth(`/condominios/${user.id_condominio}`, {
        method: 'PATCH',
        body: JSON.stringify({
          nome,
          cnpj,
          endereco,
          cidade,
          estado,
          cep
        })
      });

      toast.success('Informações atualizadas com sucesso!');
      setOpen(false);
      await carregarCondominio();
    } catch (error: any) {
      console.error('Erro ao atualizar condomínio:', error);
      toast.error('Erro ao atualizar informações');
    } finally {
      setSending(false);
    }
  };

  const handleCopiarId = async () => {
    if (user.id_condominio) {
      const success = await copyToClipboard(user.id_condominio);
      
      if (success) {
        setCopied(true);
        toast.success('ID do condomínio copiado!');
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.error('Não foi possível copiar automaticamente');
        // Mostrar o ID em um alert para copiar manualmente
        alert('ID do Condomínio:\n\n' + user.id_condominio + '\n\nCopie manualmente');
      }
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

  if (!condominio) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Nenhum condomínio vinculado a este usuário.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Building2 className="h-6 w-6 text-[#1A2A80] mt-1" />
            <div>
              <CardTitle>{condominio.nome}</CardTitle>
              <CardDescription className="mt-1">
                Informações do condomínio
              </CardDescription>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Informações do Condomínio</DialogTitle>
                <DialogDescription>
                  Atualize os dados do condomínio
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Condomínio</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={sending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    disabled={sending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    disabled={sending}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      disabled={sending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      disabled={sending}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    disabled={sending}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
                  Cancelar
                </Button>
                <Button onClick={handleAtualizar} disabled={sending}>
                  {sending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ID do Condomínio - Destaque */}
        <div className="p-4 bg-gradient-to-r from-[#1A2A80]/10 to-[#3B38A0]/10 rounded-lg border-2 border-[#3B38A0]/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-[#1A2A80] mb-1">🆔 ID do Condomínio</p>
              <p className="text-lg font-mono font-semibold break-all">{user.id_condominio}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Compartilhe este ID com os moradores para que eles possam se cadastrar
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopiarId}
              className="flex-shrink-0 w-full sm:w-auto"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">CNPJ</p>
            <p>{condominio.cnpj || 'Não informado'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">CEP</p>
            <p>{condominio.cep || 'Não informado'}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Endereço</p>
          <p>{condominio.endereco || 'Não informado'}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Cidade</p>
            <p>{condominio.cidade || 'Não informado'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estado</p>
            <p>{condominio.estado || 'Não informado'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
