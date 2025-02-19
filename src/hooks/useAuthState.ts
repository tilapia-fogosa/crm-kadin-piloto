
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

  const { data: session, isLoading: isCheckingSession } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Sessão atual:", session);
      return session;
    },
  });

  useEffect(() => {
    // Se já tiver uma sessão e estiver na página de auth, redireciona para o dashboard
    if (session && location.pathname === '/auth') {
      console.log("Sessão existente detectada na página de auth, redirecionando para dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [session, navigate, location]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Evento de autenticação:", event, "Sessão:", currentSession);
      
      if (event === 'SIGNED_IN' && currentSession) {
        console.log("Usuário logado com sucesso, forçando redirecionamento para dashboard");
        // Forçar atualização do estado antes do redirecionamento
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        });
        
        // Pequeno delay para garantir que o toast seja mostrado
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 100);
      } else if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !currentSession)) {
        console.log("Sessão expirada ou usuário deslogado");
        if (location.pathname !== '/auth') {
          toast({
            title: "Sessão expirada",
            description: "Sua sessão expirou. Por favor, faça login novamente.",
          });
          navigate("/auth", { replace: true });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, location]);

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
