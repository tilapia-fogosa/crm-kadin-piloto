
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useAuthState() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
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
    // Inscreve-se para mudanças na sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Evento de autenticação:", event);
      
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !currentSession) {
        console.log("Sessão expirada ou usuário deslogado");
        toast({
          title: "Sessão expirada",
          description: "Sua sessão expirou. Por favor, faça login novamente.",
        });
        navigate("/auth");
      }
    });

    // Cleanup da inscrição quando o componente for desmontado
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

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
