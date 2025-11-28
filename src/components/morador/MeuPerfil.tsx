import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { User as UserType } from '../../types';
import { 
  User, 
  Mail, 
  Phone, 
  Building2,
  Save,
  Loader2,
  Link2
} from 'lucide-react';
import { fetchWithAuth } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from '../ui/alert';

interface MeuPerfilProps {
  user: UserType;
  onUpdate: (updatedUser: UserType) => void;
}

export function MeuPerfil({ user, onUpdate }: MeuPerfilProps) {
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState(user.nome);
  const [email, setEmail] = useState(user.email);
  const [telefone, setTelefone] = useState(user.telefone || '');
  const [codigoCondominio, setCodigoCondominio] = useState('');
  const [condominioNome, setCondominioNome] = useState('');
  const [vinculandoCondominio, setVinculandoCondominio] = useState(false);

  useEffect(() => {
    // Carregar informações do condomínio se o usuário já tiver um vinculado
    if (user.id_condominio) {
      carregarCondominio();
    }
  }, [user.id_condominio]);

  const carregarCondominio = async () => {
    if (!user.id_condominio) return;

    try {
      const condominio = await fetchWithAuth(`/condominios/${user.id_condominio}`);
      setCondominioNome(condominio.nome);
    } catch (error: any) {
      console.error('Erro ao carregar condomínio:', error);
    }
  };

  const handleVincularCondominio = async () => {
    if (!codigoCondominio || codigoCondominio.trim() === '') {
      toast.error('Digite o código do condomínio');
      return;
    }

    setVinculandoCondominio(true);
    try {
      const response = await fetchWithAuth('/usuarios/vincular-condominio', {
        method: 'POST',
        body: JSON.stringify({
          codigo_condominio: codigoCondominio.trim()
        })
      });

      if (response.success && response.user) {
        toast.success('Condomínio vinculado com sucesso!');
        setCondominioNome(response.condominio.nome);
        onUpdate(response.user);
        setCodigoCondominio('');
      }
    } catch (error: any) {
      console.error('Erro ao vincular condomínio:', error);
      toast.error(error.message || 'Código de condomínio inválido');
    } finally {
      setVinculandoCondominio(false);
    }
  };

  const handleSave = async () => {
    if (!nome || nome.trim() === '') {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!email || email.trim() === '') {
      toast.error('Email é obrigatório');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email inválido');
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth('/usuarios/perfil', {
        method: 'PUT',
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim(),
          telefone: telefone.trim()
        })
      });

      if (response.success && response.user) {
        toast.success('Perfil atualizado com sucesso!');
        onUpdate(response.user);
      }
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = 
    nome !== user.nome || 
    email !== user.email || 
    telefone !== (user.telefone || '');

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl">Meu Perfil</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Atualize suas informações pessoais
        </p>
      </div>

      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
          💡 Mantenha suas informações atualizadas para facilitar a comunicação com a administração do condomínio.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Seus dados cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="pl-10"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Usado para login e comunicações oficiais
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="telefone"
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="pl-10"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Contato para emergências e avisos importantes
            </p>
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={handleSave} 
              disabled={loading || !hasChanges}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
            {!hasChanges && (
              <p className="text-xs text-muted-foreground mt-2">
                Nenhuma alteração para salvar
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-50 dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informações da Unidade
          </CardTitle>
          <CardDescription>
            Dados do seu apartamento e condomínio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Condomínio Vinculado */}
          {user.id_condominio ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-800 rounded-md border">
                <span className="text-sm">Condomínio Vinculado</span>
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                  Vinculado
                </span>
              </div>
              {condominioNome && (
                <div className="py-2 px-3 bg-white dark:bg-gray-800 rounded-md border">
                  <p className="text-xs text-muted-foreground">Nome do Condomínio</p>
                  <p className="text-sm mt-1">{condominioNome}</p>
                </div>
              )}
              <div className="py-2 px-3 bg-white dark:bg-gray-800 rounded-md border">
                <p className="text-xs text-muted-foreground">Código do Condomínio</p>
                <p className="text-sm mt-1 font-mono break-all">{user.id_condominio}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-800 rounded-md border">
                <span className="text-sm">Condomínio Vinculado</span>
                <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs">
                  Não Vinculado
                </span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo-condominio">Código do Condomínio</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="codigo-condominio"
                      type="text"
                      value={codigoCondominio}
                      onChange={(e) => setCodigoCondominio(e.target.value)}
                      placeholder="Cole o código aqui"
                      className="pl-10"
                      disabled={vinculandoCondominio}
                    />
                  </div>
                  <Button 
                    onClick={handleVincularCondominio} 
                    disabled={vinculandoCondominio || !codigoCondominio.trim()}
                    className="shrink-0"
                  >
                    {vinculandoCondominio ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Vinculando...
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4 mr-2" />
                        Vincular
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Solicite o código do condomínio ao síndico para se vincular
                </p>
              </div>
            </div>
          )}

          {/* Unidade Vinculada */}
          {user.id_unidade ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-800 rounded-md border">
                <span className="text-sm">Unidade Vinculada</span>
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                  Sim
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Para alterar sua unidade, entre em contato com o síndico
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-800 rounded-md border">
                <span className="text-sm">Unidade Vinculada</span>
                <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs">
                  Não
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Entre em contato com o síndico para vincular sua unidade
              </p>
            </div>
          )}

          {/* Tipo de Conta */}
          <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-800 rounded-md border">
            <span className="text-sm">Tipo de Conta</span>
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
              Morador
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
