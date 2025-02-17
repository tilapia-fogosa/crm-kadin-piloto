
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  toast: any;
  navigate: (path: string, options?: { replace?: boolean }) => void;
}

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  setLoading,
  toast,
  navigate,
}: LoginFormProps) {
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

  return (
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
  );
}
