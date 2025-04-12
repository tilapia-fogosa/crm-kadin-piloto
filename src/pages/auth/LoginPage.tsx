
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Lock } from "lucide-react";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();
  const { session, isLoading } = useAuth();

  console.log('Renderizando LoginPage:', { hasSession: !!session, isLoading });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Iniciando processo de login");
    
    setLoginError(null);

    if (!email || !password) {
      console.log("Campos vazios detectados");
      setLoginError("Por favor, preencha email e senha.");
      return;
    }

    setLoading(true);
    console.log("Tentando login para:", email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erro no login:", error);
        let errorMessage = "Email ou senha incorretos";
        
        if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email ainda não confirmado";
        }
        
        setLoginError(errorMessage);
      } else {
        console.log("Login bem sucedido:", data.user?.id);
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta!",
        });
        // Não precisamos redirecionar aqui, o AuthContext fará isso
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      setLoginError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AuthLayout>
    );
  }

  // Se já estiver logado, não mostra o formulário de login
  if (session) {
    return null;
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
