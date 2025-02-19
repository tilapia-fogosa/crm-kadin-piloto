
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, User, Lock } from "lucide-react";

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
  const [loginMessage, setLoginMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMessage(null);

    if (!email || !password) {
      setLoginMessage({
        type: 'error',
        text: "Por favor, preencha email e senha."
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

        setLoginMessage({
          type: 'error',
          text: errorMessage
        });
        return;
      }

      if (!data.user || !data.session) {
        console.error("Login sem dados de usuário/sessão");
        setLoginMessage({
          type: 'error',
          text: "Erro ao obter dados do usuário"
        });
        return;
      }

      console.log("Login bem sucedido:", data);
      setLoginMessage({
        type: 'success',
        text: "Login realizado com sucesso! Redirecionando..."
      });

      // Aguarda 1.5 segundos para mostrar a mensagem antes de redirecionar
      setTimeout(() => {
        // Força uma atualização da página e redireciona para o dashboard
        window.location.href = '/dashboard';
      }, 1500);
      
    } catch (error: any) {
      console.error("Erro inesperado no login:", error);
      setLoginMessage({
        type: 'error',
        text: "Ocorreu um erro inesperado. Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>

      {loginMessage && (
        <div 
          className={`mt-4 p-3 rounded text-center ${
            loginMessage.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {loginMessage.text}
        </div>
      )}
    </form>
  );
}
