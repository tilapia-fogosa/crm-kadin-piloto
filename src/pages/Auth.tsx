
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verifica se o usuário já está autenticado
  const { data: session, isLoading: isCheckingSession } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Sessão atual:", session);
      return session;
    },
  });

  // Se já estiver autenticado, redireciona para o dashboard
  useEffect(() => {
    if (session) {
      console.log("Usuário autenticado, redirecionando para dashboard");
      navigate("/dashboard");
    }
  }, [session, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
      });
      return;
    }

    setLoading(true);
    console.log("Iniciando login para:", email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erro detalhado no login:", error);
        let errorMessage = "Email ou senha incorretos";
        
        // Mensagens de erro mais específicas se necessário
        if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email ainda não confirmado";
        }

        toast({
          variant: "destructive",
          title: "Erro no login",
          description: errorMessage,
        });
        return;
      }

      if (!data.user || !data.session) {
        console.error("Login sem dados de usuário/sessão");
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: "Erro ao obter dados do usuário",
        });
        return;
      }

      console.log("Login bem sucedido:", data);
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });

      // Força o redirecionamento após login bem-sucedido
      navigate("/dashboard", { replace: true });

    } catch (error: any) {
      console.error("Erro inesperado no login:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
      });
      return;
    }

    setLoading(true);
    console.log("Iniciando cadastro para:", email);

    try {
      // Primeiro, cria o usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error("Erro no cadastro:", authError);
        let errorMessage = "Erro ao criar conta";
        
        if (authError.message.includes("User already registered")) {
          errorMessage = "Este email já está cadastrado";
        } else if (authError.message.includes("Password")) {
          errorMessage = "A senha deve ter pelo menos 6 caracteres";
        }

        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: errorMessage,
        });
        return;
      }

      // Se o usuário foi criado com sucesso, cria o registro na tabela system_users
      if (authData.user) {
        const { error: systemUserError } = await supabase
          .from('system_users')
          .insert([
            {
              id: authData.user.id,
              email: email,
              name: email.split('@')[0], // Usa a parte do email antes do @ como nome provisório
              active: true
            }
          ]);

        if (systemUserError) {
          console.error("Erro ao criar system user:", systemUserError);
          // Não exibimos este erro para o usuário, pois o cadastro principal já foi feito
        }
      }

      console.log("Cadastro bem sucedido:", authData);
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para confirmar o cadastro.",
      });
      
      // Limpa os campos após o cadastro
      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Erro inesperado no cadastro:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Se ainda está verificando a sessão, mostra uma mensagem de carregamento
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Bem-vindo</CardTitle>
          <CardDescription className="text-center">
            Entre com sua conta para acessar o sistema
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Cadastro</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Criando conta..." : "Criar conta"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
