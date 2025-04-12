
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Iniciando processo de alteração de senha');
    
    if (password !== confirmPassword) {
      console.log('Senhas não coincidem');
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      console.log('Senha muito curta');
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (!session) {
      console.log('Sessão expirada');
      toast({
        title: "Erro",
        description: "Sessão expirada. Por favor, faça login novamente.",
        variant: "destructive",
      });
      navigate("/auth", { replace: true });
      return;
    }

    setLoading(true);
    try {
      console.log('Atualizando senha do usuário');
      // Atualiza a senha
      const { error: passwordError } = await supabase.auth.updateUser({
        password: password,
      });

      if (passwordError) {
        console.error('Erro ao atualizar senha:', passwordError);
        throw passwordError;
      }

      console.log('Senha atualizada com sucesso, atualizando flag must_change_password');
      // Atualiza o flag must_change_password no perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', session.user.id);

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        throw profileError;
      }

      console.log('Perfil atualizado com sucesso');
      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso",
      });

      // Pequeno atraso para garantir que os estados sejam atualizados corretamente
      setTimeout(() => {
        // Redireciona para o dashboard usando o navigate
        navigate("/dashboard", { replace: true });
      }, 500);
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast({
        title: "Erro",
        description: "Erro ao alterar senha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">Alterar Senha</h1>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nova Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
              minLength={6}
              disabled={loading}
              placeholder="******"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10"
              required
              minLength={6}
              disabled={loading}
              placeholder="******"
            />
          </div>
        </div>
      </div>

      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Alterando...
          </>
        ) : (
          "Alterar Senha"
        )}
      </Button>
    </form>
  );
}
