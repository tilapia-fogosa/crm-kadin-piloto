
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface RegisterFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  toast: any;
  resetForm: () => void;
}

export function RegisterForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  setLoading,
  toast,
  resetForm,
}: RegisterFormProps) {
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

      if (authData.user) {
        const { error: systemUserError } = await supabase
          .from('system_users')
          .insert([
            {
              id: authData.user.id,
              email: email,
              name: email.split('@')[0],
              active: true
            }
          ]);

        if (systemUserError) {
          console.error("Erro ao criar system user:", systemUserError);
        }
      }

      console.log("Cadastro bem sucedido:", authData);
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para confirmar o cadastro.",
      });
      
      resetForm();
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

  return (
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
  );
}
