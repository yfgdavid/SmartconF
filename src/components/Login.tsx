import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { User, UserRole } from '../types';
import { ResponsiveLogo } from './ResponsiveLogo';
import { createClient, fetchWithAuth, fetchPublic } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { KeyRound } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [userType, setUserType] = useState<UserRole>('morador');
  const [loading, setLoading] = useState(false);
  const [idCondominio, setIdCondominio] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      
      // Fazer login com Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        toast.error('Erro ao fazer login: ' + error.message);
        setLoading(false);
        return;
      }

      // Buscar dados completos do usuário
      const userData = await fetchWithAuth('/me');
      
      // Converter para o formato User esperado
      const user: User = {
        id: userData.id,
        nome: userData.nome,
        email: userData.email,
        telefone: userData.telefone,
        role: userData.role,
        id_condominio: userData.id_condominio,
        id_unidade: userData.id_unidade
      };

      toast.success('Login realizado com sucesso!');
      onLogin(user);
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações no frontend
    if (senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      console.log('Iniciando cadastro...', { email, nome, tipo_usuario: userType });
      
      // Cadastrar usuário no backend usando fetchPublic
      const data = await fetchPublic('/signup', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password: senha,
          nome,
          telefone,
          tipo_usuario: userType,
          id_condominio: idCondominio || null
        }),
      });

      console.log('Resposta do servidor:', data);
      toast.success('Cadastro realizado com sucesso! Faça login para continuar.');
      
      // Limpar formulário e mudar para aba de login
      setNome('');
      setTelefone('');
      setIdCondominio('');
      setSenha('');
      setEmail('');
      setIsLogin(true);
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast.error(error.message || 'Erro ao realizar cadastro. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error('Digite seu e-mail');
      return;
    }

    setResetLoading(true);

    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error('Erro ao enviar e-mail: ' + error.message);
        return;
      }

      toast.success('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Erro ao solicitar recuperação:', error);
      toast.error('Erro ao enviar e-mail de recuperação');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A2A80] via-[#3B38A0] to-[#7A85C1] p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <ResponsiveLogo className="h-20 sm:h-24 md:h-28" />
          </div>
          <CardTitle className="text-center">Bem-vindo ao Smartcon</CardTitle>
          <CardDescription className="text-center">
            Sistema de gestão condominial inteligente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? 'login' : 'cadastro'} onValueChange={(v) => setIsLogin(v === 'login')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">E-mail</Label>
                  <Input
                    id="email-login"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha-login">Senha</Label>
                  <Input
                    id="senha-login"
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                    disabled={loading}
                  >
                    Esqueci minha senha
                  </button>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="cadastro">
              <form onSubmit={handleCadastro} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-cadastro">E-mail</Label>
                  <Input
                    id="email-cadastro"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha-cadastro">Senha</Label>
                  <Input
                    id="senha-cadastro"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    className={senha && senha.length < 6 && senha.length > 0 ? 'border-red-500' : ''}
                  />
                  {senha && senha.length < 6 && senha.length > 0 && (
                    <p className="text-xs text-red-600">A senha deve ter pelo menos 6 caracteres</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id-condominio">ID do Condomínio (opcional)</Label>
                  <Input
                    id="id-condominio"
                    type="text"
                    placeholder="Deixe em branco para criar novo condomínio"
                    value={idCondominio}
                    onChange={(e) => setIdCondominio(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Síndicos podem criar um novo condomínio após o cadastro
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Usuário</Label>
                  <Tabs value={userType} onValueChange={(v) => setUserType(v as UserRole)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="morador" disabled={loading}>Morador</TabsTrigger>
                      <TabsTrigger value="sindico" disabled={loading}>Síndico</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Cadastrando...' : 'Realizar Cadastro'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de Recuperação de Senha */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <KeyRound className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle>Recuperar Senha</DialogTitle>
            </div>
            <DialogDescription>
              Digite seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">E-mail</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="seu@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                disabled={resetLoading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enviaremos instruções para este e-mail
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail('');
                }}
                disabled={resetLoading}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={resetLoading}
                className="w-full sm:w-auto"
              >
                {resetLoading ? 'Enviando...' : 'Enviar Link'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
