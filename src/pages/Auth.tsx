
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { WhatsappIcon } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para a página inicial...",
      });

      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (error: any) {
      console.error("Erro no login:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMessage("Por favor, insira seu email para recuperar a senha.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#31264] p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-bold text-[#2C136C]">
            Bem-vindo
          </CardTitle>
          <CardDescription className="text-center text-[#3D0C58]">
            Entre com sua conta para acessar o sistema
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#2C136C]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-[#6858C7] focus:ring-[#6858C7]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#2C136C]">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-[#6858C7] focus:ring-[#6858C7]"
              />
            </div>
            <Button
              type="button"
              variant="link"
              onClick={handleResetPassword}
              className="text-[#6858C7] hover:text-[#2C136C] p-0 h-auto font-normal text-sm"
            >
              Esqueceu sua senha?
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              className="w-full bg-[#2C136C] hover:bg-[#3D0C58] text-white" 
              type="submit" 
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <Button
        variant="ghost"
        className="mt-4 text-white hover:text-white/80"
        onClick={() => window.open('https://wa.me/5544999245040', '_blank')}
      >
        <WhatsappIcon className="w-4 h-4 mr-2" />
        Não tem usuário? Fale conosco
      </Button>
    </div>
  );
}
