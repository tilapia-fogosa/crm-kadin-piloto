
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useAuthState() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Verifica sessão inicial apenas para proteção de rotas
  const { data: session, isLoading: isCheckingSession } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Verificação inicial de sessão:", session);
      return session;
    },
  });

  // Efeito para proteção de rotas - redireciona para dashboard se já estiver logado e tentar acessar /auth
  useEffect(() => {
    if (session && location.pathname === '/auth') {
      console.log("Tentativa de acesso à página de auth com sessão ativa, redirecionando para dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [session, location.pathname, navigate]);

  // Gerenciamento de eventos de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Evento de autenticação:", event);
      
      // Tratamento específico para login bem-sucedido - removido toast de login
      if (event === 'SIGNED_IN' && currentSession) {
        console.log("Login realizado com sucesso");
        navigate("/dashboard", { replace: true });
      } 
      // Tratamento de logout ou expiração de sessão - mantido por ser crítico
      else if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !currentSession)) {
        console.log("Logout ou sessão expirada");
        if (location.pathname !== '/auth') {
          toast({
            title: "Sessão expirada",
            description: "Sua sessão expirou. Por favor, faça login novamente.",
          });
          navigate("/auth", { replace: true });
        }
      }
      // Ignora INITIAL_SESSION para evitar redirecionamentos desnecessários
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, location.pathname]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setLoading(false);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    setLoading,
    session,
    isCheckingSession,
    navigate,
    toast,
    resetForm
  };
}
