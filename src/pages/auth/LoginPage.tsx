
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Lock } from "lucide-react";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();

  console.log('LoginPage: Renderizando', { 
    hasSession: !!session, 
    isLoading,
    currentPath: window.location.pathname
  });

  // Essa verificação garante que não vamos redirecionar duas vezes
  // O redirecionamento primário é feito pelo ProtectedRoute
  useEffect(() => {
    if (session && !isLoading) {
      console.log('LoginPage: Usuário já autenticado, redirecionamento será feito pelo ProtectedRoute');
    }
  }, [session, isLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("LoginPage: Iniciando processo de login");
    
    setLoginError(null);

    if (!email || !password) {
      console.log("LoginPage: Campos vazios detectados");
      setLoginError("Por favor, preencha email e senha.");
      return;
    }

    setLoading(true);
    console.log("LoginPage: Tentando login para:", email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("LoginPage: Erro no login:", error);
        let errorMessage = "Email ou senha incorretos";
        
        if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email ainda não confirmado";
        }
        
        setLoginError(errorMessage);
        setLoading(false);
      } else {
        console.log("LoginPage: Login bem-sucedido:", data.session ? "Sessão válida" : "Sem sessão");
        
        // A redireção será feita pelo AuthContext via onAuthStateChange
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando...",
        });
        
        // Mantenha o loading ativo brevemente para dar tempo ao redirecionamento
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    } catch (error) {
      console.error("LoginPage: Erro inesperado:", error);
      setLoginError("Ocorreu um erro inesperado. Tente novamente.");
      setLoading(false);
    }
  };

  // Se estiver carregando ou já tiver sessão, mostra o loader
  // Esta verificação impede que o formulário de login seja renderizado durante o redirecionamento
  if (isLoading || (session && window.location.pathname === '/auth')) {
    return (
      <AuthLayout>
        <div className="flex flex-col justify-center items-center p-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-center text-sm">
            {session ? "Redirecionando..." : "Verificando autenticação..."}
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
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
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {loginError && (
          <div className="p-3 rounded text-center bg-red-100 text-red-800 border border-red-300">
            {loginError}
          </div>
        )}

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
      </form>
    </AuthLayout>
  );
}
